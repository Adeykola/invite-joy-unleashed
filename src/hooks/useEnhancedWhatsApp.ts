
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppMedia {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  media_type: 'image' | 'video' | 'audio' | 'document';
  upload_status: 'pending' | 'uploaded' | 'failed';
}

export interface WhatsAppContact {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  tags: string[];
  custom_fields?: any;
  is_active: boolean;
  last_message_at?: string;
}

export interface MessageQueue {
  id: string;
  recipient_phone: string;
  message_content: string;
  media_id?: string;
  personalization_data?: any;
  scheduled_for?: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  error_message?: string;
  sent_at?: string;
}

export const useEnhancedWhatsApp = () => {
  const [connectionType, setConnectionType] = useState<'web' | 'business_api'>('web');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch WhatsApp session with enhanced data
  const { data: session, isLoading: sessionLoading, refetch: refetchSession } = useQuery({
    queryKey: ['enhanced-whatsapp-session'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Fetch media uploads
  const { data: mediaUploads, refetch: refetchMedia } = useQuery({
    queryKey: ['whatsapp-media'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('whatsapp_media_uploads')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WhatsAppMedia[];
    },
  });

  // Fetch contacts
  const { data: contacts, refetch: refetchContacts } = useQuery({
    queryKey: ['whatsapp-contacts'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as WhatsAppContact[];
    },
  });

  // Fetch message queue
  const { data: messageQueue, refetch: refetchQueue } = useQuery({
    queryKey: ['whatsapp-message-queue'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('whatsapp_message_queue')
        .select(`
          *,
          media:whatsapp_media_uploads(*)
        `)
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as MessageQueue[];
    },
  });

  // Initialize connection with type selection
  const initializeConnection = useMutation({
    mutationFn: async (type: 'web' | 'business_api') => {
      setIsConnecting(true);
      setConnectionType(type);
      setQrCode(null);

      const { data, error } = await supabase.functions.invoke('whatsapp-enhanced', {
        body: { 
          action: 'initialize',
          connection_type: type
        }
      });

      if (error) throw error;

      if (data.qrCode && type === 'web') {
        setQrCode(data.qrCode);
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.status === 'connected') {
        toast({
          title: "WhatsApp Connected!",
          description: `Your WhatsApp ${connectionType === 'web' ? 'Web' : 'Business API'} is now connected.`,
        });
        refetchSession();
      }
    },
    onError: (error: any) => {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to WhatsApp. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsConnecting(false);
    }
  });

  // Upload media file
  const uploadMedia = useMutation({
    mutationFn: async (file: File) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Validate file
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 50MB');
      }

      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/x-msvideo',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Unsupported file type');
      }

      // Determine media type
      let media_type: 'image' | 'video' | 'audio' | 'document';
      if (file.type.startsWith('image/')) media_type = 'image';
      else if (file.type.startsWith('video/')) media_type = 'video';
      else if (file.type.startsWith('audio/')) media_type = 'audio';
      else media_type = 'document';

      // Upload to Supabase storage
      const fileName = `${user.user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('whatsapp-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save to database
      const { data: mediaData, error: dbError } = await supabase
        .from('whatsapp_media_uploads')
        .insert({
          user_id: user.user.id,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          media_type,
          upload_status: 'uploaded'
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return mediaData;
    },
    onSuccess: () => {
      toast({
        title: "Media Uploaded",
        description: "Your media file has been uploaded successfully!",
      });
      refetchMedia();
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload media file.",
        variant: "destructive",
      });
    }
  });

  // Send message with media support
  const sendMessage = useMutation({
    mutationFn: async (messageData: {
      to: string | string[];
      message: string;
      media_id?: string;
      personalization_data?: any;
      scheduled_for?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const recipients = Array.isArray(messageData.to) ? messageData.to : [messageData.to];
      
      // Add messages to queue
      const queueItems = recipients.map(phone => ({
        user_id: user.user.id,
        recipient_phone: phone,
        message_content: messageData.message,
        media_id: messageData.media_id || null,
        personalization_data: messageData.personalization_data || null,
        scheduled_for: messageData.scheduled_for || null
      }));

      const { data, error } = await supabase
        .from('whatsapp_message_queue')
        .insert(queueItems)
        .select();

      if (error) throw error;

      // Process messages immediately if not scheduled
      if (!messageData.scheduled_for) {
        const { data: processData, error: processError } = await supabase.functions.invoke('whatsapp-enhanced', {
          body: {
            action: 'process_queue',
            queue_ids: data.map(item => item.id)
          }
        });

        if (processError) throw processError;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      const recipientCount = Array.isArray(variables.to) ? variables.to.length : 1;
      toast({
        title: "Messages Queued",
        description: `${recipientCount} message(s) have been queued for sending.`,
      });
      refetchQueue();
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to queue messages.",
        variant: "destructive",
      });
    }
  });

  // Add contact
  const addContact = useMutation({
    mutationFn: async (contactData: {
      name: string;
      phone_number: string;
      email?: string;
      tags?: string[];
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .insert({
          user_id: user.user.id,
          ...contactData,
          tags: contactData.tags || []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Contact Added",
        description: "Contact has been added successfully!",
      });
      refetchContacts();
    },
    onError: (error: any) => {
      toast({
        title: "Add Contact Failed",
        description: error.message || "Failed to add contact.",
        variant: "destructive",
      });
    }
  });

  return {
    // Session data
    session,
    sessionLoading,
    connectionType,
    isConnected: session?.status === 'connected',
    qrCode,
    isConnecting,

    // Media
    mediaUploads: mediaUploads || [],
    uploadMedia: uploadMedia.mutate,
    isUploadingMedia: uploadMedia.isPending,

    // Contacts
    contacts: contacts || [],
    addContact: addContact.mutate,
    isAddingContact: addContact.isPending,

    // Messaging
    messageQueue: messageQueue || [],
    sendMessage: sendMessage.mutate,
    isSendingMessage: sendMessage.isPending,

    // Actions
    initializeConnection: initializeConnection.mutate,
    refetchSession,
    refetchMedia,
    refetchContacts,
    refetchQueue
  };
};

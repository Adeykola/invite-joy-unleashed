
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface CommunicationLog {
  id: string;
  recipient_email?: string;
  recipient_phone?: string;
  message_type: 'email' | 'whatsapp' | 'sms';
  subject?: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  created_at: string;
}

export const useRealCommunication = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: communicationLogs, isLoading } = useQuery({
    queryKey: ["communication-logs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("communication_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CommunicationLog[];
    },
    enabled: !!user?.id,
  });

  const sendEmailMutation = useMutation({
    mutationFn: async ({
      eventId,
      recipients,
      subject,
      content,
      templateId
    }: {
      eventId?: string;
      recipients: string[];
      subject: string;
      content: string;
      templateId?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      // Log the communication attempt
      const communicationPromises = recipients.map(email => 
        supabase.from("communication_logs").insert({
          user_id: userData.user?.id,
          event_id: eventId,
          recipient_email: email,
          message_type: 'email',
          template_id: templateId,
          subject,
          content,
          status: 'pending'
        })
      );

      await Promise.all(communicationPromises);

      // Call the Resend edge function
      const { data, error } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          recipients,
          subject,
          content,
          eventId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-logs"] });
      toast({
        title: "Emails Sent",
        description: "Email invitations have been sent successfully.",
      });
    },
    onError: (error) => {
      console.error("Email sending error:", error);
      toast({
        title: "Email Failed",
        description: "Failed to send email invitations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendWhatsAppMutation = useMutation({
    mutationFn: async ({
      eventId,
      recipients,
      content,
      mediaId
    }: {
      eventId?: string;
      recipients: Array<{ phone: string; name: string }>;
      content: string;
      mediaId?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      // Log the communication attempts
      const communicationPromises = recipients.map(recipient => 
        supabase.from("communication_logs").insert({
          user_id: userData.user?.id,
          event_id: eventId,
          recipient_phone: recipient.phone,
          message_type: 'whatsapp',
          content,
          status: 'pending'
        })
      );

      await Promise.all(communicationPromises);

      // Call the WhatsApp edge function
      const { data, error } = await supabase.functions.invoke('whatsapp-enhanced', {
        body: {
          action: 'send_bulk_message',
          recipients,
          message: content,
          mediaId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-logs"] });
      toast({
        title: "WhatsApp Messages Sent",
        description: "WhatsApp messages have been sent successfully.",
      });
    },
    onError: (error) => {
      console.error("WhatsApp sending error:", error);
      toast({
        title: "WhatsApp Failed",
        description: "Failed to send WhatsApp messages. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    communicationLogs,
    isLoading,
    sendEmail: sendEmailMutation.mutate,
    sendWhatsApp: sendWhatsAppMutation.mutate,
    isSendingEmail: sendEmailMutation.isPending,
    isSendingWhatsApp: sendWhatsAppMutation.isPending,
  };
};

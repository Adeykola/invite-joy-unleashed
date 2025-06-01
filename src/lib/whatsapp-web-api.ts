
import { supabase } from "@/integrations/supabase/client";

export interface WhatsAppWebSession {
  id: string;
  qrCode?: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  displayName?: string;
  phoneNumber?: string;
  lastConnected?: string;
}

export interface MessagePayload {
  to: string;
  message: string;
  recipientData?: Record<string, any>;
}

export interface BroadcastMessage {
  sessionId: string;
  recipients: MessagePayload[];
  templateId?: string;
  eventId?: string;
}

export class WhatsAppWebAPIService {
  private static instance: WhatsAppWebAPIService;
  
  public static getInstance(): WhatsAppWebAPIService {
    if (!WhatsAppWebAPIService.instance) {
      WhatsAppWebAPIService.instance = new WhatsAppWebAPIService();
    }
    return WhatsAppWebAPIService.instance;
  }

  private constructor() {}

  /**
   * Initialize a new WhatsApp Web session
   */
  async initializeSession(): Promise<{ sessionId: string; qrCode: string }> {
    try {
      console.log('Initializing WhatsApp Web session...');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-connect', {
        body: { 
          method: 'init',
          apiType: 'web' 
        }
      });

      if (error) {
        console.error('Error initializing session:', error);
        throw new Error(error.message || 'Failed to initialize WhatsApp session');
      }

      if (!data?.sessionId || !data?.qrCode) {
        throw new Error('Invalid response from WhatsApp service');
      }

      console.log('Session initialized successfully:', data.sessionId);
      return {
        sessionId: data.sessionId,
        qrCode: data.qrCode
      };
    } catch (error) {
      console.error('Failed to initialize WhatsApp session:', error);
      throw error;
    }
  }

  /**
   * Check the status of a WhatsApp session
   */
  async checkSessionStatus(sessionId: string): Promise<WhatsAppWebSession> {
    try {
      console.log('Checking session status for:', sessionId);
      
      const { data, error } = await supabase.functions.invoke('whatsapp-status', {
        body: { sessionId }
      });

      if (error) {
        console.error('Error checking session status:', error);
        throw new Error(error.message || 'Failed to check session status');
      }

      return {
        id: sessionId,
        status: data.status || 'disconnected',
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        lastConnected: data.lastConnected,
        qrCode: data.qrCode
      };
    } catch (error) {
      console.error('Failed to check session status:', error);
      throw error;
    }
  }

  /**
   * Disconnect a WhatsApp session
   */
  async disconnectSession(sessionId: string): Promise<void> {
    try {
      console.log('Disconnecting session:', sessionId);
      
      const { error } = await supabase.functions.invoke('whatsapp-connect', {
        body: { 
          method: 'disconnect',
          sessionId 
        }
      });

      if (error) {
        console.error('Error disconnecting session:', error);
        throw new Error(error.message || 'Failed to disconnect session');
      }

      console.log('Session disconnected successfully');
    } catch (error) {
      console.error('Failed to disconnect session:', error);
      throw error;
    }
  }

  /**
   * Send a single message
   */
  async sendMessage(sessionId: string, payload: MessagePayload): Promise<{ messageId: string; status: string }> {
    try {
      console.log('Sending message via session:', sessionId, 'to:', payload.to);
      
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: {
          sessionId,
          to: payload.to,
          message: payload.message,
          recipientData: payload.recipientData
        }
      });

      if (error) {
        console.error('Error sending message:', error);
        throw new Error(error.message || 'Failed to send message');
      }

      console.log('Message sent successfully:', data.messageId);
      return {
        messageId: data.messageId || 'unknown',
        status: data.status || 'sent'
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Send broadcast messages
   */
  async sendBroadcast(broadcast: BroadcastMessage): Promise<{ broadcastId: string; status: string }> {
    try {
      console.log('Sending broadcast with', broadcast.recipients.length, 'recipients');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: {
          method: 'broadcast',
          sessionId: broadcast.sessionId,
          recipients: broadcast.recipients,
          templateId: broadcast.templateId,
          eventId: broadcast.eventId
        }
      });

      if (error) {
        console.error('Error sending broadcast:', error);
        throw new Error(error.message || 'Failed to send broadcast');
      }

      console.log('Broadcast sent successfully:', data.broadcastId);
      return {
        broadcastId: data.broadcastId || 'unknown',
        status: data.status || 'sent'
      };
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      throw error;
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): { isValid: boolean; formatted?: string; error?: string } {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check minimum length
    if (cleaned.length < 10) {
      return { isValid: false, error: 'Phone number too short' };
    }
    
    // Check maximum length
    if (cleaned.length > 15) {
      return { isValid: false, error: 'Phone number too long' };
    }
    
    // Format with country code if missing
    let formatted = cleaned;
    if (!formatted.startsWith('1') && formatted.length === 10) {
      formatted = '1' + formatted; // Assume US if no country code
    }
    
    return { 
      isValid: true, 
      formatted: '+' + formatted 
    };
  }

  /**
   * Process template with recipient data
   */
  processTemplate(template: string, recipientData: Record<string, any>): string {
    let processed = template;
    
    // Replace recipient placeholders
    Object.entries(recipientData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value?.toString() || '');
    });
    
    return processed;
  }

  /**
   * Get session info from database
   */
  async getSessionFromDB(sessionId: string): Promise<WhatsAppWebSession | null> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        status: data.status,
        displayName: data.display_name,
        phoneNumber: data.phone_number,
        lastConnected: data.last_connected_at
      };
    } catch (error) {
      console.error('Error fetching session from DB:', error);
      return null;
    }
  }
}

// Export singleton instance
export const whatsappWebAPI = WhatsAppWebAPIService.getInstance();

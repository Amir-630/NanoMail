import { useState, useCallback, useEffect, useRef } from 'react';

export interface EmailConfig {
  user: string;
  password: string;
  imap: {
    host: string;
    port: number;
    secure: boolean;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
  };
}

export interface EmailMessage {
  id?: string;
  messageId?: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  date: string;
  text?: string;
  html?: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
}

export interface EmailAPIResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for interacting with Electron IPC email API
 * Usage:
 *   const { fetchMessages, sendEmail, isConnected } = useEmailAPI();
 *   const result = await fetchMessages('INBOX', 50);
 */
export const useEmailAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const electronAPIRef = useRef<any>(null);

  // Initialize Electron API reference
  useEffect(() => {
    if (typeof window !== 'undefined' && 'electronAPI' in window) {
      electronAPIRef.current = (window as any).electronAPI;
      // Check initial connection status
      checkConnectionStatus();
    }
  }, []);

  /**
   * Check if connected to email server
   */
  const checkConnectionStatus = useCallback(async () => {
    try {
      if (electronAPIRef.current?.isConnected) {
        const connected = await electronAPIRef.current.isConnected();
        setIsConnected(connected);
      }
    } catch (err) {
      console.error('Failed to check connection status:', err);
    }
  }, []);

  /**
   * Connect to IMAP server
   */
  const connectToImap = useCallback(
    async (config: EmailConfig): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!electronAPIRef.current?.connectToImap) {
          throw new Error('Electron API not available');
        }

        const result = await electronAPIRef.current.connectToImap(config);
        setIsConnected(true);
        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setIsConnected(false);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Disconnect from email server
   */
  const disconnect = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!electronAPIRef.current?.disconnect) {
        throw new Error('Electron API not available');
      }

      await electronAPIRef.current.disconnect();
      setIsConnected(false);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get all email folders
   */
  const getFolders = useCallback(
    async (): Promise<
      Array<{
        name: string;
        path: string;
        flags?: string[];
      }>
    > => {
      setIsLoading(true);
      setError(null);

      try {
        if (!electronAPIRef.current?.getFolders) {
          throw new Error('Electron API not available');
        }

        return await electronAPIRef.current.getFolders();
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Fetch messages from a folder
   */
  const fetchMessages = useCallback(
    async (folder: string = 'INBOX', limit: number = 50): Promise<EmailMessage[]> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!electronAPIRef.current?.fetchMessages) {
          throw new Error('Electron API not available');
        }

        const messages = await electronAPIRef.current.fetchMessages(folder, limit);
        return messages;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Send an email
   */
  const sendEmail = useCallback(
    async (emailDetails: {
      to: string | string[];
      cc?: string | string[];
      bcc?: string | string[];
      subject: string;
      text?: string;
      html?: string;
      attachments?: Array<{
        filename: string;
        content?: Buffer | string;
        path?: string;
      }>;
    }): Promise<{ messageId: string; response: string }> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!electronAPIRef.current?.sendEmail) {
          throw new Error('Electron API not available');
        }

        const result = await electronAPIRef.current.sendEmail(emailDetails);
        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Mark message as read/unread
   */
  const markAsRead = useCallback(
    async (folder: string, messageId: number, read: boolean = true): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!electronAPIRef.current?.markAsRead) {
          throw new Error('Electron API not available');
        }

        await electronAPIRef.current.markAsRead(folder, messageId, read);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Delete message
   */
  const deleteMessage = useCallback(
    async (folder: string, messageId: number): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!electronAPIRef.current?.deleteMessage) {
          throw new Error('Electron API not available');
        }

        await electronAPIRef.current.deleteMessage(folder, messageId);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Subscribe to email events
   */
  const subscribeToEvents = useCallback(
    (callback: (event: any) => void) => {
      if (!electronAPIRef.current?.onEmailEvent) {
        return () => {};
      }

      // Subscribe to new message events
      const unsubscribeNewMessage = electronAPIRef.current.onEmailEvent(
        'email:new-message',
        (_event: any, data: any) => {
          callback({ type: 'new-message', data });
        }
      );

      // Subscribe to error events
      const unsubscribeError = electronAPIRef.current.onEmailEvent(
        'email:error',
        (_event: any, data: any) => {
          callback({ type: 'error', data });
        }
      );

      // Return unsubscribe function
      return () => {
        unsubscribeNewMessage();
        unsubscribeError();
      };
    },
    []
  );

  return {
    // State
    isLoading,
    error,
    isConnected,

    // Methods
    connectToImap,
    disconnect,
    getFolders,
    fetchMessages,
    sendEmail,
    markAsRead,
    deleteMessage,
    subscribeToEvents,
    checkConnectionStatus,
  };
};

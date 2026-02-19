import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';

/**
 * Secure API exposed to the renderer process (React frontend)
 * This is protected via context isolation
 */
const electronAPI = {
  /**
   * Connect to IMAP server
   */
  connectToImap: (config: {
    user: string;
    password: string;
    imap: { host: string; port: number; secure: boolean };
    smtp: { host: string; port: number; secure: boolean };
  }): Promise<boolean> => {
    return ipcRenderer.invoke('email:connect-imap', config);
  },

  /**
   * Disconnect from email server
   */
  disconnect: (): Promise<void> => {
    return ipcRenderer.invoke('email:disconnect');
  },

  /**
   * Get all email folders
   */
  getFolders: (): Promise<
    Array<{
      name: string;
      path: string;
      flags?: string[];
    }>
  > => {
    return ipcRenderer.invoke('email:get-folders');
  },

  /**
   * Fetch messages from a folder
   */
  fetchMessages: (
    folder?: string,
    limit?: number
  ): Promise<
    Array<{
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
    }>
  > => {
    return ipcRenderer.invoke('email:fetch-messages', {
      folder: folder || 'INBOX',
      limit: limit || 50,
    });
  },

  /**
   * Send an email
   */
  sendEmail: (details: {
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
    return ipcRenderer.invoke('email:send', details);
  },

  /**
   * Mark message as read
   */
  markAsRead: (
    folder: string,
    messageId: number,
    read?: boolean
  ): Promise<void> => {
    return ipcRenderer.invoke('email:mark-as-read', {
      folder,
      messageId,
      read: read !== false,
    });
  },

  /**
   * Delete message
   */
  deleteMessage: (folder: string, messageId: number): Promise<void> => {
    return ipcRenderer.invoke('email:delete', { folder, messageId });
  },

  /**
   * Check connection status
   */
  isConnected: (): Promise<boolean> => {
    return ipcRenderer.invoke('email:is-connected');
  },

  /**
   * Listen to email events from main process
   */
  onEmailEvent: (
    channel: 'email:new-message' | 'email:error',
    callback: (event: IpcRendererEvent, data: any) => void
  ): (() => void) => {
    ipcRenderer.on(channel, callback);
    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(channel, callback);
    };
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type definition for TypeScript
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
}

export {};

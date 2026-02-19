/**
 * Email Types and Interfaces
 * Shared type definitions for the entire application
 */

/**
 * Email server configuration
 */
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

/**
 * Email message structure
 */
export interface EmailMessage {
  id?: string;
  messageId?: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  date: Date | string;
  text?: string;
  html?: string;
  read?: boolean;
  attachments: EmailAttachment[];
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  data?: Buffer;
}

/**
 * Folder/Mailbox information
 */
export interface FolderInfo {
  name: string;
  path: string;
  children?: FolderInfo[];
  flags?: string[];
  specialUse?: string; // '\All', '\Archive', '\Drafts', '\Important', '\Junk', '\Sent', '\Trash'
}

/**
 * Email send details
 */
export interface SendEmailDetails {
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
}

/**
 * Send email response
 */
export interface SendEmailResponse {
  messageId: string;
  response: string;
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Electron API type definitions
 */
export interface ElectronAPI {
  /**
   * Connect to IMAP server
   */
  connectToImap: (config: EmailConfig) => Promise<boolean>;

  /**
   * Disconnect from server
   */
  disconnect: () => Promise<void>;

  /**
   * Get all folders
   */
  getFolders: () => Promise<FolderInfo[]>;

  /**
   * Fetch messages from a folder
   */
  fetchMessages: (folder?: string, limit?: number) => Promise<EmailMessage[]>;

  /**
   * Send an email
   */
  sendEmail: (details: SendEmailDetails) => Promise<SendEmailResponse>;

  /**
   * Mark message as read/unread
   */
  markAsRead: (folder: string, messageId: number, read?: boolean) => Promise<void>;

  /**
   * Delete a message
   */
  deleteMessage: (folder: string, messageId: number) => Promise<void>;

  /**
   * Check if connected
   */
  isConnected: () => Promise<boolean>;

  /**
   * Listen to email events
   */
  onEmailEvent: (
    channel: 'email:new-message' | 'email:error',
    callback: (event: any, data: any) => void
  ) => () => void;
}

/**
 * Window interface extended with electronAPI
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

/**
 * IPC Message types (for internal use)
 */
export interface IpcMessage<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

/**
 * Email event types
 */
export enum EmailEventType {
  NEW_MESSAGE = 'email:new-message',
  MESSAGE_READ = 'email:message-read',
  MESSAGE_SENT = 'email:message-sent',
  CONNECTION_CHANGED = 'email:connection-changed',
  ERROR = 'email:error',
}

/**
 * Email event data
 */
export interface EmailEvent {
  type: EmailEventType;
  data: any;
  timestamp: number;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  limit: number;
  offset: number;
}

/**
 * Filter options for email list
 */
export interface EmailFilterOptions {
  read?: boolean;
  folder?: string;
  from?: string;
  to?: string;
  subject?: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasAttachments?: boolean;
}

/**
 * Email sync status
 */
export interface SyncStatus {
  isSyncing: boolean;
  lastSync: Date | null;
  messagesCount: number;
  error?: string;
}

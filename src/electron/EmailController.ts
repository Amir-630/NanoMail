import { ImapFlow } from 'imapflow';
import nodemailer, { type Transporter } from 'nodemailer';
import { simpleParser } from 'mailparser';
import { Readable } from 'stream';

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
  date: Date;
  text?: string;
  html?: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    data?: Buffer;
  }>;
}

export interface FolderInfo {
  name: string;
  path: string;
  children?: FolderInfo[];
  flags?: string[];
}

export class EmailController {
  private imapClient: ImapFlow | null = null;
  private smtpTransporter: Transporter | null = null;
  private config: EmailConfig | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.imapClient = null;
    this.smtpTransporter = null;
  }

  /**
   * Initialize IMAP connection with provided credentials
   */
  async connectToImap(config: EmailConfig): Promise<boolean> {
    try {
      this.config = config;

      // Create IMAP connection
      this.imapClient = new ImapFlow({
        host: config.imap.host,
        port: config.imap.port,
        secure: config.imap.secure,
        auth: {
          user: config.user,
          pass: config.password,
        },
        logger: false, // Set to true for debugging
        emitLogs: false,
      });

      // Handle connection events
      this.imapClient.on('error', (err) => {
        console.error('IMAP Error:', err);
        this.isConnected = false;
      });

      this.imapClient.on('close', () => {
        console.log('IMAP connection closed');
        this.isConnected = false;
      });

      // Connect
      await this.imapClient.connect();
      this.isConnected = true;

      // Initialize SMTP transporter
      this.smtpTransporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.user,
          pass: config.password,
        },
      });

      // Verify SMTP connection
      await this.smtpTransporter.verify();

      console.log('Email connection established successfully');
      return true;
    } catch (error) {
      console.error('Failed to connect to email server:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from IMAP and close connections
   */
  async disconnect(): Promise<void> {
    try {
      if (this.imapClient) {
        await this.imapClient.logout();
        this.isConnected = false;
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  /**
   * Get all folders/mailboxes from the server
   */
  async getFolders(): Promise<FolderInfo[]> {
    if (!this.imapClient) {
      throw new Error('IMAP client not connected');
    }

    try {
      const mailboxes = await this.imapClient.list();
      return mailboxes.map((mb) => ({
        name: mb.name,
        path: mb.path,
        children: undefined,
        flags: mb.flags,
      }));
    } catch (error) {
      console.error('Failed to get folders:', error);
      throw error;
    }
  }

  /**
   * Fetch messages from a specific folder
   */
  async fetchMessages(
    folder: string = 'INBOX',
    limit: number = 50
  ): Promise<EmailMessage[]> {
    if (!this.imapClient) {
      throw new Error('IMAP client not connected');
    }

    const messages: EmailMessage[] = [];

    try {
      // Select mailbox
      const mailbox = await this.imapClient.mailboxOpen(folder);
      const totalMessages = mailbox.exists;

      // Fetch the latest messages (up to limit)
      const startSeq = Math.max(1, totalMessages - limit + 1);
      const endSeq = totalMessages;

      if (startSeq > endSeq) {
        return messages;
      }

      for await (const message of this.imapClient.fetch(
        `${startSeq}:${endSeq}`,
        { source: true }
      )) {
        try {
          const parsed = await simpleParser(message.source as Readable);

          const emailMessage: EmailMessage = {
            id: message.seq.toString(),
            messageId: parsed.messageId || '',
            subject: parsed.subject || '(No Subject)',
            from: parsed.from?.text || 'Unknown',
            to: parsed.to?.html ? this.extractEmails(parsed.to.text) : [],
            cc: parsed.cc ? this.extractEmails(parsed.cc.text) : [],
            bcc: parsed.bcc ? this.extractEmails(parsed.bcc.text) : [],
            date: parsed.date || new Date(),
            text: parsed.text || '',
            html: parsed.html || '',
            attachments: (parsed.attachments || []).map((att) => ({
              filename: att.filename || 'attachment',
              contentType: att.contentType || 'application/octet-stream',
              size: att.content?.length || 0,
              // Don't include data by default to reduce memory usage
            })),
          };

          messages.push(emailMessage);
        } catch (parseError) {
          console.error('Failed to parse message:', parseError);
          // Continue with next message
        }
      }

      return messages;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw error;
    }
  }

  /**
   * Send an email
   */
  async sendEmail(emailDetails: {
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
  }): Promise<{ messageId: string; response: string }> {
    if (!this.smtpTransporter) {
      throw new Error('SMTP connection not initialized');
    }

    if (!this.config) {
      throw new Error('Email config not set');
    }

    try {
      const result = await this.smtpTransporter.sendMail({
        from: this.config.user,
        to: emailDetails.to,
        cc: emailDetails.cc,
        bcc: emailDetails.bcc,
        subject: emailDetails.subject,
        text: emailDetails.text,
        html: emailDetails.html,
        attachments: emailDetails.attachments,
      });

      return {
        messageId: result.messageId || '',
        response: result.response || 'Email sent successfully',
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Mark message as read/unread
   */
  async markAsRead(
    folder: string,
    messageId: number,
    read: boolean = true
  ): Promise<void> {
    if (!this.imapClient) {
      throw new Error('IMAP client not connected');
    }

    try {
      await this.imapClient.mailboxOpen(folder);
      if (read) {
        await this.imapClient.messageFlagsAdd(messageId, ['\\Seen']);
      } else {
        await this.imapClient.messageFlagsRemove(messageId, ['\\Seen']);
      }
    } catch (error) {
      console.error('Failed to mark message:', error);
      throw error;
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(folder: string, messageId: number): Promise<void> {
    if (!this.imapClient) {
      throw new Error('IMAP client not connected');
    }

    try {
      await this.imapClient.mailboxOpen(folder);
      await this.imapClient.messageFlagsAdd(messageId, ['\\Deleted']);
      await this.imapClient.expunge();
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }

  /**
   * Check if connected
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Extract email addresses from a string
   */
  private extractEmails(emailString: string): string[] {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const matches = emailString.match(emailRegex);
    return matches || [];
  }
}

// Export singleton instance
export const emailController = new EmailController();

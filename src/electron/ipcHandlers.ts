import { ipcMain, type IpcMainInvokeEvent} from 'electron';
import { emailController, type EmailConfig } from './EmailController';

/**
 * Register all IPC handlers for email operations
 * These handlers receive calls from the renderer process and execute email logic
 */
export function setupIpcHandlers() {
  /**
   * Handle IMAP connection
   */
  ipcMain.handle(
    'email:connect-imap',
    async (_event: IpcMainInvokeEvent, config: EmailConfig): Promise<boolean> => {
      try {
        const result = await emailController.connectToImap(config);
        return result;
      } catch (error) {
        console.error('IPC: Failed to connect to IMAP:', error);
        throw new Error(`Failed to connect: ${(error as Error).message}`);
      }
    }
  );

  /**
   * Handle disconnection
   */
  ipcMain.handle(
    'email:disconnect',
    async (_event: IpcMainInvokeEvent): Promise<void> => {
      try {
        await emailController.disconnect();
      } catch (error) {
        console.error('IPC: Failed to disconnect:', error);
        throw error;
      }
    }
  );

  /**
   * Handle getting folders
   */
  ipcMain.handle(
    'email:get-folders',
    async (_event: IpcMainInvokeEvent) => {
      try {
        const folders = await emailController.getFolders();
        return folders;
      } catch (error) {
        console.error('IPC: Failed to get folders:', error);
        throw new Error(`Failed to get folders: ${(error as Error).message}`);
      }
    }
  );

  /**
   * Handle fetching messages
   */
  ipcMain.handle(
    'email:fetch-messages',
    async (
      _event: IpcMainInvokeEvent,
      { folder, limit }: { folder: string; limit: number }
    ) => {
      try {
        const messages = await emailController.fetchMessages(folder, limit);
        
        // Convert Date objects to ISO strings for serialization
        return messages.map((msg) => ({
          ...msg,
          date: msg.date.toISOString(),
        }));
      } catch (error) {
        console.error('IPC: Failed to fetch messages:', error);
        throw new Error(`Failed to fetch messages: ${(error as Error).message}`);
      }
    }
  );

  /**
   * Handle sending email
   */
  ipcMain.handle(
    'email:send',
    async (
      _event: IpcMainInvokeEvent,
      emailDetails: {
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
    ) => {
      try {
        const result = await emailController.sendEmail(emailDetails);
        return result;
      } catch (error) {
        console.error('IPC: Failed to send email:', error);
        throw new Error(`Failed to send email: ${(error as Error).message}`);
      }
    }
  );

  /**
   * Handle marking message as read
   */
  ipcMain.handle(
    'email:mark-as-read',
    async (
      _event: IpcMainInvokeEvent,
      { folder, messageId, read }: { folder: string; messageId: number; read: boolean }
    ) => {
      try {
        await emailController.markAsRead(folder, messageId, read);
      } catch (error) {
        console.error('IPC: Failed to mark message:', error);
        throw new Error(`Failed to mark message: ${(error as Error).message}`);
      }
    }
  );

  /**
   * Handle deleting message
   */
  ipcMain.handle(
    'email:delete',
    async (
      _event: IpcMainInvokeEvent,
      { folder, messageId }: { folder: string; messageId: number }
    ) => {
      try {
        await emailController.deleteMessage(folder, messageId);
      } catch (error) {
        console.error('IPC: Failed to delete message:', error);
        throw new Error(`Failed to delete message: ${(error as Error).message}`);
      }
    }
  );

  /**
   * Check connection status
   */
  ipcMain.handle(
    'email:is-connected',
    async (_event: IpcMainInvokeEvent): Promise<boolean> => {
      return emailController.isConnectedToServer();
    }
  );

  console.log('IPC handlers registered successfully');
}

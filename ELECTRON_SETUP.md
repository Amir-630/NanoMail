# Electron IPC Bridge Setup Guide

This document provides a comprehensive guide to the secure IPC (Inter-Process Communication) bridge for the nanoMail Electron email client.

## Architecture Overview

The Electron IPC bridge consists of three main layers:

```
┌─────────────────────────────────────────┐
│   React Frontend (Renderer Process)     │
│   - Uses useEmailAPI() hook             │
│   - Calls window.electronAPI methods    │
└──────────────┬──────────────────────────┘
               │ IPC Communication
┌──────────────▼──────────────────────────┐
│      Electron Preload Script            │
│   - contextBridge.exposeInMainWorld()   │
│   - Wraps ipcRenderer calls             │
└──────────────┬──────────────────────────┘
               │ Node.js/Electron APIs
┌──────────────▼──────────────────────────┐
│   Main Process (Node.js)                │
│   - ipcMain.handle() listeners          │
│   - EmailController (business logic)    │
│   - ImapFlow, Nodemailer, MailParser    │
└─────────────────────────────────────────┘
```

## File Structure

```
src/
├── electron/
│   ├── main.ts                # Main process entry point
│   ├── preload.ts             # Preload script with context bridge
│   ├── ipcHandlers.ts         # IPC handler registration
│   └── EmailController.ts     # Email operations controller
├── hooks/
│   └── useEmailAPI.ts         # React hook for email API
├── components/
│   └── email/
│       └── EmailAPIExample.tsx# Example component
└── types/
    └── index.ts               # TypeScript type definitions
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

This will install:
- `electron`: Desktop application framework
- `imapflow`: IMAP client for fetching emails
- `nodemailer`: Email sending library
- `mailparser`: Email parsing library

### 2. Build Configuration

The project uses:
- **Vite** for building the React frontend
- **TypeScript** for the Electron main process
- **Electron** as the desktop framework

#### Build Commands

```bash
# Development
npm run dev                 # Runs both Vite and Electron

# Individual commands
npm run dev:vite           # Just Vite dev server
npm run dev:electron       # Just Electron

# Production
npm run build              # Build both app and Electron main
npm run build:electron     # Build main process separately
```

### 3. Email Configuration

To connect to an email server, you need:

```typescript
const config: EmailConfig = {
  user: 'your-email@gmail.com',
  password: 'your-app-password', // Use app-specific password
  imap: {
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
  },
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
  },
};
```

### Gmail Setup
1. Enable 2-Factor Authentication in Gmail settings
2. Generate an App Password
3. Use this password in the configuration (NOT your Gmail password)

## API Reference

### useEmailAPI() Hook

```typescript
const { 
  fetchMessages, 
  sendEmail, 
  connectToImap,
  isLoading,
  error,
  isConnected
} = useEmailAPI();
```

#### Methods

##### `connectToImap(config: EmailConfig): Promise<boolean>`
Establish connection to IMAP server
```typescript
await connectToImap(config);
```

##### `fetchMessages(folder?: string, limit?: number): Promise<EmailMessage[]>`
Fetch emails from a folder
```typescript
const emails = await fetchMessages('INBOX', 50);
```

##### `sendEmail(details): Promise<{ messageId: string; response: string }>`
Send an email
```typescript
await sendEmail({
  to: 'recipient@example.com',
  subject: 'Hello',
  html: '<p>Email body</p>',
});
```

##### `markAsRead(folder: string, messageId: number, read?: boolean): Promise<void>`
Mark message as read/unread
```typescript
await markAsRead('INBOX', 1, true);
```

##### `deleteMessage(folder: string, messageId: number): Promise<void>`
Delete a message
```typescript
await deleteMessage('INBOX', 1);
```

##### `disconnect(): Promise<void>`
Disconnect from server
```typescript
await disconnect();
```

### State Properties

- `isLoading: boolean` - Whether an operation is in progress
- `error: Error | null` - Last error that occurred
- `isConnected: boolean` - Connection status

## React Component Example

```typescript
import { useEmailAPI } from '../hooks/useEmailAPI';

function MyComponent() {
  const { fetchMessages, isLoading, error } = useEmailAPI();

  const handleFetch = async () => {
    try {
      const emails = await fetchMessages('INBOX', 50);
      console.log('Fetched:', emails);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <button onClick={handleFetch} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Emails'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

## Security Features

### Context Isolation
- The preload script runs in an isolated context
- Renderer process cannot directly access Node.js APIs
- Only exposed methods through `window.electronAPI` are available

### IPC Messages
- All IPC communication is typed with TypeScript
- Messages are validated on both sides
- No arbitrary code execution is allowed

### No Node Integration
- `nodeIntegration` is disabled in BrowserWindow
- `enableRemoteModule` is disabled
- Process is sandboxed

## IPC Handler Setup

The main process registers handlers in `src/electron/ipcHandlers.ts`:

```typescript
ipcMain.handle('email:fetch-messages', async (event, { folder, limit }) => {
  try {
    const messages = await emailController.fetchMessages(folder, limit);
    return messages.map(msg => ({
      ...msg,
      date: msg.date.toISOString(), // Serialize Date for IPC
    }));
  } catch (error) {
    throw new Error(`Failed: ${error.message}`);
  }
});
```

## EmailController

The `EmailController` class handles all email operations:

### Connection
```typescript
const controller = new EmailController();
await controller.connectToImap(config);
```

### Fetch Emails
```typescript
const emails = await controller.fetchMessages('INBOX', 50);
```

### Send Email
```typescript
await controller.sendEmail({
  to: 'user@example.com',
  subject: 'Test',
  html: '<p>Hello</p>',
});
```

### Manage Messages
```typescript
await controller.markAsRead('INBOX', 1, true);
await controller.deleteMessage('INBOX', 1);
```

## Error Handling

All API calls can throw errors. Always use try-catch:

```typescript
try {
  const emails = await fetchMessages('INBOX');
} catch (error) {
  console.error('Failed to fetch:', error);
  // Handle error appropriately
}
```

Common errors:
- `IMAP client not connected` - Connect first
- `Invalid credentials` - Check email config
- `Failed to send email` - Check SMTP configuration

## Performance Tips

### 1. Limit Email Fetching
```typescript
// Only fetch recent 50 emails
const emails = await fetchMessages('INBOX', 50);
```

### 2. Cache Results
Store fetched emails in state to avoid refetching:
```typescript
const [cachedEmails, setCachedEmails] = useState<EmailMessage[]>([]);

const handleFetch = async () => {
  const emails = await fetchMessages('INBOX');
  setCachedEmails(emails); // Cache result
};
```

### 3. Lazy Load Attachments
Attachments are not loaded by default. Implement on-demand loading.

### 4. Batch Operations
For operations on multiple emails, consider batching to reduce IPC calls.

## Troubleshooting

### Electron won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### IPC handlers not registered
- Check that `setupIpcHandlers()` is called in `main.ts`
- Verify handler names match between preload and main process

### Email connection fails
- Verify email credentials
- Check that IMAP/SMTP ports are correct
- For Gmail, use app-specific password
- Ensure 2FA is enabled for Gmail

### Messages not fetching
- Verify IMAP connection is established
- Check folder name (usually 'INBOX')
- Look at console logs in DevTools

### Context Isolation errors
- Ensure `contextIsolation: true` in BrowserWindow
- Use only exposed API methods via `window.electronAPI`
- Don't try to access Node.js modules directly from renderer

## Development Tips

### Enable Logging
In `src/electron/EmailController.ts`, change:
```typescript
logger: false // Change to true for IMAP debug logging
```

### DevTools
DevTools opens automatically in development mode. Use it to:
- Inspect renderer process
- Check IPC messages in console
- Debug React components

### Hot Reload
- Vite handles hot reload for the React frontend
- Electron main process changes require manual restart

## Production Build

```bash
npm run build
```

This creates:
- `dist/app/` - React frontend bundle
- `dist/electron/` - Compiled main process

To package for distribution, use `electron-builder`:
```bash
npm install -D electron-builder
npx electron-builder
```

## Type Definitions

TypeScript types for the API are in `src/hooks/useEmailAPI.ts`:

```typescript
export interface EmailMessage {
  id?: string;
  messageId?: string;
  subject: string;
  from: string;
  to: string[];
  date: string;
  text?: string;
  html?: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
}
```

## Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [ImapFlow Documentation](https://imapflow.com/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Mailparser Documentation](https://nodemailer.com/extras/mailparser/)

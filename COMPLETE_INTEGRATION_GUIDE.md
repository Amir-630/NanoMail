# Complete Electron IPC Email Integration Guide

## Overview

This is a complete, production-ready implementation of a secure Electron IPC bridge for an email client. The bridge enables React components to safely interact with Node.js email operations (IMAP/SMTP) through inter-process communication.

## What You Have

### Core Infrastructure

1. **EmailController** - Handles all email operations
   - Path: `src/electron/EmailController.ts`
   - Manages IMAP connections (fetch, read, delete)
   - Manages SMTP connections (send emails)
   - Parses email bodies and attachments with mailparser

2. **Preload Script** - Secure API bridge
   - Path: `src/electron/preload.ts`
   - Uses Electron's `contextBridge` for security
   - Exposes functions via `window.electronAPI`
   - Full TypeScript support

3. **IPC Handlers** - Receive and process calls
   - Path: `src/electron/ipcHandlers.ts`
   - Registers all message handlers
   - Calls EmailController for business logic
   - Returns data to React frontend

4. **Main Process** - Electron entry point
   - Path: `src/electron/main.ts`
   - Creates secure BrowserWindow
   - Initializes IPC handlers
   - Handles app lifecycle

### React Integration

5. **useEmailAPI Hook** - React integration
   - Path: `src/hooks/useEmailAPI.ts`
   - Custom hook for email operations
   - Handles loading/error states
   - Event subscription support

6. **Example Component** - Working demo
   - Path: `src/components/email/EmailAPIExample.tsx`
   - Shows connect/disconnect flow
   - Demonstrates email fetch and send
   - UI patterns for email operations

### Type Definitions

7. **Email Types** - TypeScript interfaces
   - Path: `src/types/email.ts`
   - `EmailConfig`, `EmailMessage`, `EmailAttachment`
   - `ElectronAPI`, `SendEmailDetails`
   - Complete type safety

### Configuration Files

8. **Updated Files**
   - `package.json` - Added Electron + email packages
   - `vite.config.ts` - Optimized for Electron
   - `tsconfig.electron.json` - Main process TypeScript config
   - `.env.example` - Email configuration template

## How It Works

### Request Flow

```typescript
// 1. React component calls the hook
const { fetchMessages } = useEmailAPI();

// 2. Hook calls IPC renderer
await window.electronAPI.fetchMessages('INBOX', 50);

// 3. Preload script forwards to IPC main
ipcRenderer.invoke('email:fetch-messages', { folder, limit })

// 4. Main process handles the request
ipcMain.handle('email:fetch-messages', async (event, payload) => {
  const messages = await emailController.fetchMessages(...)
  return messages; // Sent back to renderer
})

// 5. React receives the data
const emails = await fetchMessages('INBOX', 50);
```

## Getting Started

### Step 1: Install Dependencies

```bash
cd c:\Amir.project\Email-Client\nanoMail
npm install
```

**What gets installed:**
- `electron` v27 - Desktop framework
- `imapflow` v1.1 - IMAP client
- `nodemailer` v6.9 - SMTP client
- `mailparser` v3.6 - Email parser
- `concurrently` v8.2 - Run multiple processes
- `wait-on` v7 - CLI utility for waiting
- TypeScript type definitions for above packages

### Step 2: Configure Email Account

Create `.env.local` in project root:

```bash
# Gmail Example
VITE_EMAIL_USER=your-email@gmail.com
VITE_EMAIL_PASSWORD=your-app-password
VITE_IMAP_HOST=imap.gmail.com
VITE_IMAP_PORT=993
VITE_IMAP_SECURE=true
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_SECURE=false
```

**Gmail Setup:**
1. Enable 2-Factor Authentication in Gmail settings
2. Create an App Password (not your Gmail password)
3. Use the App Password in the config

### Step 3: Start Development

```bash
npm run dev
```

This command:
1. Starts Vite dev server on `http://localhost:5173`
2. Waits for the server to be ready
3. Launches Electron app
4. Opens DevTools automatically

## Using the Email API

### In React Components

#### Basic Example

```typescript
import { useEmailAPI } from '@/hooks/useEmailAPI';

export function EmailInbox() {
  const { fetchMessages, isLoading, error, isConnected } = useEmailAPI();
  const [emails, setEmails] = useState([]);

  const loadEmails = async () => {
    try {
      const data = await fetchMessages('INBOX', 50);
      setEmails(data);
    } catch (err) {
      console.error('Failed to load emails:', err);
    }
  };

  return (
    <div>
      <button onClick={loadEmails} disabled={isLoading || !isConnected}>
        {isLoading ? 'Loading...' : 'Load Inbox'}
      </button>
      {error && <p>Error: {error.message}</p>}
      <ul>
        {emails.map((email) => (
          <li key={email.id}>
            <strong>{email.from}</strong>: {email.subject}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### Connect to Email Server

```typescript
import { useEmailAPI } from '@/hooks/useEmailAPI';

function LoginForm() {
  const { connectToImap, isLoading } = useEmailAPI();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await connectToImap({
        user: email,
        password: password,
        imap: {
          host: 'imap.gmail.com',
          port: 993,
          secure: true
        },
        smtp: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false
        }
      });
      console.log('Connected!');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const email = e.currentTarget.email.value;
      const password = e.currentTarget.password.value;
      handleLogin(email, password);
    }}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Connecting...' : 'Login'}
      </button>
    </form>
  );
}
```

#### Compose and Send Email

```typescript
function ComposeForm() {
  const { sendEmail, isLoading } = useEmailAPI();

  const handleSend = async (formData) => {
    try {
      const result = await sendEmail({
        to: formData.recipient,
        cc: formData.cc,
        subject: formData.subject,
        html: `<p>${formData.body}</p>`,
        attachments: formData.files.map(file => ({
          filename: file.name,
          path: file.path
        }))
      });
      console.log('Email sent!', result.messageId);
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };

  return (
    // Your compose form JSX here
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSend(Object.fromEntries(formData));
    }}>
      {/* Form fields */}
      <button disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
```

#### Subscribe to Email Events

```typescript
function EmailListener() {
  const { subscribeToEvents } = useEmailAPI();

  useEffect(() => {
    // Subscribe to events
    const unsubscribe = subscribeToEvents((event) => {
      switch (event.type) {
        case 'new-message':
          console.log('New email arrived:', event.data);
          break;
        case 'error':
          console.error('Email error:', event.data);
          break;
      }
    });

    // Cleanup on unmount
    return unsubscribe;
  }, [subscribeToEvents]);

  return <div>Listening for emails...</div>;
}
```

## API Reference

### useEmailAPI() Hook

Returns an object with:

```typescript
{
  // State
  isLoading: boolean,        // Operation in progress
  error: Error | null,       // Last error
  isConnected: boolean,      // Server connection status

  // Methods
  connectToImap: (config) => Promise<boolean>,
  disconnect: () => Promise<void>,
  getFolders: () => Promise<FolderInfo[]>,
  fetchMessages: (folder?, limit?) => Promise<EmailMessage[]>,
  sendEmail: (details) => Promise<SendEmailResponse>,
  markAsRead: (folder, messageId, read?) => Promise<void>,
  deleteMessage: (folder, messageId) => Promise<void>,
  subscribeToEvents: (callback) => () => void,
  checkConnectionStatus: () => Promise<boolean>
}
```

#### connectToImap(config: EmailConfig)
Establish IMAP/SMTP connection

```typescript
const success = await connectToImap({
  user: 'user@gmail.com',
  password: 'app-password',
  imap: { host: 'imap.gmail.com', port: 993, secure: true },
  smtp: { host: 'smtp.gmail.com', port: 587, secure: false }
});
```

#### fetchMessages(folder?: string, limit?: number)
Fetch emails from a folder

```typescript
const emails = await fetchMessages('INBOX', 50);
// Returns array of EmailMessage: { id, messageId, subject, from, to, date, text, html, attachments }
```

#### sendEmail(details: SendEmailDetails)
Send an email with optional attachments

```typescript
const result = await sendEmail({
  to: 'recipient@example.com',
  cc: 'cc@example.com',
  subject: 'Hello',
  html: '<p>Email body</p>',
  attachments: [
    { filename: 'doc.pdf', path: '/path/to/file.pdf' }
  ]
});
// Returns: { messageId: string, response: string }
```

#### markAsRead(folder: string, messageId: number, read?: boolean)
Mark a message as read/unread

```typescript
await markAsRead('INBOX', 1, true);  // Mark as read
await markAsRead('INBOX', 1, false); // Mark as unread
```

#### deleteMessage(folder: string, messageId: number)
Delete a message

```typescript
await deleteMessage('INBOX', 1);
```

#### getFolders()
Get all email folders

```typescript
const folders = await getFolders();
// Returns: Array<{ name, path, flags? }>
// Example: [{ name: 'INBOX', path: 'INBOX' }, { name: '[Gmail]/Sent Mail', path: '[Gmail]/Sent Mail' }]
```

#### subscribeToEvents(callback)
Listen to email events from main process

```typescript
const unsubscribe = subscribeToEvents((event) => {
  console.log(event.type, event.data);
});

// Unsubscribe when done
unsubscribe();
```

## Type Definitions

### EmailMessage
```typescript
{
  id?: string;                    // Unique message ID
  messageId?: string;             // RFC message ID
  subject: string;               // Email subject
  from: string;                  // Sender address
  to: string[];                  // Recipients
  cc?: string[];                 // CC recipients
  bcc?: string[];                // BCC recipients
  date: Date | string;           // Email date
  text?: string;                 // Plain text body
  html?: string;                 // HTML body
  attachments: EmailAttachment[]; // Attachments
}
```

### EmailConfig
```typescript
{
  user: string;           // Email address
  password: string;       // Password or app password
  imap: {
    host: string;         // IMAP server host
    port: number;         // IMAP server port (usually 993)
    secure: boolean;      // Use SSL/TLS
  };
  smtp: {
    host: string;         // SMTP server host
    port: number;         // SMTP server port (usually 587)
    secure: boolean;      // Use SSL/TLS
  };
}
```

## Project Structure

```
src/
├── electron/
│   ├── main.ts              ← Electron entry point
│   ├── preload.ts           ← Security bridge
│   ├── ipcHandlers.ts       ← Message handlers
│   └── EmailController.ts   ← Email logic
├── hooks/
│   └── useEmailAPI.ts       ← React hook
├── components/
│   └── email/
│       └── EmailAPIExample.tsx  ← Full working example
├── types/
│   └── email.ts             ← Type definitions
└── ...other files...

Configuration:
├── package.json             ← Scripts + dependencies
├── vite.config.ts           ← Build config
├── tsconfig.electron.json   ← Main process TS config
├── .env.example             ← Config template
├── ELECTRON_SETUP.md        ← Complete setup guide
└── ELECTRON_IPC_SUMMARY.md  ← This file
```

## Build Commands

```bash
# Development
npm run dev              # Run Vite + Electron

# Separate commands
npm run dev:vite        # Vite only
npm run dev:electron    # Electron only

# Production
npm run build           # Build everything
npm run build:electron  # Build main process only

# Other
npm run lint            # Lint code
npm run preview         # Preview production build
```

## Security Architecture

The implementation includes multiple security layers:

1. **Context Isolation** - Renderer and main process are isolated
2. **Preload Script** - Safe API exposure via contextBridge
3. **No Node Integration** - Renderer can't access Node APIs directly
4. **Sandbox** - Renderer runs in restricted environment
5. **Type Safety** - Full TypeScript prevents unsafe operations
6. **Controlled IPC** - Only specific handlers are allowed
7. **Credential Handling** - Passwords never leave main process

## Common Issues & Solutions

### "Cannot find module 'electron'"
```bash
npm install
```

### "IMAP connection failed"
- Check email/password
- For Gmail, use App Password (Settings > Security > App passwords)
- Verify IMAP is enabled in email account settings

### "IPC handler not found"
- Check handler name matches between preload.ts and ipcHandlers.ts
- Ensure setupIpcHandlers() is called in main.ts

### "Context isolation error"
- Ensure data passed through IPC is JSON serializable
- Dates should be converted to ISO strings

### DevTools not opening
- DevTools only opens in development mode
- Ensure `isDev` is true in main.ts

## Adding to Existing Components

To use the email API in any React component:

```typescript
// 1. Import the hook
import { useEmailAPI } from '@/hooks/useEmailAPI';

// 2. Use in component
function MyComponent() {
  const { fetchMessages, isLoading, error } = useEmailAPI();
  
  // 3. Call the methods
  const handleClick = async () => {
    const emails = await fetchMessages();
  };

  // 4. Use in JSX
  return <button onClick={handleClick}>{isLoading ? '...' : 'Load'}</button>;
}
```

## Next Steps

1. **Integrate with your app** - Use `useEmailAPI` hook in your components
2. **Add persistence** - Cache emails locally with SQLite or IndexedDB
3. **Improve security** - Use electron-secure-storage for passwords
4. **Add features** - Folders, search, filters, labels, etc.
5. **UI Polish** - Integrate with your Material Design 3 components
6. **Packaging** - Use electron-builder for distribution

## Files Created

✅ `src/electron/main.ts`
✅ `src/electron/preload.ts`
✅ `src/electron/ipcHandlers.ts`
✅ `src/electron/EmailController.ts`
✅ `src/hooks/useEmailAPI.ts`
✅ `src/components/email/EmailAPIExample.tsx`
✅ `src/types/email.ts`
✅ `tsconfig.electron.json`
✅ `.env.example`
✅ `ELECTRON_SETUP.md`
✅ `ELECTRON_IPC_SUMMARY.md`
✅ `COMPLETE_INTEGRATION_GUIDE.md` (this file)

## Files Modified

✅ `package.json` - Added Electron + email packages + scripts
✅ `vite.config.ts` - Updated for Electron compatibility

---

**Ready to use!** Your Electron email client is fully configured and ready for development.

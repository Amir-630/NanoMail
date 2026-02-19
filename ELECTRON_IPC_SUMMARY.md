# Electron IPC Email Client - Implementation Summary

This document summarizes the complete Electron IPC bridge implementation for the nanoMail email client.

## What's Been Implemented

### 1. **EmailController** (`src/electron/EmailController.ts`)
A robust email handling service using:
- **ImapFlow**: For fetching emails from IMAP servers
- **Nodemailer**: For sending emails via SMTP
- **Mailparser**: For parsing email bodies and attachments

**Key Features:**
- Connect to IMAP/SMTP servers securely
- Fetch emails from any folder
- Send emails with attachments
- Mark messages as read/unread
- Delete messages
- Get folder listings
- Automatic cleanup on disconnect

### 2. **Preload Script** (`src/electron/preload.ts`)
Secure bridge between renderer and main process:
- Uses `contextBridge` to expose safe APIs
- Wraps `ipcRenderer` calls
- Provides TypeScript types
- Sanitizes all input/output

**Exposed API:**
```typescript
window.electronAPI = {
  connectToImap(config),
  disconnect(),
  getFolders(),
  fetchMessages(folder?, limit?),
  sendEmail(details),
  markAsRead(folder, messageId, read?),
  deleteMessage(folder, messageId),
  isConnected(),
  onEmailEvent(channel, callback)
}
```

### 3. **IPC Handlers** (`src/electron/ipcHandlers.ts`)
Registers all ipcMain handlers that:
- Receive calls from renderer process
- Execute email operations
- Return results or throw errors
- Serialize data for IPC transfer

**Handlers:**
- `email:connect-imap` - Connect to server
- `email:disconnect` - Disconnect
- `email:get-folders` - Get mailboxes
- `email:fetch-messages` - Fetch emails with full parsing
- `email:send` - Send email with attachments
- `email:mark-as-read` - Toggle read status
- `email:delete` - Delete message
- `email:is-connected` - Check connection

### 4. **Main Process** (`src/electron/main.ts`)
Production-ready Electron entry point:
- Creates secure BrowserWindow with context isolation
- Sets up proper security flags
- Registers IPC handlers before window creation
- Handles errors gracefully
- Creates application menu
- Auto-opens DevTools in development

**Security Settings:**
- ✅ `contextIsolation: true`
- ✅ `nodeIntegration: false`
- ✅ `enableRemoteModule: false`
- ✅ `sandbox: true`
- ✅ Custom preload script required

### 5. **React Hook** (`src/hooks/useEmailAPI.ts`)
Custom React hook for component integration:
- Manages loading states
- Handles errors
- Provides typed API methods
- Supports event subscriptions
- Clean error boundaries

**Usage:**
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

### 6. **Example Component** (`src/components/email/EmailAPIExample.tsx`)
Complete working example showing:
- Connect/disconnect flow
- Email fetching and display
- Email composition and sending
- Error handling UI
- Loading states
- Status indicators

### 7. **Type Definitions** (`src/types/email.ts`)
Comprehensive TypeScript interfaces:
- `EmailConfig` - Server configuration
- `EmailMessage` - Email structure
- `EmailAttachment` - Attachment info
- `FolderInfo` - Mailbox structure
- `ElectronAPI` - Window.electronAPI type
- Additional utility types

### 8. **Configuration Files**
- `tsconfig.electron.json` - TypeScript config for main process
- `.env.example` - Configuration template
- `vite.config.ts` - Updated with aliases and outDir
- `package.json` - Updated with Electron scripts

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│        React Components (Renderer)              │
│  - Import { useEmailAPI }                       │
│  - Call fetchMessages(), sendEmail(), etc.      │
└────────────────────┬────────────────────────────┘
                     │ IPC (ipcRenderer)
                     │ window.electronAPI.fetchMessages()
                     ▼
┌─────────────────────────────────────────────────┐
│      Preload Script (Node Context)              │
│  - Wraps IPC calls with contextBridge           │
│  - Sanitizes data                               │
│  - Provides TypeScript types                    │
└────────────────────┬────────────────────────────┘
                     │ IPC Message
                     │ { type: 'email:fetch-messages', payload: {...} }
                     ▼
┌─────────────────────────────────────────────────┐
│        Main Process (Node.js)                   │
│  setupIpcHandlers() registers all listeners     │
│  ipcMain.handle('email:fetch-messages', async (event, payload) => {
│    return emailController.fetchMessages(folder)│
│  })                                             │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
    ┌────────────┐          ┌──────────────┐
    │ ImapFlow   │          │ Nodemailer   │
    │ IMAP Client│          │ SMTP Client  │
    └─────┬──────┘          └──────┬───────┘
          │                        │
          ▼                        ▼
    ┌───────────────────────────────────┐
    │   Email Servers (Gmail, etc.)     │
    └───────────────────────────────────┘
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

This installs:
- `electron` - Desktop app framework
- `imapflow` - IMAP client library
- `nodemailer` - Email sender
- `mailparser` - Email parser
- `concurrently` - Run multiple processes
- `wait-on` - Wait for server to start

### 2. Configure Email
Create `.env.local`:
```
VITE_EMAIL_USER=your-email@gmail.com
VITE_EMAIL_PASSWORD=your-app-password
VITE_IMAP_HOST=imap.gmail.com
VITE_IMAP_PORT=993
VITE_IMAP_SECURE=true
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_SECURE=false
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use app password (not Gmail password)

### 3. Start Development
```bash
npm run dev
```

This:
- Starts Vite dev server on `http://localhost:5173`
- Waits for server
- Launches Electron app
- Opens DevTools automatically

### 4. Use in React Component

```typescript
import { useEmailAPI } from '@/hooks/useEmailAPI';

export function MyComponent() {
  const { fetchMessages, sendEmail, isLoading, error } = useEmailAPI();

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

## File Structure

```
src/
├── electron/
│   ├── main.ts              # Electron main process entry
│   ├── preload.ts           # Context bridge and API exposure
│   ├── ipcHandlers.ts       # IPC handler registration
│   └── EmailController.ts   # Email operations logic
├── hooks/
│   └── useEmailAPI.ts       # React hook for API access
├── components/
│   └── email/
│       └── EmailAPIExample.tsx  # Full working example
├── types/
│   └── email.ts             # TypeScript type definitions
├── App.tsx                  # Main app component
└── main.tsx                 # React entry point

Root files:
├── package.json             # Updated with Electron scripts
├── vite.config.ts          # Updated for Electron
├── tsconfig.electron.json  # TS config for main process
├── .env.example            # Email config template
├── ELECTRON_SETUP.md       # Comprehensive setup guide
└── ELECTRON_IPC_SUMMARY.md # This file
```

## Security Highlights

✅ **Context Isolation**: Renderer and main processes are isolated
✅ **No Node Integration**: Renderer cannot access Node.js
✅ **Preload Script**: Safe API exposure via contextBridge
✅ **Sandbox**: Renderer process runs in sandbox
✅ **Type Safety**: Full TypeScript support
✅ **Error Handling**: Proper error boundaries
✅ **Credentials**: Passwords handled in main process only

## Common Tasks

### Connect to Email Server
```typescript
const { connectToImap } = useEmailAPI();

await connectToImap({
  user: 'email@gmail.com',
  password: 'app-password',
  imap: { host: 'imap.gmail.com', port: 993, secure: true },
  smtp: { host: 'smtp.gmail.com', port: 587, secure: false }
});
```

### Fetch Recent Emails
```typescript
const { fetchMessages } = useEmailAPI();

const emails = await fetchMessages('INBOX', 50);
emails.forEach(email => {
  console.log(`${email.from}: ${email.subject}`);
});
```

### Send Email with Attachments
```typescript
const { sendEmail } = useEmailAPI();

await sendEmail({
  to: 'recipient@example.com',
  subject: 'Hello',
  html: '<p>Message body</p>',
  attachments: [
    {
      filename: 'document.pdf',
      path: '/path/to/file.pdf'
    }
  ]
});
```

### Listen to Events
```typescript
const { subscribeToEvents } = useEmailAPI();

useEffect(() => {
  const unsubscribe = subscribeToEvents((event) => {
    if (event.type === 'new-message') {
      console.log('New email:', event.data);
    }
  });

  return unsubscribe;
}, []);
```

## Debugging

### View IPC Messages
Open DevTools (Ctrl+Shift+I) and check Console for IPC logs.

### Enable IMAP Debugging
In `src/electron/EmailController.ts`:
```typescript
logger: false  // Change to true
```

### Monitor Main Process Console
Main process logs appear in the terminal, not DevTools.

### Check Email Connection
```typescript
const { isConnected } = useEmailAPI();
console.log('Connected:', await isConnected());
```

## Build for Production

```bash
npm run build
```

Outputs:
- `dist/app/` - React SPA bundle
- `dist/electron/` - Compiled main process

Package with electron-builder:
```bash
npm install -D electron-builder
npx electron-builder
```

## Troubleshooting

**Issue**: "Electron is not defined"
- **Fix**: Ensure you're accessing `window.electronAPI`, not `electron`

**Issue**: IPC handler not found
- **Fix**: Check handler names match between preload and main process

**Issue**: Authentication fails
- **Fix**: For Gmail, use App Password, not Gmail password

**Issue**: IMAP connection timeout
- **Fix**: Check firewall, verify host/port settings

**Issue**: Context isolation error
- **Fix**: Ensure message data is JSON serializable

## Next Steps

1. **Customize**: Modify `EmailAPIExample.tsx` for your UI
2. **Add Features**: Implement folder management, search, filters
3. **Error Handling**: Add user-friendly error messages
4. **Persistence**: Add local email caching with SQLite
5. **Security**: Store credentials securely using electron-secure-storage
6. **UI**: Integrate with your Material Design 3 components

## Resources

- [Electron Docs](https://www.electronjs.org/docs)
- [ImapFlow](https://imapflow.com/)
- [Nodemailer](https://nodemailer.com/)
- [React Hooks](https://react.dev/reference/react/hooks)
- [IPC Documentation](https://www.electronjs.org/docs/api/ipc-main)

## Support

For issues or questions:
1. Check `ELECTRON_SETUP.md` for detailed setup instructions
2. Review `EmailAPIExample.tsx` for usage patterns
3. Check console for error messages
4. Enable debug logging for troubleshooting

---

**Created**: February 19, 2026
**Framework**: Electron + React + TypeScript + Vite
**Email Libraries**: ImapFlow + Nodemailer + Mailparser

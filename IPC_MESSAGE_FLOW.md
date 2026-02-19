# IPC Message Flow - Technical Deep Dive

This document explains in detail how messages flow through the Electron IPC bridge, including serialization, error handling, and security considerations.

## Message Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                      RENDERER PROCESS (React)                          │
│                                                                         │
│  Component (EmailListPanel.tsx)                                         │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │ const { fetchMessages } = useEmailAPI()                 │           │
│  │ const emails = await fetchMessages('INBOX', 50) ◄─────┐ │           │
│  └──────────────▲───────────────────────────────────────┬──┘           │
│                 │                                         │              │
│         return  │                                         ▼              │
│         Promise │                    useEmailAPI Hook                   │
│                 │    ┌───────────────────────────────────────┐          │
│                 │    │ const electronAPIRef = useRef()       │          │
│                 │    │ electronAPIRef.current =             │          │
│                 │    │   window.electronAPI              ◄──┼──┐       │
│                 │    └───────────────────────────────────────┘  │       │
│                 │                  │                            │       │
│                 │ returns Promise  │ calls                      │       │
│                 └──────────────────┤                            │       │
│                                    ▼                            │       │
│                    window.electronAPI.fetchMessages()          │       │
│                                                                │       │
│                   ┌─────────────────────────────────────────┐  │       │
│                   │ CONTEXT ISOLATED PRELOAD (preload.ts)  │  │       │
│                   │                                         │  │       │
│                   │ electronAPI = {                         │  │       │
│                   │   fetchMessages: (folder, limit) => {  │  │       │
│                   │     return ipcRenderer.invoke(          │  │       │
│                   │       'email:fetch-messages',          │  │       │
│                   │       { folder, limit }                │  │       │
│                   │     )                                  │  │       │
│                   │   }                                    │  │       │
│                   │ }                                      │  │       │
│                   │                                        │  │       │
│                   │ contextBridge.exposeInMainWorld(      │  │       │
│                   │   'electronAPI', electronAPI          │  │       │
│                   │ ) ◄─────────────────────────────────────┘  │       │
│                   │                                         │       │
│                   └──────────────┬──────────────────────────┘       │
│                                  │                                 │
└──────────────────────────────────┼─────────────────────────────────┘
                                   │
                     ┌─────────────────────────────────┐
                     │  IPC BRIDGE (Electron:Chromium) │
                     │  Message Serialization JSON     │
                     │  ─────────────────────────────  │
                     │  channel: 'email:fetch-messages'│
                     │  {                              │
                     │    folder: 'INBOX',             │
                     │    limit: 50                    │
                     │  }                              │
                     └──────────────┬──────────────────┘
                                    │
┌───────────────────────────────────▼──────────────────────────────────┐
│                    MAIN PROCESS (Node.js)                            │
│                                                                       │
│  ipcMain.handle('email:fetch-messages', async (event, payload) => {│
│    console.log('Received IPC:', payload)                            │
│    // payload = { folder: 'INBOX', limit: 50 }                     │
│                                                                     │
│    try {                                                            │
│      // Call EmailController                                       │
│      const messages = await emailController.fetchMessages(        │
│        payload.folder,                                            │
│        payload.limit                                              │
│      )                                                             │
│                                                                   │
│      // Serialize Date objects for IPC                           │
│      const serialized = messages.map(msg => ({                  │
│        ...msg,                                                  │
│        date: msg.date.toISOString()  // convert Date → string  │
│      }))                                                         │
│                                                                 │
│      return serialized  // Send back to renderer               │
│    } catch (error) {                                            │
│      throw new Error(`Failed: ${error.message}`)               │
│    }                                                            │
│  })                                                             │
│                                                                 │
│  EmailController Instance                                      │
│  ┌──────────────────────────────────────────────────┐         │
│  │ private imapClient: ImapFlow                      │         │
│  │                                                  │         │
│  │ async fetchMessages(folder, limit) {            │         │
│  │   const mailbox = await imapClient.mailboxOpen()│         │
│  │   for await (const message of imapClient.fetch) │         │
│  │     const parsed = await simpleParser(message)  │         │
│  │     // Parse email structure with mailparser   │         │
│  │     return EmailMessage[]                      │         │
│  │ }                                               │         │
│  └──────────┬───────────────────────────────────────┘         │
│             │                                               │
│             ▼                                               │
│   ┌─────────────────────────────────────────┐              │
│   │   ImapFlow (IMAP Client)                │              │
│   │   Connects to Gmail/Email servers       │              │
│   │   ┌──────────────────────────────────┐  │              │
│   │   │ imap.gmail.com:993              │  │              │
│   │   │ TLS Connection                   │  │              │
│   │   │ Fetch: 1:50                      │  │              │
│   │   └──────────────────────────────────┘  │              │
│   └─────────────────────────────────────────┘              │
│                                                            │
└────────────────────────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Email Server        │
         │   (Gmail IMAP)        │
         │   imap.gmail.com:993  │
         └───────────────────────┘
                     │
               return emails
                     │
                     ▼
         (message flow reverses)
         
         EmailMessage[] → serialize → JSON
         ↓
         IPC message back to renderer
         ↓
         Promise resolves with data
         ↓
         React component receives emails array
         ↓
         Component renders email list
```

## Message Structure

### Request Message

From React to Main Process:

```typescript
// Call in React
const emails = await window.electronAPI.fetchMessages('INBOX', 50);

// Becomes this IPC message:
{
  channel: 'email:fetch-messages',
  payload: {
    folder: 'INBOX',
    limit: 50
  }
}
```

### Response Message

From Main Process back to React:

```typescript
// Handler returns
return [
  {
    id: '1',
    subject: 'Hello',
    from: 'sender@gmail.com',
    to: ['user@gmail.com'],
    date: '2024-02-19T10:30:00.000Z',  // Serialized ISO string
    text: 'Email body',
    html: '<p>Email body</p>',
    attachments: []
  },
  // ... more messages
]

// Becomes this IPC message back:
{
  channel: 'email:fetch-messages',
  result: [
    // array of emails
  ]
}
```

## Error Handling Flow

```
Renderer Process          ↔         Main Process
─────────────────              ──────────────
const emails = 
  await fetchMessages()
        │
        ├─► ipcRenderer.invoke(
        │     'email:fetch-messages'
        │   )
        │
        │     ┌─────────────────────────┐
        │     │ Handler catches error   │
        │     │ throw new Error(...)    │
        │     └──────────┬──────────────┘
        │                │
        │◄───────────────┤ Error serialized
        │ (error rejected)│
        │                │
   catch (error) {
     error.message
   }
```

## Serialization Rules

### What Can Be Sent Through IPC

✅ **Serializable Types:**
- Primitives: string, number, boolean, null, undefined
- Objects: {}
- Arrays: []
- Dates: Must convert to ISO string (date.toISOString())
- Buffers: Must have proper handling (see below)

❌ **Non-Serializable:**
- Functions
- Circular references
- Map, Set instances
- Class instances (without special handling)

### Example: Date Serialization

```typescript
// ❌ WRONG - Will fail
{
  date: new Date()  // Cannot serialize
}

// ✅ CORRECT
{
  date: new Date().toISOString()  // '2024-02-19T10:30:00Z'
}

// In receiver
const date = new Date(dateString)
```

## Complete Message Timeline

### Scenario: User clicks "Fetch Emails" button

```
Time    Component                Handler              Main Process
────────────────────────────────────────────────────────────────
t0      User clicks button
        handleFetchEmails()
        
t1      const emails = 
        await window.electronAPI
          .fetchMessages('INBOX', 50)
        
        Promise<EmailMessage[]>
        created and waiting
                             ·
                             ├─→ ipcRenderer.invoke(
                             │     'email:fetch-messages',
                             │     { folder: 'INBOX', limit: 50 }
                             │   )
                             │
t2      (blocked waiting)        ·                 ← message arrives
                                 ·            
                                 ·         ipcMain.handle() triggered
                                 ·         
                                 ·         await emailController
                                 ·           .fetchMessages(...)
                                 ·
                                 ·         (ImapFlow connects)
t3      (blocked waiting)        ·         
                                 ·         (Fetches from server)
                                 ·         
                                 ·         (Parses with mailparser)
t4      (blocked waiting)        ·         
                                 ·         (Serializes dates)
t5                               ·
                                 ·         return emails[]
                                 ·
                                 ◄─── send back via IPC
t6      Promise resolves    ✓
        
        emails = [
          { subject: '...', from: '...', ... },
          { subject: '...', from: '...', ... },
          ...
        ]
        
t7      Component renders
        with email list
```

## Handler Implementation Pattern

```typescript
// Pattern used for all handlers
ipcMain.handle(
  'email:fetch-messages',
  async (
    _event: IpcMainInvokeEvent,    // ← Electron event (not used)
    { folder, limit }: {           // ← Destructure payload
      folder: string;
      limit: number;
    }
  ) => {
    try {
      // Validate input
      if (!folder) throw new Error('Folder required');
      if (limit < 1) throw new Error('Limit must be > 0');
      
      // Call business logic
      const messages = await emailController.fetchMessages(folder, limit);
      
      // Serialize for IPC
      return messages.map(msg => ({
        ...msg,
        date: msg.date.toISOString()
      }));
      
    } catch (error) {
      // Error is automatically serialized and sent to renderer
      throw new Error(`Failed: ${(error as Error).message}`);
    }
  }
);
```

## React Hook Implementation Pattern

```typescript
// Pattern used for all methods in useEmailAPI
const fetchMessages = useCallback(
  async (folder: string = 'INBOX', limit: number = 50) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check API is available
      if (!electronAPIRef.current?.fetchMessages) {
        throw new Error('Electron API not available');
      }

      // Call API and wait for response
      const messages = await electronAPIRef.current.fetchMessages(
        folder,
        limit
      );

      // Update state with result
      return messages;

    } catch (err) {
      // Capture error for component
      const errorObj = err instanceof Error 
        ? err 
        : new Error(String(err));
      setError(errorObj);
      throw errorObj;
      
    } finally {
      // Always stop loading indicator
      setIsLoading(false);
    }
  },
  []
);
```

## Component Usage Pattern

```typescript
export function MyEmailComponent() {
  const { fetchMessages, isLoading, error } = useEmailAPI();
  const [emails, setEmails] = useState<EmailMessage[]>([]);

  // Load emails when component mounts
  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      // This is where the entire message flow happens:
      // 1. React calls hook method
      // 2. Hook calls window.electronAPI
      // 3. Preload forwards to ipcRenderer.invoke
      // 4. IPC message goes to main process
      // 5. Main process handler executes EmailController
      // 6. Controller connects to IMAP server
      // 7. Results serialize back through IPC
      // 8. Hook receives data
      // 9. Hook updates state via setEmails
      // 10. Component re-renders with new data
      const emails = await fetchMessages('INBOX', 50);
      setEmails(emails);
    } catch (err) {
      console.error('Failed to load emails:', err);
    }
  };

  if (isLoading) return <div>Loading emails...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {emails.map(email => (
        <li key={email.id}>
          <strong>{email.from}</strong>: {email.subject}
        </li>
      ))}
    </ul>
  );
}
```

## Security Flow

```
React Component
      │
      ├── No direct access to Node.js
      │
      ├── Can only call exposed methods
      │
      └─→ window.electronAPI.fetchMessages()
            │
            ├─ Method defined in preload.ts
            │
            ├─ Uses contextBridge.exposeInMainWorld()
            │
            └─ Calls ipcRenderer.invoke()
                  │
                  ├─ Message sent through IPC bridge
                  │
                  ├─ Main process validates payload
                  │
                  ├─ Only registered handlers execute
                  │
                  ├─ Result serialized to JSON
                  │
                  └─ Sent back to renderer
                         │
                         └─ React receives data
```

## Performance Optimization

### Message Size Impact

```typescript
// Large email fetch (100 emails with full HTML)
// Message size: ~10-50 MB
// Transfer time: 100-500ms

// Optimized: Only fetch metadata first
// Message size: ~50KB
// Transfer time: ~1-5ms
// Then load full message on-demand

// Best practice:
const emails = await fetchMessages('INBOX', 50);
// Returns lightweight preview
// { id, subject, from, date, snippet }

const fullEmail = await getEmailDetails(emailId);
// Load full content on-demand
// { text, html, attachments }
```

### Batching Requests

```typescript
// ❌ BAD: Multiple IPC calls
for (let i = 0; i < 10; i++) {
  await markAsRead('INBOX', ids[i], true);
  // 10 separate IPC calls!
}

// ✅ GOOD: Batch operation (future enhancement)
await markMultipleAsRead('INBOX', ids, true);
// 1 IPC call for 10 messages
```

## Debugging IPC Messages

### Enable Logging

In `src/electron/main.ts`:
```typescript
mainWindow.webContents.on('ipc-message', (event, channel, ...args) => {
  console.log('[IPC]', channel, args);
});
```

### DevTools Console

Renderer process console shows:
```
window.electronAPI.fetchMessages('INBOX', 50)
// Returns pending Promise
```

### Check if API Exists

```typescript
if (!window.electronAPI) {
  console.error('electronAPI not available - preload script not loaded');
}

console.log(Object.keys(window.electronAPI));
// ['connectToImap', 'disconnect', 'fetchMessages', ...]
```

## Troubleshooting Flow

### IPC Handler Not Responding

```
1. Check preload.ts
   └─ Method name matches handler? ✓

2. Check ipcHandlers.ts
   └─ Handler registered? ✓

3. Check main.ts
   └─ setupIpcHandlers() called before window creation? ✓

4. Check DevTools
   └─ Error messages in console? ✓

5. Check email config
   └─ Valid credentials? ✓

6. Check network
   └─ Can reach email server? ✓
```

### Data Not Serializing

```
❌ Error: "Converting circular structure to JSON"

├─ Check for circular references
├─ Check Message has all serializable types
├─ Check dates are converted to ISO strings
└─ Verify no function props

✅ Solution: Ensure all data is JSON compatible
```

---

This deep dive explains how every character flows through the IPC bridge, from React click to server response and back!

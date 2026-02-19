import { useState, useEffect } from 'react';
import { useEmailAPI, type EmailConfig } from '../../hooks/useEmailAPI';

/**
 * Example component demonstrating Electron IPC bridge integration with React
 * Shows how to use the useEmailAPI hook to interact with email operations
 */
export const EmailAPIExample: React.FC = () => {
  const {
    fetchMessages,
    sendEmail,
    connectToImap,
    disconnect,
    isLoading,
    error,
    isConnected,
  } = useEmailAPI();

  const [emails, setEmails] = useState<any[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [message, setMessage] = useState({
    to: '',
    subject: '',
    text: '',
  });

  /**
   * Example: Connect to IMAP on component mount
   * In production, this would be triggered by user login
   */
  const handleConnect = async () => {
    const config: EmailConfig = {
      user: 'your-email@gmail.com',
      password: 'your-app-password', // Use app-specific password for Gmail
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

    try {
      await connectToImap(config);
      // Once connected, fetch messages
      await handleFetchMessages();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  /**
   * Example: Fetch messages from INBOX
   * This calls window.electronAPI.fetchMessages() through the IPC bridge
   */
  const handleFetchMessages = async () => {
    try {
      const messages = await fetchMessages('INBOX', 50);
      setEmails(messages);
      console.log(`Fetched ${messages.length} emails`);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  /**
   * Example: Send an email
   * This calls window.electronAPI.sendEmail() through the IPC bridge
   */
  const handleSendEmail = async () => {
    try {
      const result = await sendEmail({
        to: message.to,
        subject: message.subject,
        html: `<p>${message.text}</p>`,
      });
      console.log('Email sent:', result.messageId);
      setMessage({ to: '', subject: '', text: '' });
      setShowCompose(false);
      // Refresh email list
      await handleFetchMessages();
    } catch (err) {
      console.error('Failed to send email:', err);
    }
  };

  /**
   * Example: Disconnect from server
   */
  const handleDisconnect = async () => {
    try {
      await disconnect();
      setEmails([]);
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Email API Integration Example</h1>

      {/* Connection Status */}
      <div
        style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
          borderRadius: '4px',
        }}
      >
        <p>
          Status:{' '}
          <strong>{isConnected ? '✓ Connected' : '✗ Disconnected'}</strong>
        </p>
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      </div>

      {/* Control Buttons */}
      <div style={{ marginBottom: '20px' }}>
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginRight: '10px',
            }}
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <>
            <button
              onClick={handleFetchMessages}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginRight: '10px',
              }}
            >
              {isLoading ? 'Loading...' : 'Refresh Inbox'}
            </button>
            <button
              onClick={() => setShowCompose(!showCompose)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              {showCompose ? 'Cancel' : 'Compose'}
            </button>
            <button
              onClick={handleDisconnect}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {/* Compose Email Form */}
      {showCompose && isConnected && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #ddd',
          }}
        >
          <h3>Compose Email</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>To:</label>
            <input
              type="email"
              value={message.to}
              onChange={(e) =>
                setMessage({ ...message, to: e.target.value })
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
              placeholder="recipient@example.com"
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Subject:</label>
            <input
              type="text"
              value={message.subject}
              onChange={(e) =>
                setMessage({ ...message, subject: e.target.value })
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
              placeholder="Email subject"
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Message:</label>
            <textarea
              value={message.text}
              onChange={(e) =>
                setMessage({ ...message, text: e.target.value })
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                minHeight: '150px',
              }}
              placeholder="Email body"
            />
          </div>
          <button
            onClick={handleSendEmail}
            disabled={isLoading || !message.to || !message.subject}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor:
                isLoading || !message.to ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      )}

      {/* Email List */}
      {isConnected && !showCompose && (
        <div>
          <h3>
            Inbox ({emails.length}
            {isLoading && ' - Loading...'}
            )
          </h3>
          {emails.length === 0 ? (
            <p>No emails found</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {emails.map((email, index) => (
                <li
                  key={index}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px',
                    borderLeft: '4px solid #007bff',
                  }}
                >
                  <div>
                    <strong>From:</strong> {email.from}
                  </div>
                  <div>
                    <strong>Subject:</strong> {email.subject}
                  </div>
                  <div>
                    <strong>Date:</strong>{' '}
                    {new Date(email.date).toLocaleString()}
                  </div>
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '14px',
                      color: '#666',
                    }}
                  >
                    {email.text
                      ? email.text.substring(0, 100) + '...'
                      : '(No content)'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailAPIExample;

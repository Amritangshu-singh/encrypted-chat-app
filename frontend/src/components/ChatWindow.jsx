import React, { useEffect, useRef } from 'react';
import MessageInput from './MessageInput';
import UserStatus from './UserStatus';

function ChatWindow({
  currentUser,
  selectedUser,
  messages,
  loadingMsgs,
  typingUsers,
  onSend,
  onTyping,
  onlineUsers,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getInitial = (name) => (name ? name[0].toUpperCase() : '?');

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!selectedUser) {
    return (
      <div className="chat-area">
        <div className="chat-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>Select a user to start chatting</p>
          <p style={{ fontSize: '.8rem', color: '#484f58' }}>
            All messages are end-to-end encrypted 🔐
          </p>
        </div>
      </div>
    );
  }

  const isTyping = typingUsers[selectedUser.id];

  return (
    <div className="chat-area">
      {/* Header */}
      <div className="chat-header">
        <div className="avatar">{getInitial(selectedUser.username)}</div>
        <div className="user-info">
          <h3>{selectedUser.username}</h3>
          <small className={isTyping ? '' : ''}>
            {isTyping ? 'typing…' : selectedUser.email || selectedUser.phone}
          </small>
        </div>
        <UserStatus online={!!(onlineUsers && onlineUsers[selectedUser.id])} />
      </div>

      {/* Encryption notice */}
      <div className="enc-badge">
        🔒 Messages are end-to-end encrypted. Only you and {selectedUser.username} can read them.
      </div>

      {/* Messages */}
      <div className="messages-area">
        {loadingMsgs ? (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8b949e', marginTop: '2rem', fontSize: '.85rem' }}>
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isSent = msg.senderId === currentUser.id;
            const failed = msg.plaintext === null || msg.plaintext === '[Decryption failed]';
            return (
              <div
                key={msg.id}
                className={`message-bubble ${isSent ? 'sent' : 'received'} ${failed ? 'error-bubble' : ''}`}
              >
                {failed ? '🔒 Unable to decrypt message' : msg.plaintext}
                <div className="message-time">{formatTime(msg.timestamp)}</div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="typing-indicator">{selectedUser.username} is typing…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={onSend} onTyping={onTyping} />
    </div>
  );
}

export default ChatWindow;

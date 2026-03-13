import React, { useState, useRef, useEffect, useCallback } from 'react';

const TYPING_TIMEOUT = 2000;

function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState('');
  const typingTimer = useRef(null);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);

    // Emit typing start
    onTyping(true);

    // Clear previous timer and set a new one
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => onTyping(false), TYPING_TIMEOUT);

    // Auto-grow textarea
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  };

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    if (typingTimer.current) clearTimeout(typingTimer.current);
    onTyping(false);
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [text, onSend, onTyping]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  return (
    <div className="message-input-area">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
        rows={1}
      />
      <button
        className="send-btn"
        onClick={handleSend}
        disabled={!text.trim()}
        title="Send message"
      >
        {/* Send arrow icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}

export default MessageInput;

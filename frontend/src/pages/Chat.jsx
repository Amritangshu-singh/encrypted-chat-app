import React, { useState, useEffect, useCallback } from 'react';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';
import { getUsers, getMessages, getUserPublicKey } from '../utils/api';
import { initSocket, disconnectSocket, getSocket } from '../utils/socket';
import { encryptMessage, decryptMessage, getPrivateKey } from '../utils/encryption';

function Chat({ user, setIsAuthenticated }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);       // raw (possibly decrypted)
  const [onlineUsers, setOnlineUsers] = useState({}); // userId -> boolean
  const [typingUsers, setTypingUsers] = useState({}); // userId -> boolean
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // ── Load user list once ──────────────────────────────────────────────────
  useEffect(() => {
    getUsers()
      .then(({ data }) => setUsers(data.filter((u) => u.id !== user.id)))
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, [user.id]);

  // ── Socket setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const socket = initSocket(token);

    socket.on('user_online', ({ userId, online }) => {
      setOnlineUsers((prev) => ({ ...prev, [userId]: online }));
    });

    socket.on('receive_message', async (msg) => {
      // Decrypt inline
      const decrypted = await tryDecrypt(msg, user);
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, { ...msg, plaintext: decrypted }];
      });
    });

    socket.on('user_typing', ({ senderId, typing }) => {
      setTypingUsers((prev) => ({ ...prev, [senderId]: typing }));
    });

    return () => disconnectSocket();
  }, [user]);

  // ── Load message history when selectedUser changes ───────────────────────
  useEffect(() => {
    if (!selectedUser) return;
    setLoadingMsgs(true);
    setMessages([]);

    getMessages(selectedUser.id)
      .then(async ({ data }) => {
        const decrypted = await Promise.all(
          data.map(async (msg) => ({
            ...msg,
            plaintext: await tryDecrypt(msg, user),
          }))
        );
        setMessages(decrypted);
      })
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));
  }, [selectedUser, user]);

  // ── Decrypt helper ───────────────────────────────────────────────────────
  async function tryDecrypt(msg, currentUser) {
    const myPrivKey = getPrivateKey(currentUser.id);
    if (!myPrivKey) return '[No private key]';
    try {
      // Determine whose public key we need for decryption
      const isReceived = msg.senderId !== currentUser.id;
      const otherUserId = isReceived ? msg.senderId : msg.recipientId;

      // Fetch sender public key (for decryption of received) or recipient (sent)
      const { data } = await getUserPublicKey(otherUserId);
      const otherPubKey = data.publicKey;

      if (isReceived) {
        return decryptMessage(msg.encryptedContent, msg.nonce, otherPubKey, myPrivKey);
      } else {
        // Sent messages: encrypted with recipient pubkey + our seckey
        // We decrypt using recipient pubkey + our seckey
        return decryptMessage(msg.encryptedContent, msg.nonce, otherPubKey, myPrivKey);
      }
    } catch {
      return '[Decryption failed]';
    }
  }

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (text) => {
      if (!selectedUser || !text.trim()) return;
      const myPrivKey = getPrivateKey(user.id);
      if (!myPrivKey) return;

      try {
        const { data } = await getUserPublicKey(selectedUser.id);
        const recipientPubKey = data.publicKey;

        const { encryptedContent, nonce } = encryptMessage(
          text,
          recipientPubKey,
          myPrivKey
        );

        const socket = getSocket();
        if (socket) {
          socket.emit('send_message', {
            recipientId: selectedUser.id,
            encryptedContent,
            nonce,
          });
        }
      } catch (err) {
        console.error('Send failed', err);
      }
    },
    [selectedUser, user.id]
  );

  // ── Typing indicator ─────────────────────────────────────────────────────
  const handleTyping = useCallback(
    (typing) => {
      if (!selectedUser) return;
      const socket = getSocket();
      if (socket) {
        socket.emit('user_typing', { recipientId: selectedUser.id, typing });
      }
    },
    [selectedUser]
  );

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
  };

  return (
    <div className="chat-layout">
      <UserList
        users={users}
        currentUser={user}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
        onlineUsers={onlineUsers}
        loading={loadingUsers}
        onLogout={handleLogout}
      />
      <ChatWindow
        currentUser={user}
        selectedUser={selectedUser}
        messages={messages}
        loadingMsgs={loadingMsgs}
        typingUsers={typingUsers}
        onSend={handleSend}
        onTyping={handleTyping}
        onlineUsers={onlineUsers}
      />
    </div>
  );
}

export default Chat;

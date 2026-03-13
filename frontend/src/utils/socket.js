/**
 * socket.js — Socket.io client singleton.
 */
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export function getSocket() {
  return socket;
}

export function initSocket(token) {
  if (socket) {
    socket.disconnect();
  }
  socket = io(SOCKET_URL, {
    query: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

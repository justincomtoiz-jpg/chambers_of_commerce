import { io, Socket } from 'socket.io-client';
import { getAuthHeaders } from './stores/auth';

let socket: Socket | null = null;

export function connectSocket() {
  if (socket) return socket;
  const headers = getAuthHeaders();
  // connect to same origin; adjust URL if backend is on different host/port
  socket = io('/', { auth: headers });
  return socket;
}

export function getSocket() {
  return socket;
}

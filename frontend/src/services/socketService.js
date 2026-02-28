import { io } from 'socket.io-client';
import { CLIENT_EVENTS, SERVER_EVENTS } from '../utils/constants';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to Socket.io server
   */
  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
    });

    return this.socket;
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Join a room
   */
  joinRoom(roomCode, userId, username) {
    this.socket?.emit(CLIENT_EVENTS.JOIN_ROOM, { roomCode, userId, username });
  }

  /**
   * Leave a room
   */
  leaveRoom(roomCode, userId) {
    this.socket?.emit(CLIENT_EVENTS.LEAVE_ROOM, { roomCode, userId });
  }

  /**
   * Play video
   */
  play(roomCode, timestamp) {
    console.log('Emitting PLAY event', { roomCode, timestamp, connected: this.socket?.connected });
    this.socket?.emit(CLIENT_EVENTS.PLAY, { roomCode, timestamp });
  }

  /**
   * Pause video
   */
  pause(roomCode, timestamp) {
    console.log('Emitting PAUSE event', { roomCode, timestamp, connected: this.socket?.connected });
    this.socket?.emit(CLIENT_EVENTS.PAUSE, { roomCode, timestamp });
  }

  /**
   * Seek video
   */
  seek(roomCode, timestamp) {
    this.socket?.emit(CLIENT_EVENTS.SEEK, { roomCode, timestamp });
  }

  /**
   * Change video
   */
  changeVideo(roomCode, youtubeUrl) {
    this.socket?.emit(CLIENT_EVENTS.CHANGE_VIDEO, { roomCode, youtubeUrl });
  }

  /**
   * Assign role
   */
  assignRole(roomCode, targetUserId, role) {
    this.socket?.emit(CLIENT_EVENTS.ASSIGN_ROLE, { roomCode, targetUserId, role });
  }

  /**
   * Transfer host
   */
  transferHost(roomCode, targetUserId) {
    this.socket?.emit(CLIENT_EVENTS.TRANSFER_HOST, { roomCode, targetUserId });
  }

  /**
   * Remove participant
   */
  removeParticipant(roomCode, targetUserId) {
    this.socket?.emit(CLIENT_EVENTS.REMOVE_PARTICIPANT, { roomCode, targetUserId });
  }

  /**
   * Send message
   */
  sendMessage(roomCode, content) {
    this.socket?.emit(CLIENT_EVENTS.SEND_MESSAGE, { roomCode, content });
  }

  /**
   * Listen for events
   */
  on(event, callback) {
    this.socket?.on(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    this.socket?.off(event, callback);
  }

  /**
   * Get socket instance
   */
  getSocket() {
    return this.socket;
  }
}

export default new SocketService();

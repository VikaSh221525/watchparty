import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useRoomStore } from '../stores/roomStore';
import socketService from '../services/socketService';
import { SERVER_EVENTS } from '../utils/constants';
import { playJoinSound, playLeaveSound } from '../utils/sounds';
import { useSocket } from './useSocket';

/**
 * Custom hook to manage room state and operations
 * @param {string} roomCode - The room code
 * @param {string} userId - The current user's ID
 * @returns {Object} Room operations
 */
export const useRoom = (roomCode, userId) => {
  const navigate = useNavigate();
  const { isConnected } = useSocket();
  const {
    updateParticipants,
    addParticipant,
    removeParticipant,
    updateParticipantRole,
    setHostId
  } = useRoomStore();

  useEffect(() => {
    if (!roomCode || !userId || !isConnected) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    // User joined
    const handleUserJoined = (data) => {
      console.log('USER_JOINED event received:', data);
      addParticipant(data);
      playJoinSound();
    };

    // User left
    const handleUserLeft = (data) => {
      console.log('USER_LEFT event received:', data);
      removeParticipant(data.userId);
      playLeaveSound();
    };

    // Role assigned
    const handleRoleAssigned = (data) => {
      updateParticipantRole(data.userId, data.role);
    };

    // Host transferred
    const handleHostTransferred = (data) => {
      setHostId(data.newHostId);
      updateParticipantRole(data.newHostId, 'host');
      updateParticipantRole(data.previousHostId, 'participant');
    };

    // Participant removed
    const handleParticipantRemoved = (data) => {
      removeParticipant(data.userId);
    };

    // Force disconnect
    const handleForceDisconnect = (data) => {
      alert(data.reason || 'You have been removed from the room');
      navigate('/');
    };

    // Sync state
    const handleSyncState = (data) => {
      updateParticipants(data.participants);
    };

    // Register event listeners directly on socket
    socket.on(SERVER_EVENTS.USER_JOINED, handleUserJoined);
    socket.on(SERVER_EVENTS.USER_LEFT, handleUserLeft);
    socket.on(SERVER_EVENTS.ROLE_ASSIGNED, handleRoleAssigned);
    socket.on(SERVER_EVENTS.HOST_TRANSFERRED, handleHostTransferred);
    socket.on(SERVER_EVENTS.PARTICIPANT_REMOVED, handleParticipantRemoved);
    socket.on(SERVER_EVENTS.FORCE_DISCONNECT, handleForceDisconnect);
    socket.on(SERVER_EVENTS.SYNC_STATE, handleSyncState);

    return () => {
      socket.off(SERVER_EVENTS.USER_JOINED, handleUserJoined);
      socket.off(SERVER_EVENTS.USER_LEFT, handleUserLeft);
      socket.off(SERVER_EVENTS.ROLE_ASSIGNED, handleRoleAssigned);
      socket.off(SERVER_EVENTS.HOST_TRANSFERRED, handleHostTransferred);
      socket.off(SERVER_EVENTS.PARTICIPANT_REMOVED, handleParticipantRemoved);
      socket.off(SERVER_EVENTS.FORCE_DISCONNECT, handleForceDisconnect);
      socket.off(SERVER_EVENTS.SYNC_STATE, handleSyncState);
    };
  }, [roomCode, userId, isConnected, navigate]);

  const joinRoom = (username) => {
    socketService.joinRoom(roomCode, userId, username);
  };

  const leaveRoom = () => {
    socketService.leaveRoom(roomCode, userId);
  };

  const assignRole = (targetUserId, role) => {
    socketService.assignRole(roomCode, targetUserId, role);
  };

  const transferHost = (targetUserId) => {
    socketService.transferHost(roomCode, targetUserId);
  };

  const removeParticipantFromRoom = (targetUserId) => {
    socketService.removeParticipant(roomCode, targetUserId);
  };

  return {
    joinRoom,
    leaveRoom,
    assignRole,
    transferHost,
    removeParticipant: removeParticipantFromRoom
  };
};

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useRoomStore } from '../stores/roomStore';
import socketService from '../services/socketService';
import { SERVER_EVENTS } from '../utils/constants';
import { playJoinSound, playLeaveSound } from '../utils/sounds';

/**
 * Custom hook to manage room state and operations
 * @param {string} roomCode - The room code
 * @param {string} userId - The current user's ID
 * @returns {Object} Room operations
 */
export const useRoom = (roomCode, userId) => {
  const navigate = useNavigate();
  const {
    updateParticipants,
    addParticipant,
    removeParticipant,
    updateParticipantRole,
    setHostId
  } = useRoomStore();

  useEffect(() => {
    if (!roomCode || !userId) return;

    // User joined
    const handleUserJoined = (data) => {
      addParticipant(data);
      playJoinSound();
    };

    // User left
    const handleUserLeft = (data) => {
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

    // Register event listeners
    socketService.on(SERVER_EVENTS.USER_JOINED, handleUserJoined);
    socketService.on(SERVER_EVENTS.USER_LEFT, handleUserLeft);
    socketService.on(SERVER_EVENTS.ROLE_ASSIGNED, handleRoleAssigned);
    socketService.on(SERVER_EVENTS.HOST_TRANSFERRED, handleHostTransferred);
    socketService.on(SERVER_EVENTS.PARTICIPANT_REMOVED, handleParticipantRemoved);
    socketService.on(SERVER_EVENTS.FORCE_DISCONNECT, handleForceDisconnect);
    socketService.on(SERVER_EVENTS.SYNC_STATE, handleSyncState);

    return () => {
      socketService.off(SERVER_EVENTS.USER_JOINED, handleUserJoined);
      socketService.off(SERVER_EVENTS.USER_LEFT, handleUserLeft);
      socketService.off(SERVER_EVENTS.ROLE_ASSIGNED, handleRoleAssigned);
      socketService.off(SERVER_EVENTS.HOST_TRANSFERRED, handleHostTransferred);
      socketService.off(SERVER_EVENTS.PARTICIPANT_REMOVED, handleParticipantRemoved);
      socketService.off(SERVER_EVENTS.FORCE_DISCONNECT, handleForceDisconnect);
      socketService.off(SERVER_EVENTS.SYNC_STATE, handleSyncState);
    };
  }, [roomCode, userId, navigate, addParticipant, removeParticipant, updateParticipantRole, setHostId, updateParticipants]);

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

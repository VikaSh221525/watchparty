import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Create a new room
 */
export const createRoom = async () => {
  const response = await api.post(API_ENDPOINTS.CREATE_ROOM);
  return response.data;
};

/**
 * Get room details
 */
export const getRoomDetails = async (roomCode) => {
  const response = await api.get(API_ENDPOINTS.GET_ROOM(roomCode));
  return response.data;
};

/**
 * Join a room
 */
export const joinRoom = async (roomCode) => {
  const response = await api.post(API_ENDPOINTS.JOIN_ROOM(roomCode));
  return response.data;
};

/**
 * Get room messages
 */
export const getRoomMessages = async (roomCode, limit = 100, before = null) => {
  const params = { limit };
  if (before) {
    params.before = before;
  }
  const response = await api.get(API_ENDPOINTS.GET_MESSAGES(roomCode), { params });
  return response.data;
};

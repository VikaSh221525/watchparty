import express from 'express';
import { createRoom, getRoomDetails, joinRoom } from '../controllers/roomController.js';
import { getMessageHistory } from '../controllers/messageController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRoomCode } from '../middleware/validation.js';

const router = express.Router();

// All room routes require authentication
router.use(requireAuth);

// Create a new room
router.post('/', createRoom);

// Get room details
router.get('/:roomCode', validateRoomCode, getRoomDetails);

// Join a room
router.post('/:roomCode/join', validateRoomCode, joinRoom);

// Get chat history for a room
router.get('/:roomCode/messages', validateRoomCode, getMessageHistory);

export default router;

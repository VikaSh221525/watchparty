import express from 'express';
import roomRoutes from './rooms.js';
import webhookRoutes from './webhooks.js';

const router = express.Router();

// Mount routes
router.use('/rooms', roomRoutes);
router.use('/webhooks', webhookRoutes);

export default router;

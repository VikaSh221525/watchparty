import express from 'express';
import { handleClerkWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Clerk webhook endpoint
// Note: This route needs raw body parsing, configured in server.js
router.post('/clerk', handleClerkWebhook);

export default router;

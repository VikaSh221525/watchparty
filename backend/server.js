import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './src/config/env.js';
import { connectDatabase } from './src/config/database.js';
import { connectRedis, isRedisReady } from './src/config/redis.js';
import { initClerkMiddleware } from './src/middleware/auth.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import {
  helmetMiddleware,
  hppMiddleware,
  mongoSanitizeMiddleware,
  globalRateLimiter
} from './src/middleware/security.js';
import routes from './src/routes/index.js';
import webhookRoutes from './src/routes/webhooks.js';
import { authenticateSocket } from './src/socket/middleware/socketAuth.js';
import { initializeSocketHandlers } from './src/socket/index.js';
import { initRoomCleanupJob } from './src/jobs/roomCleanup.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: config.server.frontendUrl,
    credentials: true
  }
});

// Socket.io authentication middleware
io.use(authenticateSocket);

// Initialize Socket.io event handlers
initializeSocketHandlers(io);

// ─── Security Middleware (must be first) ────────────────────────────────────
// Sets secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmetMiddleware);

// Global rate limiter - 100 req / 15 min per IP (baseline DDoS protection)
app.use(globalRateLimiter);

// CORS - allow only frontend origin
app.use(cors({
  origin: config.server.frontendUrl,
  credentials: true
}));

// ─── Webhook Routes (raw body BEFORE json parsing) ──────────────────────────
// Raw body for webhooks (MUST be before express.json())
app.use('/webhooks/clerk', express.raw({ type: 'application/json' }));

// Webhook routes (MUST be before express.json() and Clerk middleware)
app.use('/webhooks', webhookRoutes);

// ─── Body Parsing & Sanitization ────────────────────────────────────────────
// Clerk middleware (must be before API routes)
app.use(initClerkMiddleware);

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));  // Limit body size to 10kb

// HTTP Parameter Pollution protection
app.use(hppMiddleware);

// NoSQL injection prevention - strips $ and . from req.body/query/params
app.use(mongoSanitizeMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'up' : 'down',
      redis: isRedisReady() ? 'up' : 'down (fallback active)'
    }
  };
  const statusCode = health.services.mongodb === 'down' ? 503 : 200;
  res.status(statusCode).json(health);
});

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Connect to database
await connectDatabase();

// Connect to Redis (optional - app works without it)
await connectRedis();

// Initialize cron jobs
initRoomCleanupJob();

// Start server
const PORT = config.server.port;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${config.server.frontendUrl}`);
  console.log(`🔌 Socket.io server initialized`);
});

export { app, httpServer, io };



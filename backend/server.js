import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './src/config/env.js';
import { connectDatabase } from './src/config/database.js';
import { initClerkMiddleware } from './src/middleware/auth.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import routes from './src/routes/index.js';
import { authenticateSocket } from './src/socket/middleware/socketAuth.js';
import { initializeSocketHandlers } from './src/socket/index.js';

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

// Middleware
app.use(cors({
  origin: config.server.frontendUrl,
  credentials: true
}));

// Raw body for webhooks (MUST be before express.json())
app.use('/webhooks/clerk', express.raw({ type: 'application/json' }));

// Clerk middleware (must be before routes)
app.use(initClerkMiddleware);

// Body parsing
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Connect to database
await connectDatabase();

// Start server
const PORT = config.server.port;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${config.server.frontendUrl}`);
  console.log(`🔌 Socket.io server initialized`);
});

export { app, httpServer, io };

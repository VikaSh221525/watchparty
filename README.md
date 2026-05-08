<div align="center">

# 🎬 Streamify - YouTube Watch Party

### Watch YouTube videos together in perfect sync, anywhere in the world

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.0-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Live Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📖 About The Project

Streamify is a real-time synchronized YouTube watch party application that lets you watch videos with friends, family, or colleagues from anywhere in the world. Experience perfectly synchronized playback, live chat, and role-based controls in a beautiful dark-themed interface — backed by a Redis-accelerated, production-ready backend.

### ✨ Key Features

<table>
<tr>
<td width="50%">

#### 🎥 **Real-Time Synchronization**
- Perfect video sync across all participants
- Host controls play, pause, and seek
- Automatic reconnection with 10-second grace period
- Sub-second latency via Socket.io

</td>
<td width="50%">

#### 👥 **Smart Role-Based Access Control**
- **Host**: Full control over room and playback
- **Moderator**: Can control playback
- **Participant**: Watch and chat
- Auto host-transfer when host leaves

</td>
</tr>
<tr>
<td width="50%">

#### 💬 **Live Chat System**
- Real-time messaging
- Message history persistence
- Join/leave/host-transfer notifications
- Rate limited (30 messages/min)

</td>
<td width="50%">

#### ⚡ **Redis Performance Layer**
- User cache (1hr TTL) — 95% fewer auth queries
- Room cache (30min TTL) — faster playback events
- Redis-backed rate limiting with in-memory fallback
- Graceful degradation if Redis is unavailable

</td>
</tr>
<tr>
<td width="50%">

#### 🔐 **Secure Authentication**
- Powered by Clerk
- Social login support
- Webhook integration with cache invalidation
- Session management

</td>
<td width="50%">

#### 🛡️ **Production-Ready Security**
- Helmet (CSP, HSTS, X-Frame-Options)
- Global rate limiter (100 req / 15 min per IP)
- NoSQL injection prevention
- HTTP Parameter Pollution protection
- Body size limit (10kb)

</td>
</tr>
<tr>
<td width="50%">

#### 🧹 **Automatic Room Cleanup**
- Cron job runs daily at midnight UTC
- Deletes empty rooms inactive for 7+ days
- Cleans up all orphaned messages
- Invalidates Redis cache on deletion

</td>
<td width="50%">

#### 🔄 **Persistent Rooms**
- Rooms stay active even after everyone leaves
- Rejoin anytime using the same room code
- First person to rejoin an empty room becomes host
- Rooms auto-deleted after 7 days of inactivity

#### 🔊 **Enhanced Experience**
- Join/leave sound effects
- Room code sharing
- Participant list with roles
- Video loading states

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-4-5A0EF8?style=flat-square&logo=daisyui&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4-000000?style=flat-square)
![Socket.io Client](https://img.shields.io/badge/Socket.io-4-010101?style=flat-square&logo=socket.io&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=flat-square&logo=socket.io&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square)
![node-cron](https://img.shields.io/badge/node--cron-Jobs-4A90E2?style=flat-square)

</div>

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Redis** - [Redis Cloud](https://redis.io/try-free/) (free tier) or local install
- **Clerk Account** - [Sign up](https://clerk.com/) (free tier available)

> **Note:** Redis is **optional**. The app runs perfectly without it — it automatically falls back to MongoDB for all operations. Redis is only needed for the performance and rate-limiting improvements.

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/streamify.git
cd streamify
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

4. **Configure environment variables**

Create a `.env` file in the `backend` directory:

```env
# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/streamify

# Redis — Option A: Cloud Redis (individual credentials, recommended for production)
REDIS_HOST=your-redis-host.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your-redis-password
REDIS_TLS=false   # set to false for Redis Cloud free tier, true for Upstash

# Redis — Option B: Local Redis URL (for local dev without cloud Redis)
# REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in the `frontend` directory:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. **Set up Clerk Webhooks**

   - Go to your Clerk Dashboard → Webhooks
   - Add endpoint: `http://your-backend-url/webhooks/clerk`
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret to your `.env` file

6. **Run the application**

**Terminal 1 — Backend:**
```bash
cd backend
npm run server
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Health check**: http://localhost:5000/health

---

## 📱 Usage Guide

### Creating a Room

1. **Sign in** using your preferred authentication method (Google, GitHub, or email)
2. Click **"Create Room"** on the landing page
3. Share the generated **room code** with your friends
4. Paste a **YouTube URL** to load a video
5. Use **Play/Pause** controls to manage playback

### Joining a Room

1. **Sign in** to your account
2. Click **"Join Room"** on the landing page
3. Enter the **room code** shared by the host
4. Enjoy synchronized video playback and chat!

### Role Permissions

| Feature | Host | Moderator | Participant |
|---------|------|-----------|-------------|
| Control Playback | ✅ | ✅ | ❌ |
| Change Video | ✅ | ✅ | ❌ |
| Send Messages | ✅ | ✅ | ✅ |
| Assign Roles | ✅ | ❌ | ❌ |
| Remove Participants | ✅ | ❌ | ❌ |
| Leave Room | ✅ | ✅ | ✅ |

### Host Transfer

When the host leaves while other participants are present, the host is **automatically transferred**:

1. The backend promotes the first **moderator** in the room (or the first participant if no moderator exists)
2. All clients receive a `host_transferred` event — the participant list updates instantly
3. The new host's controls unlock (play/pause/seek/change video)
4. A system message appears in chat: *"[OldHost] left. [NewHost] is now the host."*

---

## 📂 Project Structure

```
streamify/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection
│   │   │   ├── env.js               # Environment variable validation
│   │   │   └── redis.js             # Redis client (optional, graceful fallback)
│   │   ├── controllers/
│   │   │   ├── messageController.js # Chat message logic
│   │   │   ├── roomController.js    # Room management
│   │   │   └── webhookController.js # Clerk webhooks + cache invalidation
│   │   ├── jobs/
│   │   │   └── roomCleanup.js       # Cron job: deletes inactive rooms every 5 min
│   │   ├── middleware/
│   │   │   ├── auth.js              # Clerk authentication
│   │   │   ├── errorHandler.js      # Global error handling
│   │   │   ├── rateLimiter.js       # Redis-backed rate limiting
│   │   │   ├── security.js          # Helmet, HPP, NoSQL sanitization
│   │   │   └── validation.js        # Input validation
│   │   ├── models/
│   │   │   ├── Message.js           # Message schema
│   │   │   ├── Room.js              # Room schema
│   │   │   └── User.js              # User schema
│   │   ├── routes/
│   │   │   ├── index.js             # Route aggregator
│   │   │   ├── rooms.js             # Room endpoints (rate limited)
│   │   │   └── webhooks.js          # Webhook endpoints
│   │   ├── socket/
│   │   │   ├── handlers/
│   │   │   │   ├── chatHandlers.js     # Chat events + rate limit
│   │   │   │   ├── playbackHandlers.js # Play/pause/seek/change video
│   │   │   │   ├── roleHandlers.js     # Role assignment, host transfer
│   │   │   │   └── roomHandlers.js     # Join/leave/disconnect + auto host transfer
│   │   │   ├── middleware/
│   │   │   │   └── socketAuth.js       # JWT verify + Redis user cache
│   │   │   └── index.js                # Socket.io event registration
│   │   └── utils/
│   │       ├── constants.js         # Shared event names and error codes
│   │       ├── logger.js            # Winston structured logger
│   │       ├── roomCache.js         # Redis room cache helpers
│   │       ├── roomCodeGenerator.js # Unique room code utility
│   │       └── youtubeParser.js     # YouTube URL → video ID
│   ├── .env
│   ├── package.json
│   └── server.js                    # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInput.jsx        # Chat input component
│   │   │   ├── ChatPanel.jsx        # Chat message display
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── ParticipantList.jsx  # Participant list with roles
│   │   │   ├── RoomControls.jsx     # Playback controls
│   │   │   └── VideoPlayer.jsx      # YouTube IFrame player
│   │   ├── hooks/
│   │   │   ├── useChat.js           # Chat send/receive
│   │   │   ├── usePlayback.js       # Playback sync listeners
│   │   │   ├── useRoom.js           # Room events + host transfer handler
│   │   │   └── useSocket.js         # Socket connection lifecycle
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Create/join room page
│   │   │   └── Room.jsx             # Main watch party page
│   │   ├── routes/
│   │   │   └── index.jsx            # Route definitions
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── roomService.js       # Room API calls
│   │   │   └── socketService.js     # Socket.io singleton client
│   │   ├── stores/
│   │   │   ├── chatStore.js         # Chat messages (Zustand)
│   │   │   ├── roomStore.js         # Room + participants (Zustand)
│   │   │   └── userStore.js         # Current user (Zustand)
│   │   └── utils/
│   │       ├── constants.js         # Event names, API endpoints
│   │       ├── sounds.js            # Join/leave sound effects
│   │       └── youtubeUtils.js      # YouTube URL utilities
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
├── README.md
```

---

## 🎯 Key Features Explained

### Real-Time Synchronization

The app uses Socket.io to maintain perfect video synchronization:

- **Play/Pause Events**: Broadcast to all participants instantly
- **Seek Events**: Sync video position across all clients
- **Drift Correction**: Automatic resync if drift exceeds 2 seconds
- **Reconnection Handling**: 10-second grace period before removing a disconnected user — page refreshes don't kick you out

### Smart Host Transfer

When the host leaves a room with other participants, the backend automatically:

1. Finds the first **moderator** in the room (or falls back to the first participant)
2. Promotes them to host in MongoDB and refreshes the Redis cache
3. Broadcasts `host_transferred` → `user_left` → `new_message` (in order)
4. All clients update in real time — no page refresh needed

### Redis Caching Layer

Redis sits in front of MongoDB as an optional performance layer:

| Cache | Key | TTL | Benefit |
|-------|-----|-----|---------|
| User | `user:{clerkId}` | 1 hour | ~95% fewer MongoDB auth queries on socket connect |
| Room | `room:{roomCode}` | 30 min | Faster playback event handling |
| Chat rate limit | `rl:chat:{userId}` | 60 sec | 30 msg/min per user |
| Seek rate limit | `rl:seek:{userId}` | 60 sec | 20 seeks/min per user |
| Room creation | `rl:room_create:{userId}` | 1 hour | 5 rooms/hr per user |

If Redis is unavailable, **every cache helper returns `null` and the app silently falls back to MongoDB**. There is no single point of failure.

### Persistent Rooms & Automatic Cleanup

Rooms **never go inactive** when participants leave — the room code stays valid indefinitely so you can rejoin without resharing. The new lifecycle:

- **Everyone leaves** → room stays in DB, participants array cleared
- **Someone rejoins** → they become the new host automatically
- **7 days of inactivity** → daily cron job deletes room + all messages + Redis cache

```
0 0 * * *  →  find rooms where participants=[] AND lastActivityAt > 7 days ago
              → delete all messages for each room
              → delete the room document
              → invalidate Redis cache
```

### Automatic Room Cleanup

### Security Stack

Requests pass through this middleware chain before reaching any route:

```
Helmet (secure headers)
  → Global rate limiter (100 req / 15 min per IP)
  → CORS (frontend URL only)
  → Webhook raw body parser
  → Clerk middleware (JWT verification)
  → JSON body parser (10kb limit)
  → HPP (HTTP Parameter Pollution prevention)
  → NoSQL injection sanitizer
  → Routes
```

---

## 🔧 Configuration

### Environment Variables

#### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | ✅ |
| `CLERK_SECRET_KEY` | Clerk secret key | ✅ |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook secret | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `REDIS_HOST` | Redis host (cloud providers) | ❌ optional |
| `REDIS_PORT` | Redis port (cloud providers) | ❌ optional |
| `REDIS_PASSWORD` | Redis password (cloud providers) | ❌ optional |
| `REDIS_URL` | Redis URL (local dev fallback) | ❌ optional |
| `REDIS_TLS` | Enable TLS (`true`/`false`, default `true`) | ❌ optional |
| `PORT` | Server port (default: 5000) | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ |

#### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | ✅ |
| `VITE_API_URL` | Backend API URL | ✅ |
| `VITE_SOCKET_URL` | Socket.io server URL | ✅ |

### Health Check

```
GET /health
```

Returns the status of MongoDB and Redis:

```json
{
  "status": "ok",
  "timestamp": "2026-04-21T13:00:00.000Z",
  "uptime": 3600,
  "services": {
    "mongodb": "up",
    "redis": "up"
  }
}
```

---

## 🚢 Deployment

### Backend Deployment (Render) — Currently Live

1. Push your code to GitHub
2. Connect your repository to [Render](https://render.com)
3. Set environment variables in the Render dashboard:
   - All `CLERK_*` keys
   - `MONGODB_URI`
   - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (from Redis Cloud free tier)
   - `REDIS_TLS=false` (Redis Cloud EC2 free tier doesn't require TLS)
   - `FRONTEND_URL` (your Vercel URL)
4. Deploy — Render auto-deploys on every push to main

### Frontend Deployment (Vercel) — Currently Live

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Set build command: `npm run build`, output directory: `dist`
4. Add environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL` (your Render backend URL + `/api`)
   - `VITE_SOCKET_URL` (your Render backend URL)
5. Deploy!

### Redis Cloud (Free Tier)

Get a free Redis instance at [Redis Cloud](https://redis.io/try-free/):
- 30MB free storage
- No credit card required
- Provides `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- Set `REDIS_TLS=false` for the EC2-hosted free tier

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Vikash Sharma**

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Socket.io](https://socket.io/)
- [Clerk](https://clerk.com/)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/) / [ioredis](https://github.com/luin/ioredis)
- [TailwindCSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Lucide Icons](https://lucide.dev/)
- [node-cron](https://github.com/node-cron/node-cron)

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

Made with ❤️ by [Vikash Sharma]

</div>

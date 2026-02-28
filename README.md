# Streamify - YouTube Watch Party

A real-time synchronized YouTube watch party application built with React, Express, Socket.io, and MongoDB.

## Features

- 🎥 **Synchronized Playback** - Watch YouTube videos together in real-time
- 👥 **Role-Based Access** - Host, Moderator, and Participant roles with different permissions
- 💬 **Live Chat** - Real-time messaging with all participants
- 🎨 **Modern Dark UI** - Beautiful dark theme with smooth animations
- 🔐 **Secure Authentication** - Powered by Clerk
- 🔊 **Sound Effects** - Join/leave sound notifications
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

**Frontend:**
- React 19
- Vite
- TailwindCSS + DaisyUI
- Socket.io Client
- Clerk React
- Zustand (State Management)
- React Router

**Backend:**
- Express 5
- Socket.io
- MongoDB + Mongoose
- Clerk Express
- Svix (Webhooks)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database
- Clerk account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
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

Backend `.env`:
```env
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret
MONGODB_URI=your_mongodb_connection_string
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Frontend `.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. **Run the application**

Start backend:
```bash
cd backend
npm run server
```

Start frontend:
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

1. **Sign in** with Clerk authentication
2. **Create a room** or **join an existing room** with a room code
3. **Host** can load YouTube videos and control playback
4. **All participants** can chat and see synchronized video playback
5. **Host** can promote participants to moderators or remove them

## Project Structure

```
streamify/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and environment config
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth and validation
│   │   ├── socket/         # Socket.io handlers
│   │   └── utils/          # Helper functions
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Route definitions
│   │   ├── services/       # API and Socket services
│   │   ├── stores/         # Zustand stores
│   │   └── utils/          # Helper functions
│   └── public/             # Static assets
└── README.md
```

## License

MIT

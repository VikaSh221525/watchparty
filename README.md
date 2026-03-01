<div align="center">

# 🎬 Streamify - YouTube Watch Party

### Watch YouTube videos together in perfect sync, anywhere in the world

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.0-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Live Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📖 About The Project

Streamify is a real-time synchronized YouTube watch party application that lets you watch videos with friends, family, or colleagues from anywhere in the world. Experience perfectly synchronized playback, live chat, and role-based controls in a beautiful dark-themed interface.

### ✨ Key Features

<table>
<tr>
<td width="50%">

#### 🎥 **Real-Time Synchronization**
- Perfect video sync across all participants
- Host controls play, pause, and seek
- Automatic reconnection handling
- Sub-second latency

</td>
<td width="50%">

#### 👥 **Role-Based Access Control**
- **Host**: Full control over room and playback
- **Moderator**: Can control playback
- **Participant**: Watch and chat
- Dynamic role assignment

</td>
</tr>
<tr>
<td width="50%">

#### 💬 **Live Chat System**
- Real-time messaging
- Message history persistence
- Join/leave notifications
- Character limit validation

</td>
<td width="50%">

#### 🎨 **Modern UI/UX**
- Beautiful dark theme (Forest DaisyUI)
- Smooth animations
- Responsive design
- Mobile-friendly interface

</td>
</tr>
<tr>
<td width="50%">

#### 🔐 **Secure Authentication**
- Powered by Clerk
- Social login support
- Webhook integration
- Session management

</td>
<td width="50%">

#### 🔊 **Enhanced Experience**
- Join/leave sound effects
- Room code sharing
- Participant list with avatars
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
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=flat-square&logo=socket.io&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square)

</div>

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Clerk Account** - [Sign up](https://clerk.com/) (free tier available)

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

- Go to your Clerk Dashboard
- Navigate to Webhooks
- Add endpoint: `http://your-backend-url/api/webhooks/clerk`
- Subscribe to events: `user.created`, `user.updated`, `user.deleted`
- Copy the webhook secret to your `.env` file

6. **Run the application**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

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

---

## 📂 Project Structure

```
streamify/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection
│   │   │   └── env.js               # Environment variables
│   │   ├── controllers/
│   │   │   ├── messageController.js # Chat message logic
│   │   │   ├── roomController.js    # Room management
│   │   │   └── webhookController.js # Clerk webhooks
│   │   ├── middleware/
│   │   │   ├── auth.js              # Clerk authentication
│   │   │   ├── errorHandler.js      # Error handling
│   │   │   └── validation.js        # Input validation
│   │   ├── models/
│   │   │   ├── Message.js           # Message schema
│   │   │   ├── Room.js              # Room schema
│   │   │   └── User.js              # User schema
│   │   ├── routes/
│   │   │   ├── messageRoutes.js     # Message endpoints
│   │   │   ├── roomRoutes.js        # Room endpoints
│   │   │   └── webhookRoutes.js     # Webhook endpoints
│   │   ├── socket/
│   │   │   ├── handlers/
│   │   │   │   ├── chatHandlers.js  # Chat events
│   │   │   │   ├── playbackHandlers.js # Playback sync
│   │   │   │   ├── roleHandlers.js  # Role management
│   │   │   │   └── roomHandlers.js  # Room events
│   │   │   ├── middleware/
│   │   │   │   └── socketAuth.js    # Socket authentication
│   │   │   └── index.js             # Socket.io setup
│   │   └── utils/
│   │       ├── constants.js         # App constants
│   │       ├── logger.js            # Winston logger
│   │       ├── roomCodeGenerator.js # Room code utility
│   │       └── youtubeParser.js     # YouTube URL parser
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── server.js                    # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInput.jsx        # Chat input component
│   │   │   ├── ChatPanel.jsx        # Chat display
│   │   │   ├── Navbar.jsx           # Navigation bar
│   │   │   ├── ParticipantList.jsx  # Participant list
│   │   │   ├── RoomControls.jsx     # Playback controls
│   │   │   └── VideoPlayer.jsx      # YouTube player
│   │   ├── hooks/
│   │   │   ├── useChat.js           # Chat hook
│   │   │   ├── usePlayback.js       # Playback sync hook
│   │   │   ├── useRoom.js           # Room management hook
│   │   │   └── useSocket.js         # Socket connection hook
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Landing page
│   │   │   └── Room.jsx             # Room page
│   │   ├── routes/
│   │   │   └── index.jsx            # Route definitions
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── roomService.js       # Room API calls
│   │   │   └── socketService.js     # Socket.io client
│   │   ├── stores/
│   │   │   ├── chatStore.js         # Chat state (Zustand)
│   │   │   ├── roomStore.js         # Room state (Zustand)
│   │   │   └── userStore.js         # User state (Zustand)
│   │   ├── utils/
│   │   │   ├── constants.js         # Frontend constants
│   │   │   ├── sounds.js            # Sound effects
│   │   │   └── youtubeUtils.js      # YouTube utilities
│   │   ├── App.jsx                  # Root component
│   │   ├── index.css                # Global styles
│   │   └── main.jsx                 # Entry point
│   ├── public/
│   │   ├── joinmeetsound.mp3        # Join sound
│   │   ├── leavemeetsound.mp3       # Leave sound
│   │   └── landingpageImg.png       # Landing image
│   ├── .env                         # Environment variables
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js           # Tailwind configuration
│   └── vite.config.js               # Vite configuration
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🎯 Key Features Explained

### Real-Time Synchronization

The app uses Socket.io to maintain perfect video synchronization:

- **Play/Pause Events**: Broadcast to all participants instantly
- **Seek Events**: Sync video position across all clients
- **Drift Correction**: Automatic resync if drift exceeds 2 seconds
- **Reconnection Handling**: Seamless reconnection with state restoration

### Role-Based Access Control

Three distinct roles with different permissions:

- **Host**: Creator of the room, full control
- **Moderator**: Can control playback, assigned by host
- **Participant**: Can watch and chat

### Chat System

- Real-time messaging with Socket.io
- Message persistence in MongoDB
- Character limit (500 characters)
- System notifications for join/leave events
- Scroll optimization for smooth UX

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
| `PORT` | Server port (default: 5000) | ❌ |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ |

#### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | ✅ |
| `VITE_API_URL` | Backend API URL | ✅ |
| `VITE_SOCKET_URL` | Socket.io server URL | ✅ |

---

## 🚢 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. Push your code to GitHub
2. Connect your repository to your hosting platform
3. Set environment variables in the platform dashboard
4. Deploy!

### Frontend Deployment (Vercel/Netlify)

1. Push your code to GitHub
2. Connect your repository to Vercel/Netlify
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables
6. Deploy!

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

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Socket.io](https://socket.io/)
- [Clerk](https://clerk.com/)
- [MongoDB](https://www.mongodb.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Lucide Icons](https://lucide.dev/)

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

Made with ❤️ by [Your Name]

</div>

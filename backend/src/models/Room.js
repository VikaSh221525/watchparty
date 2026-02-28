import mongoose from 'mongoose';
import { config } from '../config/env.js';

const participantSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['host', 'moderator', 'participant'],
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const roomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9]{6,10}$/.test(v);
      },
      message: 'Room code must be 6-10 alphanumeric characters'
    }
  },
  hostId: {
    type: String,
    required: true,
    index: true
  },
  participants: [participantSchema],
  currentVideo: {
    videoId: String,
    title: String,
    loadedAt: Date
  },
  playbackState: {
    isPlaying: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Validate single host constraint
roomSchema.pre('save', function() {
  const hostCount = this.participants.filter(p => p.role === 'host').length;
  if (hostCount !== 1) {
    throw new Error('Room must have exactly one host');
  }
});

// Virtual field for shareable link
roomSchema.virtual('shareableLink').get(function() {
  return `${config.server.frontendUrl}/room/${this.roomCode}`;
});

// Ensure virtuals are included in JSON
roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

const Room = mongoose.model('Room', roomSchema);

export default Room;

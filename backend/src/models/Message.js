import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true
  },
  roomCode: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    ref: 'User.clerkId'
  },
  username: {
    type: String
  },
  content: {
    type: String,
    required: true,
    maxLength: 500
  },
  type: {
    type: String,
    enum: ['user', 'system'],
    required: true,
    default: 'user'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient history queries
messageSchema.index({ roomCode: 1, timestamp: -1 });

// Validation for type-specific required fields
messageSchema.pre('save', function() {
  if (this.type === 'user' && (!this.userId || !this.username)) {
    throw new Error('User messages must have userId and username');
  }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;

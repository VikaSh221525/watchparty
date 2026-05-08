import cron from 'node-cron';
import Room from '../models/Room.js';
import Message from '../models/Message.js';
import { invalidateRoomCache } from '../utils/roomCache.js';
import { logger } from '../utils/logger.js';

const INACTIVITY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Clean up rooms that have been empty and inactive for 7+ days.
 * Runs daily at midnight UTC.
 *
 * A room is eligible for deletion when:
 *  - participants array is empty (everyone has left)
 *  - lastActivityAt is older than 7 days
 *
 * For each eligible room:
 *  1. Delete all its messages
 *  2. Delete the room document
 *  3. Invalidate its Redis cache entry
 */
const cleanupInactiveRooms = async () => {
  try {
    const cutoffTime = new Date(Date.now() - INACTIVITY_THRESHOLD_MS);

    // Find rooms with no participants that haven't been active in 7 days
    const inactiveRooms = await Room.find({
      participants: { $size: 0 },
      lastActivityAt: { $lt: cutoffTime }
    });

    if (inactiveRooms.length === 0) {
      logger.debug('Room cleanup: no inactive rooms found');
      return;
    }

    let totalMessagesDeleted = 0;

    for (const room of inactiveRooms) {
      const messageResult = await Message.deleteMany({ roomCode: room.roomCode });
      totalMessagesDeleted += messageResult.deletedCount;

      await Room.deleteOne({ _id: room._id });
      await invalidateRoomCache(room.roomCode);

      logger.debug('Cleaned up inactive room', {
        roomCode: room.roomCode,
        messagesDeleted: messageResult.deletedCount,
        lastActivityAt: room.lastActivityAt
      });
    }

    logger.info('Room cleanup completed', {
      roomsDeleted: inactiveRooms.length,
      messagesDeleted: totalMessagesDeleted
    });
  } catch (error) {
    logger.error('Room cleanup job failed', {
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * Initialize and start the room cleanup cron job.
 * Schedule: daily at midnight UTC (0 0 * * *)
 */
export const initRoomCleanupJob = () => {
  cron.schedule('0 0 * * *', cleanupInactiveRooms, {
    scheduled: true,
    timezone: 'UTC'
  });

  logger.info('Room cleanup cron job initialized (runs daily at midnight UTC)');
};

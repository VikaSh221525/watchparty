import { Webhook } from 'svix';
import User from '../models/User.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Handle Clerk webhook events
 * Syncs user data from Clerk to MongoDB
 */

export const handleClerkWebhook = async (req, res) => {
  try {
    // Get webhook signature headers
    const svixId = req.headers['svix-id'];
    const svixTimestamp = req.headers['svix-timestamp'];
    const svixSignature = req.headers['svix-signature'];

    // Verify webhook signature
    const wh = new Webhook(config.clerk.webhookSecret);
    let evt;

    try {
      evt = wh.verify((req.body), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature
      });
    } catch (err) {
      logger.error('Webhook signature verification failed', {
        error: err.message
      });
      return res.status(400).json({
        error: {
          message: 'Invalid webhook signature',
          code: 'INVALID_SIGNATURE'
        }
      });
    }

    // Handle different event types
    const { type, data } = evt;

    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      
      default:
        logger.info('Unhandled webhook event type', { type });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: {
        message: 'Webhook processing failed',
        code: 'WEBHOOK_ERROR'
      }
    });
  }
};

/**
 * Handle user.created event
 */
const handleUserCreated = async (data) => {
  try {
    // Validate required data
    if (!data.id || !data.email_addresses || data.email_addresses.length === 0) {
      logger.error('Invalid user data from webhook', {
        clerkId: data.id,
        hasEmail: !!data.email_addresses?.length
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: data.id });
    if (existingUser) {
      logger.info('User already exists, skipping creation', {
        clerkId: data.id,
        email: existingUser.email
      });
      return;
    }

    const user = new User({
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address,
      username: data.username || data.first_name || data.email_addresses[0]?.email_address.split('@')[0],
      firstName: data.first_name,
      lastName: data.last_name,
      profileImageUrl: data.profile_image_url
    });

    await user.save();

    logger.info('User created from webhook', {
      clerkId: data.id,
      email: user.email,
      username: user.username
    });
  } catch (error) {
    // Check if it's a duplicate key error
    if (error.code === 11000) {
      logger.warn('Duplicate user creation attempt', {
        clerkId: data?.id,
        email: data?.email_addresses?.[0]?.email_address
      });
      return;
    }
    
    logger.error('Failed to create user from webhook', {
      error: error.message,
      stack: error.stack,
      clerkId: data?.id
    });
    // Don't throw - just log the error
  }
};

/**
 * Handle user.updated event
 */
const handleUserUpdated = async (data) => {
  try {
    const user = await User.findOne({ clerkId: data.id });
    if (!user) {
      // User doesn't exist, create it
      await handleUserCreated(data);
      return;
    }

    // Update user fields
    user.email = data.email_addresses[0]?.email_address || user.email;
    user.username = data.username || user.username;
    user.firstName = data.first_name;
    user.lastName = data.last_name;
    user.profileImageUrl = data.profile_image_url;
    user.updatedAt = Date.now();

    await user.save();

    logger.info('User updated from webhook', {
      clerkId: data.id,
      username: user.username
    });
  } catch (error) {
    logger.error('Failed to update user from webhook', {
      error: error.message,
      stack: error.stack,
      clerkId: data?.id
    });
    // Don't throw - just log the error
  }
};

/**
 * Handle user.deleted event
 */
const handleUserDeleted = async (data) => {
  try {
    await User.deleteOne({ clerkId: data.id });

    logger.info('User deleted from webhook', {
      clerkId: data.id
    });
  } catch (error) {
    logger.error('Failed to delete user from webhook', {
      error: error.message,
      stack: error.stack,
      clerkId: data?.id
    });
    // Don't throw - just log the error
  }
};

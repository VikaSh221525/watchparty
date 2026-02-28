import { SOUNDS } from './constants';

/**
 * Play join sound
 */
export const playJoinSound = () => {
  try {
    const audio = new Audio(SOUNDS.JOIN);
    audio.volume = 0.5;
    audio.play().catch(err => console.error('Failed to play join sound:', err));
  } catch (error) {
    console.error('Error playing join sound:', error);
  }
};

/**
 * Play leave sound
 */
export const playLeaveSound = () => {
  try {
    const audio = new Audio(SOUNDS.LEAVE);
    audio.volume = 0.5;
    audio.play().catch(err => console.error('Failed to play leave sound:', err));
  } catch (error) {
    console.error('Error playing leave sound:', error);
  }
};

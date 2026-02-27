import crypto from 'crypto';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 8; // Default length between 6-10

/**
 * Generate a unique room code
 * @param {number} length - Length of the room code (default: 8)
 * @returns {string} - Alphanumeric room code
 */
export const generateRoomCode = (length = CODE_LENGTH) => {
  // Ensure length is between 6 and 10
  const codeLength = Math.max(6, Math.min(10, length));
  
  const bytes = crypto.randomBytes(codeLength);
  let code = '';
  
  for (let i = 0; i < codeLength; i++) {
    code += CHARACTERS[bytes[i] % CHARACTERS.length];
  }
  
  return code;
};

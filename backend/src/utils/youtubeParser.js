/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 * - youtube.com/v/VIDEO_ID
 * 
 * @param {string} url - YouTube URL
 * @returns {string|null} - 11-character video ID or null if invalid
 */
export const extractVideoId = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Remove whitespace
  url = url.trim();

  // Pattern 1: youtube.com/watch?v=VIDEO_ID
  const watchPattern = /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
  let match = url.match(watchPattern);
  if (match) {
    return match[1];
  }

  // Pattern 2: youtu.be/VIDEO_ID
  const shortPattern = /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  match = url.match(shortPattern);
  if (match) {
    return match[1];
  }

  // Pattern 3: youtube.com/embed/VIDEO_ID
  const embedPattern = /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  match = url.match(embedPattern);
  if (match) {
    return match[1];
  }

  // Pattern 4: youtube.com/v/VIDEO_ID
  const vPattern = /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/;
  match = url.match(vPattern);
  if (match) {
    return match[1];
  }

  return null;
};

/**
 * Validate if a URL is a valid YouTube URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  return extractVideoId(url) !== null;
};

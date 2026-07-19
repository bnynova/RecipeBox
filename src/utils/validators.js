/**
 * Check whether a string contains meaningful content.
 * @param {string} value
 */
export function isRequired(value) {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
}

/**
 * Validate an email address with a simple client-side pattern.
 * @param {string} email
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate that the selected file is an image and within the size limit.
 * @param {File | null | undefined} file
 * @param {number} [maxSizeMb=5]
 */
export function isValidImageFile(file, maxSizeMb = 5) {
  if (!file) {
    return false;
  }

  const isImage = file.type.startsWith('image/');
  const sizeLimit = maxSizeMb * 1024 * 1024;

  return isImage && file.size <= sizeLimit;
}
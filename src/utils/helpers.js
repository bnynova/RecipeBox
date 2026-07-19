/**
 * Convert a dataset value into a boolean.
 * @param {HTMLElement | null} element
 * @param {string} key
 * @param {boolean} fallback
 */
export function readBooleanDataAttribute(element, key, fallback = false) {
  if (!element) {
    return fallback;
  }

  const value = element.dataset[key];
  if (value === undefined) {
    return fallback;
  }

  return value === 'true';
}

/**
 * Escape user-facing text before injecting it into HTML strings.
 * @param {string} value
 */
export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Format a date for display in recipe and profile views.
 * @param {string | number | Date} value
 */
export function formatDate(value) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
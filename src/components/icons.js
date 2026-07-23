/**
 * Render a Bootstrap Icon element.
 * @param {string} name
 * @param {string} [className]
 */
export function icon(name, className = '') {
  return `<i class="bi ${name}${className ? ` ${className}` : ''}" aria-hidden="true"></i>`;
}

/**
 * Render a five-star rating strip using Bootstrap Icons.
 * @param {number | null | undefined} value
 * @param {{ showValue?: boolean, muted?: boolean }} [options]
 */
export function renderRatingStars(value, options = {}) {
  const { showValue = false, muted = false } = options;
  const numericValue = Number(value);
  const hasValue = Number.isFinite(numericValue);
  const roundedValue = hasValue ? Math.max(0, Math.min(5, Math.round(numericValue * 2) / 2)) : 0;
  const starClass = muted ? 'rating-stars rating-stars--muted' : 'rating-stars';

  const stars = Array.from({ length: 5 }, (_, index) => {
    const starIndex = index + 1;

    if (!hasValue) {
      return icon('bi-star');
    }

    if (roundedValue >= starIndex) {
      return icon('bi-star-fill');
    }

    if (roundedValue >= starIndex - 0.5) {
      return icon('bi-star-half');
    }

    return icon('bi-star');
  }).join('');

  const valueMarkup = hasValue && showValue ? `<span class="ms-2 text-secondary">${roundedValue.toFixed(1)}</span>` : '';
  const label = hasValue ? `${roundedValue.toFixed(1)} out of 5` : 'No rating yet';

  return `<span class="${starClass}" aria-label="${label}">${stars}${valueMarkup}</span>`;
}

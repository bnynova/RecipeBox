import { escapeHtml } from '../utils/helpers.js';

/**
 * Render a Bootstrap recipe card for browse and featured recipe sections.
 * @param {object} recipe
 * @param {string} recipe.title
 * @param {string} [recipe.categoryName]
 * @param {string} [recipe.authorName]
 * @param {string} [recipe.imageUrl]
 * @param {string} [recipe.href]
 */
export function createRecipeCard(recipe) {
  const safeTitle = escapeHtml(recipe.title);
  const safeCategory = escapeHtml(recipe.categoryName ?? 'Uncategorized');
  const safeAuthor = escapeHtml(recipe.authorName ?? 'Unknown author');
  const safeDescription = escapeHtml(recipe.excerpt ?? recipe.description ?? '');
  const imageMarkup = recipe.imageUrl
    ? `<img src="${recipe.imageUrl}" class="card-img-top recipe-card__image" alt="${safeTitle}">`
    : `<div class="recipe-card__placeholder"></div>`;

  return `
    <a class="card recipe-card h-100 shadow-sm text-decoration-none text-reset" href="${recipe.href ?? '/pages/recipe-details.html'}">
      ${imageMarkup}
      <div class="card-body d-flex flex-column gap-2">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <span class="badge text-bg-light border text-uppercase fw-semibold">${safeCategory}</span>
        </div>
        <h3 class="h5 card-title mb-0">${safeTitle}</h3>
        <p class="card-text text-secondary mb-0">${safeDescription}</p>
        <p class="small text-secondary mb-0 mt-auto">By ${safeAuthor}</p>
      </div>
    </a>
  `;
}
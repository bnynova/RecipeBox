/**
 * Render a Bootstrap recipe card for browse and featured recipe sections.
 * @param {object} recipe
 * @param {string} recipe.title
 * @param {string} [recipe.imageUrl]
 * @param {string} [recipe.excerpt]
 * @param {string} [recipe.href]
 */
export function createRecipeCard(recipe) {
  const imageMarkup = recipe.imageUrl
    ? `<img src="${recipe.imageUrl}" class="card-img-top recipe-card__image" alt="${recipe.title}">`
    : `<div class="recipe-card__placeholder"></div>`;

  return `
    <article class="card recipe-card h-100 shadow-sm">
      ${imageMarkup}
      <div class="card-body">
        <h3 class="h5 card-title">${recipe.title}</h3>
        <p class="card-text text-secondary">${recipe.excerpt ?? 'A delicious recipe from the RecipeBox community.'}</p>
        <a class="btn btn-primary btn-sm" href="${recipe.href ?? '/pages/recipe-details.html'}">View recipe</a>
      </div>
    </article>
  `;
}
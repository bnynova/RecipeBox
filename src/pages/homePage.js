import { createRecipeCard } from '../components/recipeCard.js';
import { showToast } from '../components/toasts.js';
import { listRecipes } from '../services/recipesService.js';

function renderLoading(root) {
  root.querySelector('[data-home-featured-loading]')?.classList.remove('d-none');
  root.querySelector('[data-home-featured-empty]')?.classList.add('d-none');
  root.querySelector('[data-home-featured-grid]')?.classList.add('d-none');
}

function renderEmptyState(root, message = 'No featured recipes available yet.') {
  const emptyState = root.querySelector('[data-home-featured-empty]');

  if (emptyState) {
    emptyState.querySelector('[data-empty-message]')?.replaceChildren(document.createTextNode(message));
    emptyState.classList.remove('d-none');
  }

  root.querySelector('[data-home-featured-loading]')?.classList.add('d-none');
  root.querySelector('[data-home-featured-grid]')?.classList.add('d-none');
}

function renderGrid(root, recipes) {
  const grid = root.querySelector('[data-home-featured-grid]');

  if (!grid) {
    return;
  }

  grid.innerHTML = recipes
    .map(
      (recipe) => `
        <div class="col-12 col-md-6 col-lg-4">
          ${createRecipeCard(recipe)}
        </div>
      `,
    )
    .join('');

  grid.classList.remove('d-none');
  root.querySelector('[data-home-featured-empty]')?.classList.add('d-none');
  root.querySelector('[data-home-featured-loading]')?.classList.add('d-none');
}

/**
 * Wire up the public home page.
 * @param {HTMLElement} root
 */
export async function setupHomePage(root) {
  try {
    renderLoading(root);

    const recipes = await listRecipes();
    const featuredRecipes = recipes.slice(0, 3);

    if (featuredRecipes.length === 0) {
      renderEmptyState(root);
      return;
    }

    renderGrid(root, featuredRecipes);
  } catch (error) {
    showToast(error.message, { variant: 'error' });
    renderEmptyState(root, 'Unable to load featured recipes');
  }
}
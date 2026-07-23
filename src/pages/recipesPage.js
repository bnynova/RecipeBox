import { createRecipeCard } from '../components/recipeCard.js';
import { showToast } from '../components/toasts.js';
import { listCategories, listRecipes } from '../services/recipesService.js';

function normalizeSearchValue(value) {
  return value.trim().toLowerCase();
}

function renderLoading(root) {
  root.querySelector('[data-recipes-loading]')?.classList.remove('d-none');
  root.querySelector('[data-recipes-empty]')?.classList.add('d-none');
  root.querySelector('[data-recipes-grid]')?.classList.add('d-none');
}

function renderEmptyState(root, message = 'No recipes found') {
  const emptyState = root.querySelector('[data-recipes-empty]');

  if (emptyState) {
    emptyState.querySelector('[data-empty-message]')?.replaceChildren(document.createTextNode(message));
    emptyState.classList.remove('d-none');
  }

  root.querySelector('[data-recipes-loading]')?.classList.add('d-none');
  root.querySelector('[data-recipes-grid]')?.classList.add('d-none');
}

function renderGrid(root, recipes) {
  const grid = root.querySelector('[data-recipes-grid]');

  if (!grid) {
    return;
  }

  grid.innerHTML = recipes
    .map(
      (recipe) => `
        <div class="col-12 col-md-6 col-xl-4">
          ${createRecipeCard(recipe)}
        </div>
      `,
    )
    .join('');

  grid.classList.remove('d-none');
  root.querySelector('[data-recipes-empty]')?.classList.add('d-none');
  root.querySelector('[data-recipes-loading]')?.classList.add('d-none');
}

function applyFilters(root, state) {
  const searchQuery = normalizeSearchValue(root.querySelector('[data-recipes-search]')?.value ?? '');
  const categoryValue = root.querySelector('[data-recipes-category]')?.value ?? 'all';

  const filteredRecipes = state.recipes.filter((recipe) => {
    const titleMatch = recipe.title.toLowerCase().includes(searchQuery);
    const categoryMatch = categoryValue === 'all' || String(recipe.categoryId) === categoryValue;

    return titleMatch && categoryMatch;
  });

  if (filteredRecipes.length === 0) {
    renderEmptyState(root, searchQuery || categoryValue !== 'all' ? 'No search results found' : 'No recipes found');
    return;
  }

  renderGrid(root, filteredRecipes);
}

function setCategoryOptions(root, categories) {
  const select = root.querySelector('[data-recipes-category]');

  if (!select) {
    return;
  }

  select.innerHTML = [
    '<option value="all">All categories</option>',
    ...categories.map((category) => `<option value="${category.id}">${category.name}</option>`),
  ].join('');
}

/**
 * Wire up the public recipes page.
 * @param {HTMLElement} root
 */
export async function setupRecipesPage(root) {
  const state = {
    recipes: [],
    categories: [],
  };

  const searchInput = root.querySelector('[data-recipes-search]');
  const categorySelect = root.querySelector('[data-recipes-category]');

  searchInput?.addEventListener('input', () => applyFilters(root, state));
  categorySelect?.addEventListener('change', () => applyFilters(root, state));

  try {
    renderLoading(root);

    const [categories, recipes] = await Promise.all([listCategories(), listRecipes()]);
    state.categories = categories;
    state.recipes = recipes;

    setCategoryOptions(root, categories);

    if (recipes.length === 0) {
      renderEmptyState(root);
      return;
    }

    renderGrid(root, recipes);
  } catch (error) {
    showToast(error.message, { variant: 'error' });
    renderEmptyState(root, 'Unable to load recipes');
  }
}
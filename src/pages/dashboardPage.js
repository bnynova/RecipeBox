import { createRecipeCard } from '../components/recipeCard.js';
import { showToast } from '../components/toasts.js';
import { listCategories, listDashboardRecipes } from '../services/recipesService.js';

function normalizeSearchValue(value) {
  return value.trim().toLowerCase();
}

function renderLoading(root) {
  root.querySelector('[data-dashboard-loading]')?.classList.remove('d-none');
  root.querySelector('[data-dashboard-empty]')?.classList.add('d-none');
  root.querySelector('[data-dashboard-grid]')?.classList.add('d-none');
}

function renderEmptyState(root, message = 'No recipes found') {
  const emptyState = root.querySelector('[data-dashboard-empty]');
  if (emptyState) {
    emptyState.querySelector('[data-empty-message]')?.replaceChildren(document.createTextNode(message));
    emptyState.classList.remove('d-none');
  }

  root.querySelector('[data-dashboard-grid]')?.classList.add('d-none');
  root.querySelector('[data-dashboard-loading]')?.classList.add('d-none');
}

function renderGrid(root, recipes) {
  const grid = root.querySelector('[data-dashboard-grid]');
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
  root.querySelector('[data-dashboard-empty]')?.classList.add('d-none');
  root.querySelector('[data-dashboard-loading]')?.classList.add('d-none');
}

function applyFilters(root, state) {
  const searchQuery = normalizeSearchValue(root.querySelector('[data-dashboard-search]')?.value ?? '');
  const categoryValue = root.querySelector('[data-dashboard-category]')?.value ?? 'all';

  const filteredRecipes = state.recipes.filter((recipe) => {
    const titleMatch = recipe.title.toLowerCase().includes(searchQuery);
    const categoryMatch = categoryValue === 'all' || String(recipe.categoryId) === categoryValue;

    return titleMatch && categoryMatch;
  });

  if (filteredRecipes.length === 0) {
    renderEmptyState(root);
    return;
  }

  renderGrid(root, filteredRecipes);
}

function setCategoryOptions(root, categories) {
  const select = root.querySelector('[data-dashboard-category]');
  if (!select) {
    return;
  }

  select.innerHTML = [
    '<option value="all">All categories</option>',
    ...categories.map((category) => `<option value="${category.id}">${category.name}</option>`),
  ].join('');
}

/**
 * Wire up the dashboard page UI and data loading.
 * @param {HTMLElement} root
 */
export async function setupDashboardPage(root) {
  const state = {
    recipes: [],
    categories: [],
  };

  const searchInput = root.querySelector('[data-dashboard-search]');
  const categorySelect = root.querySelector('[data-dashboard-category]');
  const addRecipeButtons = root.querySelectorAll('[data-action="add-recipe"]');

  addRecipeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      window.location.assign('/pages/recipe-form.html');
    });
  });

  searchInput?.addEventListener('input', () => applyFilters(root, state));
  categorySelect?.addEventListener('change', () => applyFilters(root, state));

  try {
    renderLoading(root);

    const [categories, recipes] = await Promise.all([listCategories(), listDashboardRecipes()]);
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
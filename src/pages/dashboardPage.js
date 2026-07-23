import { createRecipeCard } from '../components/recipeCard.js';
import { showToast } from '../components/toasts.js';
import { filterRecipesByTag, listCategories, listDashboardRecipes, listTags } from '../services/recipesService.js';

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
  const tagValue = root.querySelector('[data-dashboard-tag]')?.value ?? 'all';

  const filteredRecipes = filterRecipesByTag(state.recipes, tagValue).filter((recipe) => {
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
  const select = root.querySelector('[data-dashboard-category]');
  if (!select) {
    return;
  }

  select.innerHTML = [
    '<option value="all">All categories</option>',
    ...categories.map((category) => `<option value="${category.id}">${category.name}</option>`),
  ].join('');
}

function setTagOptions(root, tags) {
  const select = root.querySelector('[data-dashboard-tag]');

  if (!select) {
    return;
  }

  select.innerHTML = [
    '<option value="all">All tags</option>',
    ...tags.map((tag) => `<option value="${tag.id}">${tag.name}</option>`),
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
    tags: [],
  };

  const searchInput = root.querySelector('[data-dashboard-search]');
  const categorySelect = root.querySelector('[data-dashboard-category]');
  const tagSelect = root.querySelector('[data-dashboard-tag]');
  const addRecipeButtons = root.querySelectorAll('[data-action="add-recipe"]');

  addRecipeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      window.location.assign('/recipe/add');
    });
  });

  searchInput?.addEventListener('input', () => applyFilters(root, state));
  categorySelect?.addEventListener('change', () => applyFilters(root, state));
  tagSelect?.addEventListener('change', () => applyFilters(root, state));

  try {
    renderLoading(root);

    const [categories, tags, recipes] = await Promise.all([listCategories(), listTags(), listDashboardRecipes()]);
    state.categories = categories;
    state.tags = tags;
    state.recipes = recipes;

    setCategoryOptions(root, categories);
    setTagOptions(root, tags);

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
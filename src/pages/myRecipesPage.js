import { Modal } from 'bootstrap';

import { showToast } from '../components/toasts.js';
import { deleteRecipe, listMyRecipes } from '../services/recipesService.js';
import { escapeHtml, truncateText } from '../utils/helpers.js';
import { getCurrentUser } from '../services/authService.js';
import { deleteRecipeImageByUrl } from '../services/storageService.js';

const FLASH_TOAST_KEY = 'recipebox:flash-toast';

function takeFlashToast() {
  const rawValue = sessionStorage.getItem(FLASH_TOAST_KEY);

  if (!rawValue) {
    return null;
  }

  sessionStorage.removeItem(FLASH_TOAST_KEY);

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function formatAverageRating(value) {
  if (value === null || value === undefined) {
    return '—';
  }

  return value.toFixed(1);
}

function renderLoading(root) {
  root.querySelector('[data-my-recipes-loading]')?.classList.remove('d-none');
  root.querySelector('[data-my-recipes-empty]')?.classList.add('d-none');
  root.querySelector('[data-my-recipes-table-wrap]')?.classList.add('d-none');
}

function renderEmptyState(root, message = 'No recipes found') {
  root.querySelector('[data-my-recipes-loading]')?.classList.add('d-none');
  const empty = root.querySelector('[data-my-recipes-empty]');
  if (empty) {
    empty.querySelector('[data-empty-message]')?.replaceChildren(document.createTextNode(message));
    empty.classList.remove('d-none');
  }
  root.querySelector('[data-my-recipes-table-wrap]')?.classList.add('d-none');
}

function renderTable(root, recipes) {
  const tbody = root.querySelector('[data-my-recipes-tbody]');
  if (!tbody) {
    return;
  }

  tbody.innerHTML = recipes
    .map(
      (recipe) => `
        <tr>
          <td class="fw-semibold">${escapeHtml(recipe.title)}</td>
          <td>${escapeHtml(recipe.categoryName)}</td>
          <td class="text-secondary text-truncate my-recipes__description">${escapeHtml(truncateText(recipe.description, 120))}</td>
          <td>${recipe.commentCount}</td>
          <td>${formatAverageRating(recipe.avgRating)}</td>
          <td>
            <div class="d-flex flex-wrap gap-2">
              <a class="btn btn-outline-secondary btn-sm" href="/pages/recipe-details.html?id=${recipe.id}">View Recipe</a>
              <a class="btn btn-outline-primary btn-sm" href="/recipe/${recipe.id}/edit">Edit</a>
              <button class="btn btn-outline-danger btn-sm" type="button" data-bs-toggle="modal" data-bs-target="#deleteRecipeModal" data-delete-recipe-id="${recipe.id}" data-delete-recipe-title="${escapeHtml(recipe.title)}" data-delete-recipe-image-url="${escapeHtml(recipe.imageUrl ?? '')}">Delete</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join('');

  root.querySelector('[data-my-recipes-loading]')?.classList.add('d-none');
  root.querySelector('[data-my-recipes-empty]')?.classList.add('d-none');
  root.querySelector('[data-my-recipes-table-wrap]')?.classList.remove('d-none');
}

function openDeleteModal(root, recipeId, recipeTitle) {
  const modalElement = root.querySelector('#deleteRecipeModal');
  if (!modalElement) {
    return;
  }

  modalElement.dataset.recipeId = recipeId;
  modalElement.querySelector('[data-delete-modal-title]')?.replaceChildren(document.createTextNode(recipeTitle));
}

function cleanupModalArtifacts() {
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());
  document.body.classList.remove('modal-open');
  document.body.style.removeProperty('padding-right');
}

/**
 * Wire up the My Recipes page.
 * @param {HTMLElement} root
 */
export async function setupMyRecipesPage(root) {
  const currentUser = await getCurrentUser().catch(() => null);
  if (!currentUser) {
    window.location.assign('/login');
    return;
  }

  const deleteModalElement = root.querySelector('#deleteRecipeModal');
  const confirmDeleteButton = root.querySelector('[data-confirm-delete]');

  let loadedRecipes = [];

  const flashToast = takeFlashToast();
  if (flashToast?.message) {
    showToast(flashToast.message, { variant: flashToast.variant ?? 'success' });
  }

  root.querySelector('[data-add-recipe-button]')?.addEventListener('click', () => {
    window.location.assign('/recipe/add');
  });

  root.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const deleteButton = target.closest('[data-delete-recipe-id]');
    if (deleteButton) {
      openDeleteModal(root, deleteButton.dataset.deleteRecipeId, deleteButton.dataset.deleteRecipeTitle ?? 'this recipe');
    }
  });

  confirmDeleteButton?.addEventListener('click', async () => {
    const recipeId = deleteModalElement?.dataset.recipeId;
    if (!recipeId) {
      return;
    }

    const recipe = loadedRecipes.find((item) => String(item.id) === String(recipeId));

    try {
      await deleteRecipeImageByUrl(recipe?.imageUrl ?? null);
      await deleteRecipe(recipeId);
      showToast('Recipe deleted.', { variant: 'success' });
      loadedRecipes = loadedRecipes.filter((recipe) => String(recipe.id) !== String(recipeId));

      if (loadedRecipes.length === 0) {
        renderEmptyState(root);
      } else {
        renderTable(root, loadedRecipes);
      }

      Modal.getOrCreateInstance(deleteModalElement).hide();
      cleanupModalArtifacts();
    } catch (error) {
      showToast(error.message, { variant: 'error' });
    }
  });

  try {
    renderLoading(root);
    const recipes = await listMyRecipes(currentUser.id);
    loadedRecipes = recipes;

    if (recipes.length === 0) {
      renderEmptyState(root);
      return;
    }

    renderTable(root, recipes);
  } catch (error) {
    showToast(error.message, { variant: 'error' });
    renderEmptyState(root, 'Unable to load your recipes');
  }
}
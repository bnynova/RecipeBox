import { Modal } from 'bootstrap';

import { showToast } from '../components/toasts.js';
import { deleteRecipe, listDashboardRecipes, listMyRecipes } from '../services/recipesService.js';
import { getCurrentUser, getProfileById } from '../services/authService.js';
import { deleteRecipeImageByUrl } from '../services/storageService.js';
import { escapeHtml } from '../utils/helpers.js';
import { icon } from '../components/icons.js';

function renderLoading(root) {
  root.querySelector('[data-admin-loading]')?.classList.remove('d-none');
  root.querySelector('[data-admin-empty]')?.classList.add('d-none');
  root.querySelector('[data-admin-table-wrap]')?.classList.add('d-none');
}

function renderEmptyState(root, message = 'No recipes found') {
  root.querySelector('[data-admin-loading]')?.classList.add('d-none');
  const empty = root.querySelector('[data-admin-empty]');

  if (empty) {
    empty.querySelector('[data-empty-message]')?.replaceChildren(document.createTextNode(message));
    empty.classList.remove('d-none');
  }

  root.querySelector('[data-admin-table-wrap]')?.classList.add('d-none');
}

function renderTags(tags = []) {
  if (tags.length === 0) {
    return '<span class="text-secondary small">No tags</span>';
  }

  return `<div class="d-flex flex-wrap gap-1">${tags
    .map((tag) => `<span class="badge rounded-pill text-bg-light border text-uppercase fw-semibold">${escapeHtml(tag.name)}</span>`)
    .join('')}</div>`;
}

function renderTable(root, recipes, isSuperAdmin) {
  const tbody = root.querySelector('[data-admin-tbody]');
  if (!tbody) {
    return;
  }

  tbody.innerHTML = recipes
    .map(
      (recipe) => `
        <tr>
          <td class="fw-semibold">${escapeHtml(recipe.title)}</td>
          <td>${escapeHtml(recipe.categoryName)}</td>
          <td>${renderTags(recipe.tags)}</td>
          <td>${escapeHtml(recipe.authorName ?? 'Unknown author')}</td>
          <td>
            <div class="d-flex flex-wrap gap-2">
              <a class="btn btn-outline-secondary btn-sm" href="/pages/recipe-details.html?id=${recipe.id}">${icon('bi-eye-fill', 'me-2')}View</a>
              <a class="btn btn-outline-primary btn-sm" href="/recipe-edit.html?id=${recipe.id}">${icon('bi-pencil-square', 'me-2')}Edit</a>
              <button class="btn btn-outline-danger btn-sm" type="button" data-bs-toggle="modal" data-bs-target="#deleteRecipeModal" data-delete-recipe-id="${recipe.id}" data-delete-recipe-title="${escapeHtml(recipe.title)}" data-delete-recipe-image-url="${escapeHtml(recipe.imageUrl ?? '')}">${icon('bi-trash3-fill', 'me-2')}Delete</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join('');

  root.querySelector('[data-admin-loading]')?.classList.add('d-none');
  root.querySelector('[data-admin-empty]')?.classList.add('d-none');
  root.querySelector('[data-admin-table-wrap]')?.classList.remove('d-none');
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

function getEmptyMessage(isSuperAdmin) {
  return isSuperAdmin ? 'No recipes found in the system' : 'No recipes found';
}

/**
 * Wire up the admin page.
 * @param {HTMLElement} root
 */
export async function setupAdminPage(root) {
  const currentUser = await getCurrentUser().catch(() => null);
  if (!currentUser) {
    window.location.assign('/login');
    return;
  }

  const profile = await getProfileById(currentUser.id).catch(() => null);
  const isSuperAdmin = profile?.role === 'super_admin';
  const deleteModalElement = root.querySelector('#deleteRecipeModal');
  const confirmDeleteButton = root.querySelector('[data-confirm-delete]');
  const addRecipeButton = root.querySelector('[data-admin-add-button]');

  let loadedRecipes = [];

  root.querySelector('[data-admin-page-title]')?.replaceChildren(
    document.createTextNode(isSuperAdmin ? 'Super admin panel' : 'My recipes panel'),
  );
  root.querySelector('[data-admin-page-description]')?.replaceChildren(
    document.createTextNode(
      isSuperAdmin
        ? 'You can review every recipe in the system.'
        : 'You can manage only the recipes you created.',
    ),
  );
  root.querySelector('[data-admin-role-badge]')?.replaceChildren(
    document.createTextNode(isSuperAdmin ? 'Super admin view' : 'Own recipes view'),
  );

  addRecipeButton?.addEventListener('click', () => {
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
      loadedRecipes = loadedRecipes.filter((item) => String(item.id) !== String(recipeId));

      if (loadedRecipes.length === 0) {
        renderEmptyState(root, getEmptyMessage(isSuperAdmin));
      } else {
        renderTable(root, loadedRecipes, isSuperAdmin);
      }

      Modal.getOrCreateInstance(deleteModalElement).hide();
      cleanupModalArtifacts();
    } catch (error) {
      showToast(error.message, { variant: 'error' });
    }
  });

  try {
    renderLoading(root);
    const recipes = isSuperAdmin ? await listDashboardRecipes() : await listMyRecipes(currentUser.id);
    loadedRecipes = recipes;

    if (recipes.length === 0) {
      renderEmptyState(root, getEmptyMessage(isSuperAdmin));
      return;
    }

    renderTable(root, recipes, isSuperAdmin);
  } catch (error) {
    showToast(error.message, { variant: 'error' });
    renderEmptyState(root, isSuperAdmin ? 'Unable to load all recipes' : 'Unable to load your recipes');
  }
}

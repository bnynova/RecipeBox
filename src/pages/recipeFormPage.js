import { showToast } from '../components/toasts.js';
import { createRecipe, getRecipeById, listCategories, updateRecipe } from '../services/recipesService.js';

function getRecipeIdFromPathname(pathname) {
  const match = pathname.match(/^\/recipe\/(\d+)\/edit$/);
  return match?.[1] ?? null;
}

function getModeFromRoot(root) {
  return root.dataset.recipeFormMode ?? 'add';
}

function renderFormLoading(root, message) {
  const status = root.querySelector('[data-form-status]');
  if (status) {
    status.textContent = message;
  }
}

function setSelectOptions(root, categories) {
  const select = root.querySelector('[name="categoryId"]');
  if (!select) {
    return;
  }

  select.innerHTML = ['<option value="">Select a category</option>', ...categories.map((category) => `<option value="${category.id}">${category.name}</option>`)].join('');
}

function fillForm(root, recipe) {
  root.querySelector('[name="title"]').value = recipe.title ?? '';
  root.querySelector('[name="description"]').value = recipe.description ?? '';
  root.querySelector('[name="categoryId"]').value = recipe.categoryId ?? '';
  root.querySelector('[name="imageUrl"]').value = recipe.imageUrl ?? '';
  root.querySelector('[name="ingredients"]').value = recipe.ingredients ?? '';
  root.querySelector('[name="steps"]').value = recipe.steps ?? '';
}

async function handleSubmit(root, event, mode, recipeId) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector('[type="submit"]');

  const payload = {
    title: form.elements.namedItem('title').value.trim(),
    description: form.elements.namedItem('description').value.trim(),
    categoryId: Number(form.elements.namedItem('categoryId').value),
    imageUrl: form.elements.namedItem('imageUrl').value.trim(),
    ingredients: form.elements.namedItem('ingredients').value.trim(),
    steps: form.elements.namedItem('steps').value.trim(),
  };

  try {
    submitButton.disabled = true;
    submitButton.textContent = mode === 'edit' ? 'Saving...' : 'Creating...';

    if (mode === 'edit' && recipeId) {
      await updateRecipe(recipeId, payload);
      showToast('Recipe updated.', { variant: 'success' });
      window.location.assign('/my-recipes/index.html');
      return;
    }

    await createRecipe(payload);
    showToast('Recipe created.', { variant: 'success' });
    window.location.assign('/my-recipes/index.html');
  } catch (error) {
    showToast(error.message, { variant: 'error' });
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = mode === 'edit' ? 'Save Recipe' : 'Create Recipe';
  }
}

/**
 * Wire up the recipe add/edit page.
 * @param {HTMLElement} root
 */
export async function setupRecipeFormPage(root) {
  const mode = getModeFromRoot(root);
  const recipeId = getRecipeIdFromPathname(window.location.pathname);
  const titleElement = root.querySelector('[data-recipe-form-title]');
  const statusElement = root.querySelector('[data-form-status]');

  titleElement?.replaceChildren(document.createTextNode(mode === 'edit' ? 'Edit recipe' : 'Create a recipe'));
  renderFormLoading(root, mode === 'edit' ? 'Loading recipe...' : 'Ready to create a recipe');

  try {
    const categories = await listCategories();
    setSelectOptions(root, categories);

    if (mode === 'edit' && recipeId) {
      const recipe = await getRecipeById(recipeId);
      fillForm(root, recipe);
    }

    statusElement?.classList.add('d-none');
  } catch (error) {
    showToast(error.message, { variant: 'error' });
    renderFormLoading(root, 'Unable to load recipe form');
  }

  root.querySelector('form')?.addEventListener('submit', (event) => {
    void handleSubmit(root, event, mode, recipeId);
  });
}
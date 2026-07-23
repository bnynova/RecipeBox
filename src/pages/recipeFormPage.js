import { showToast } from '../components/toasts.js';
import { getCurrentUser } from '../services/authService.js';
import { createRecipe, deleteRecipe, getRecipeById, listCategories, listTags, setRecipeTags, updateRecipe } from '../services/recipesService.js';
import { deleteRecipeImageByUrl, uploadRecipeImage } from '../services/storageService.js';
import { escapeHtml } from '../utils/helpers.js';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const FLASH_TOAST_KEY = 'recipebox:flash-toast';

function getRecipeIdFromPathname(pathname) {
  const match = pathname.match(/^\/recipe\/(\d+)\/edit$/);
  return match?.[1] ?? null;
}

function getRecipeIdFromLocation() {
  return getRecipeIdFromPathname(window.location.pathname) ?? new URLSearchParams(window.location.search).get('id');
}

function getModeFromRoot(root) {
  const rootElement = root instanceof Document ? root.body : root;

  if (!(rootElement instanceof HTMLElement)) {
    return 'add';
  }

  return rootElement.dataset.recipeFormMode ?? 'add';
}

function splitList(value) {
  return String(value ?? '')
    .replaceAll('\\n', '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeTagName(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function setFlashToast(message, variant = 'success') {
  sessionStorage.setItem(FLASH_TOAST_KEY, JSON.stringify({ message, variant }));
}

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

function getFormAlert(root) {
  return root.querySelector('[data-form-alert]');
}

function showFormAlert(root, message) {
  const alert = getFormAlert(root);

  if (!alert) {
    return;
  }

  alert.textContent = message;
  alert.classList.remove('d-none');
  alert.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function clearFormAlert(root) {
  const alert = getFormAlert(root);
  if (!alert) {
    return;
  }

  alert.textContent = '';
  alert.classList.add('d-none');
}

function setFormInvalidState(form, fieldName, isInvalid) {
  const field = form.elements.namedItem(fieldName);

  if (!(field instanceof HTMLElement)) {
    return;
  }

  field.classList.toggle('is-invalid', isInvalid);
}

function clearInvalidStates(form) {
  ['title', 'description', 'categoryId', 'imageFile', 'ingredients', 'steps'].forEach((fieldName) => {
    setFormInvalidState(form, fieldName, false);
  });
}

function renderTagSuggestions(root, tags) {
  const datalist = root.querySelector('[data-tag-options]');

  if (!datalist) {
    return;
  }

  datalist.innerHTML = tags.map((tag) => `<option value="${escapeHtml(tag.name)}"></option>`).join('');
}

function renderSelectedTags(root, tagState) {
  const container = root.querySelector('[data-selected-tags]');

  if (!container) {
    return;
  }

  if (tagState.selectedTags.length === 0) {
    container.innerHTML = '<span class="text-secondary small">No tags selected yet.</span>';
    return;
  }

  container.innerHTML = tagState.selectedTags
    .map(
      (tagName) => `
        <span class="badge rounded-pill text-bg-secondary d-inline-flex align-items-center gap-2 px-3 py-2">
          <span>${escapeHtml(tagName)}</span>
          <button class="btn btn-sm btn-link text-white p-0 lh-1 text-decoration-none" type="button" data-remove-tag="${escapeHtml(tagName)}" aria-label="Remove ${escapeHtml(tagName)} tag">
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </span>
      `,
    )
    .join('');
}

function addTagToState(root, tagState, rawValue) {
  const tagName = normalizeTagName(rawValue);

  if (!tagName || tagState.selectedTags.includes(tagName)) {
    return;
  }

  tagState.selectedTags = [...tagState.selectedTags, tagName];
  renderSelectedTags(root, tagState);
}

function removeTagFromState(root, tagState, tagName) {
  const normalizedTagName = normalizeTagName(tagName);

  tagState.selectedTags = tagState.selectedTags.filter((item) => item !== normalizedTagName);
  renderSelectedTags(root, tagState);
}

function setPreviewSurface(root, url, altText = '') {
  const previewSurface = root.querySelector('[data-recipe-image-preview-surface]');
  const filenameBadge = root.querySelector('[data-recipe-image-preview-label]');

  if (previewSurface instanceof HTMLElement) {
    previewSurface.style.backgroundImage = url ? `url("${url}")` : 'none';
  }

  if (filenameBadge) {
    filenameBadge.textContent = altText;
    filenameBadge.classList.toggle('d-none', !altText);
  }
}

function showImagePreview(root, previewState, url, isPlaceholder = false) {
  const image = root.querySelector('[data-recipe-image-preview]');
  const placeholder = root.querySelector('[data-recipe-image-preview-empty]');

  if (!(image instanceof HTMLImageElement)) {
    return;
  }

  if (previewState.objectUrl) {
    URL.revokeObjectURL(previewState.objectUrl);
    previewState.objectUrl = null;
  }

  if (url) {
    image.src = url;
    image.classList.remove('d-none');
    placeholder?.classList.add('d-none');
    setPreviewSurface(root, url, isPlaceholder ? 'Current recipe photo' : '');

    if (isPlaceholder) {
      image.alt = 'Current recipe photo';
    }

    return;
  }

  image.classList.add('d-none');
  placeholder?.classList.remove('d-none');
  setPreviewSurface(root, '');
}

function handleImageSelection(root, previewState, file) {
  const image = root.querySelector('[data-recipe-image-preview]');
  if (!(image instanceof HTMLImageElement)) {
    return;
  }

  if (previewState.objectUrl) {
    URL.revokeObjectURL(previewState.objectUrl);
    previewState.objectUrl = null;
  }

  if (file) {
    const objectUrl = URL.createObjectURL(file);
    previewState.objectUrl = objectUrl;
    setPreviewSurface(root, objectUrl, file.name);

    image.onload = () => {
      image.classList.remove('d-none');
      root.querySelector('[data-recipe-image-preview-empty]')?.classList.add('d-none');
    };

    image.onerror = () => {
      showFormAlert(root, 'Unable to preview the selected image.');
      setPreviewSurface(root, '');
    };

    image.src = objectUrl;
    image.alt = file.name;
    return;
  }

  if (previewState.currentImageUrl) {
    showImagePreview(root, previewState, previewState.currentImageUrl, true);
    return;
  }

  showImagePreview(root, previewState, null);
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

function fillForm(root, recipe, previewState, tagState) {
  root.querySelector('[name="title"]').value = recipe.title ?? '';
  root.querySelector('[name="description"]').value = recipe.description ?? '';
  root.querySelector('[name="categoryId"]').value = recipe.categoryId ?? '';
  root.querySelector('[name="ingredients"]').value = recipe.ingredients ?? '';
  root.querySelector('[name="steps"]').value = recipe.steps ?? '';
  previewState.currentImageUrl = recipe.imageUrl ?? '';
  previewState.currentImagePath = recipe.imageUrl ?? '';
  tagState.selectedTags = (recipe.tags ?? []).map((tag) => normalizeTagName(tag.name)).filter(Boolean);
  renderSelectedTags(root, tagState);
  showImagePreview(root, previewState, recipe.imageUrl ?? null, true);
}

function validateForm(root, form, previewState, mode) {
  clearFormAlert(root);
  clearInvalidStates(form);

  const title = String(form.elements.namedItem('title').value ?? '').trim();
  const description = String(form.elements.namedItem('description').value ?? '').trim();
  const categoryId = String(form.elements.namedItem('categoryId').value ?? '').trim();
  const ingredients = splitList(form.elements.namedItem('ingredients').value);
  const steps = splitList(form.elements.namedItem('steps').value);
  const imageFile = form.elements.namedItem('imageFile').files?.[0] ?? null;

  const errors = [];

  if (!title) {
    errors.push('Title is required.');
    setFormInvalidState(form, 'title', true);
  }

  if (!description) {
    errors.push('Description is required.');
    setFormInvalidState(form, 'description', true);
  }

  if (!categoryId) {
    errors.push('Category is required.');
    setFormInvalidState(form, 'categoryId', true);
  }

  if (ingredients.length === 0) {
    errors.push('Add at least one ingredient.');
    setFormInvalidState(form, 'ingredients', true);
  }

  if (steps.length === 0) {
    errors.push('Add at least one step.');
    setFormInvalidState(form, 'steps', true);
  }

  if (imageFile) {
    if (!imageFile.type.startsWith('image/')) {
      errors.push('Recipe photo must be an image file.');
      setFormInvalidState(form, 'imageFile', true);
    }

    if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
      errors.push('Recipe photo must be 5 MB or smaller.');
      setFormInvalidState(form, 'imageFile', true);
    }
  } else if (mode === 'add' && !previewState.currentImageUrl) {
    errors.push('Recipe photo is required.');
    setFormInvalidState(form, 'imageFile', true);
  } else if (mode === 'edit' && !previewState.currentImageUrl) {
    errors.push('Upload a recipe photo to continue.');
    setFormInvalidState(form, 'imageFile', true);
  }

  if (errors.length > 0) {
    showFormAlert(root, errors[0]);
    return null;
  }

  return {
    title,
    description,
    categoryId: Number(categoryId),
    ingredients: ingredients.join('\n'),
    steps: steps.join('\n'),
    imageFile,
  };
}

async function submitRecipeForm(root, form, mode, recipeId, previewState, tagState) {
  const submitButton = form.querySelector('[type="submit"]');
  const currentUser = await getCurrentUser().catch(() => null);

  if (!currentUser) {
    showFormAlert(root, 'You must be signed in to save recipes.');
    return;
  }

  const payload = validateForm(root, form, previewState, mode);

  if (!payload) {
    return;
  }

  const existingImageUrl = previewState.currentImageUrl || '';
  let uploadedImage = null;
  let imageUrl = existingImageUrl;

  try {
    submitButton.disabled = true;
    submitButton.textContent = mode === 'edit' ? 'Saving...' : 'Creating...';

    if (payload.imageFile) {
      uploadedImage = await uploadRecipeImage(payload.imageFile, currentUser.id);
      imageUrl = uploadedImage.publicUrl;
    }

    const recipePayload = {
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      imageUrl,
      ingredients: payload.ingredients,
      steps: payload.steps,
    };

    if (mode === 'edit' && recipeId) {
      await updateRecipe(recipeId, recipePayload);
      await setRecipeTags(recipeId, tagState.selectedTags);

      if (uploadedImage && existingImageUrl && existingImageUrl !== imageUrl) {
        await deleteRecipeImageByUrl(existingImageUrl).catch(() => null);
      }

      setFlashToast('Recipe updated.');
      window.location.assign('/my-recipes');
      return;
    }

    const createdRecipe = await createRecipe(recipePayload);

    try {
      await setRecipeTags(createdRecipe.id, tagState.selectedTags);
    } catch (tagError) {
      await deleteRecipe(createdRecipe.id).catch(() => null);
      throw tagError;
    }

    setFlashToast('Recipe created.');
    window.location.assign('/my-recipes');
  } catch (error) {
    if (uploadedImage?.publicUrl) {
      await deleteRecipeImageByUrl(uploadedImage.publicUrl).catch(() => null);
    }

    showFormAlert(root, error.message);
    showToast(error.message, { variant: 'error' });
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = mode === 'edit' ? 'Save Recipe' : 'Create Recipe';
  }
}

async function handleSubmit(root, event, mode, recipeId, previewState, tagState) {
  event.preventDefault();
  event.stopPropagation();
  const form = event.currentTarget;

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  await submitRecipeForm(root, form, mode, recipeId, previewState, tagState);
}

async function handleSaveButtonClick(root, event, mode, recipeId, previewState, tagState) {
  event.preventDefault();
  event.stopPropagation();

  const form = root.querySelector('form');
  if (!form) {
    return;
  }

  await submitRecipeForm(root, form, mode, recipeId, previewState, tagState);
}

/**
 * Wire up the recipe add/edit page.
 * @param {HTMLElement} root
 */
export async function setupRecipeFormPage(root) {
  const mode = getModeFromRoot(root);
  const recipeId = getRecipeIdFromLocation();
  const titleElement = root.querySelector('[data-recipe-form-title]');
  const statusElement = root.querySelector('[data-form-status]');
  const form = root.querySelector('form');
  const saveButton = root.querySelector('[type="submit"]');
  const imageInput = root.querySelector('[name="imageFile"]');
  const tagInput = root.querySelector('[data-tag-input]');
  const addTagButton = root.querySelector('[data-add-tag]');
  const previewState = {
    currentImageUrl: '',
    objectUrl: null,
  };
  const tagState = {
    selectedTags: [],
    availableTags: [],
  };

  const flashToast = takeFlashToast();
  if (flashToast?.message) {
    showToast(flashToast.message, { variant: flashToast.variant ?? 'success' });
  }

  titleElement?.replaceChildren(document.createTextNode(mode === 'edit' ? 'Edit recipe' : 'Create a recipe'));
  renderFormLoading(root, mode === 'edit' ? 'Loading recipe...' : 'Ready to create a recipe');

  if (form instanceof HTMLFormElement) {
    form.addEventListener('submit', (event) => {
      void handleSubmit(root, event, mode, recipeId, previewState, tagState);
    });
  }

  if (saveButton instanceof HTMLButtonElement) {
    saveButton.addEventListener('click', (event) => {
      void handleSaveButtonClick(root, event, mode, recipeId, previewState, tagState);
    });
  }

  if (tagInput instanceof HTMLInputElement) {
    tagInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      addTagToState(root, tagState, tagInput.value);
      tagInput.value = '';
    });
  }

  addTagButton?.addEventListener('click', () => {
    if (!(tagInput instanceof HTMLInputElement)) {
      return;
    }

    addTagToState(root, tagState, tagInput.value);
    tagInput.value = '';
    tagInput.focus();
  });

  root.addEventListener('click', (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const removeButton = target.closest('[data-remove-tag]');
    if (!removeButton) {
      return;
    }

    removeTagFromState(root, tagState, removeButton.getAttribute('data-remove-tag'));
  });

  if (imageInput instanceof HTMLInputElement) {
    const syncImageSelection = () => {
      const file = imageInput.files?.[0] ?? null;
      imageInput.classList.remove('is-invalid');
      handleImageSelection(root, previewState, file);
      imageInput.required = mode === 'add' && !previewState.currentImageUrl && !file;
    };

    imageInput.addEventListener('change', syncImageSelection);
    imageInput.addEventListener('input', syncImageSelection);

    if (imageInput.files?.[0]) {
      handleImageSelection(root, previewState, imageInput.files[0]);
    }
  }

  try {
    const [categories, tags] = await Promise.all([listCategories(), listTags()]);
    setSelectOptions(root, categories);
    tagState.availableTags = tags;
    renderTagSuggestions(root, tags);

    if (mode === 'edit' && recipeId) {
      const recipe = await getRecipeById(recipeId);
      fillForm(root, recipe, previewState, tagState);
    } else {
      if (!previewState.objectUrl && !previewState.currentImageUrl) {
        showImagePreview(root, previewState, null);
      }
    }

    if (mode === 'edit' && !recipeId) {
      showFormAlert(root, 'Missing recipe id.');
    }

    if (imageInput instanceof HTMLInputElement) {
      imageInput.required = mode === 'add' && !previewState.currentImageUrl;

      if (imageInput.files?.[0]) {
        handleImageSelection(root, previewState, imageInput.files[0]);
      } else if (mode === 'add' && !previewState.currentImageUrl && !previewState.objectUrl) {
        showImagePreview(root, previewState, null);
      }
    }

    statusElement?.classList.add('d-none');
  } catch (error) {
    showToast(error.message, { variant: 'error' });
    renderFormLoading(root, 'Unable to load recipe form');
  }
}
import { showToast } from '../components/toasts.js';
import { getRecipeById } from '../services/recipesService.js';
import { escapeHtml } from '../utils/helpers.js';

function getRecipeIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id');
}

function splitLines(value) {
  return String(value ?? '')
    .replaceAll('\\n', '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function stripLeadingStepNumber(step) {
  return step.replace(/^\d+\.\s*/, '');
}

function renderIngredientList(root, recipe) {
  const list = root.querySelector('[data-recipe-ingredients]');
  if (!list) {
    return;
  }

  const ingredients = splitLines(recipe.ingredients);

  list.innerHTML = ingredients
    .map(
      (ingredient) => `
        <li class="recipe-details__ingredient d-flex gap-3 align-items-start">
          <span class="recipe-details__bullet" aria-hidden="true"></span>
          <span>${escapeHtml(ingredient)}</span>
        </li>
      `,
    )
    .join('');
}

function renderStepList(root, recipe) {
  const list = root.querySelector('[data-recipe-steps]');
  if (!list) {
    return;
  }

  const steps = splitLines(recipe.steps);

  list.innerHTML = steps
    .map(
      (step, index) => `
        <article class="recipe-details__step">
          <div class="recipe-details__step-number">${index + 1}</div>
          <p class="mb-0">${escapeHtml(stripLeadingStepNumber(step))}</p>
        </article>
      `,
    )
    .join('');
}

function renderRecipe(root, recipe) {
  const title = root.querySelector('[data-recipe-title]');
  const description = root.querySelector('[data-recipe-description]');
  const category = root.querySelector('[data-recipe-category]');
  const author = root.querySelector('[data-recipe-author]');
  const recipeId = root.querySelector('[data-recipe-id]');
  const image = root.querySelector('[data-recipe-image]');
  const placeholder = root.querySelector('[data-recipe-image-placeholder]');

  title?.replaceChildren(document.createTextNode(recipe.title ?? 'Untitled recipe'));
  description?.replaceChildren(document.createTextNode(recipe.description ?? ''));
  category?.replaceChildren(document.createTextNode(recipe.categoryName ?? 'Uncategorized'));
  author?.replaceChildren(document.createTextNode(recipe.authorName ?? 'Unknown author'));
  recipeId?.replaceChildren(document.createTextNode(String(recipe.id ?? '—')));

  if (recipe.imageUrl) {
    if (image instanceof HTMLImageElement) {
      image.src = recipe.imageUrl;
      image.alt = recipe.title ?? 'Recipe image';
      image.classList.remove('d-none');
      image.onerror = () => {
        image.classList.add('d-none');
        placeholder?.classList.remove('d-none');
      };
    }
    placeholder?.classList.add('d-none');
  } else {
    image?.classList.add('d-none');
    placeholder?.classList.remove('d-none');
  }

  renderIngredientList(root, recipe);
  renderStepList(root, recipe);
}

async function renderRecipeDetails(root) {
  const recipeId = getRecipeIdFromQuery();

  if (!recipeId) {
    showToast('Missing recipe id.', { variant: 'error' });
    return;
  }

  try {
    const recipe = await getRecipeById(recipeId);
    renderRecipe(root, recipe);
  } catch (error) {
    showToast(error.message, { variant: 'error' });
    const title = root.querySelector('[data-recipe-title]');
    const description = root.querySelector('[data-recipe-description]');

    title?.replaceChildren(document.createTextNode('Recipe not found'));
    description?.replaceChildren(document.createTextNode('Unable to load this recipe.'));
  }
}

/**
 * Wire up the recipe details page.
 * @param {HTMLElement} root
 */
export async function setupRecipeDetailsPage(root) {
  root.querySelector('[data-recipe-details-shell]')?.classList.remove('d-none');
  await renderRecipeDetails(root);
}
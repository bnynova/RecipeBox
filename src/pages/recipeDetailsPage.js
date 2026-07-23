import { showToast } from '../components/toasts.js';
import { getRecipeById, listRecipeComments } from '../services/recipesService.js';
import { escapeHtml } from '../utils/helpers.js';
import { icon, renderRatingStars } from '../components/icons.js';

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

function renderCommentsLoading(root) {
  root.querySelector('[data-recipe-comments-loading]')?.classList.remove('d-none');
  root.querySelector('[data-recipe-comments-empty]')?.classList.add('d-none');
  root.querySelector('[data-recipe-comments-list]')?.classList.add('d-none');
}

function renderCommentsEmpty(root, message = 'No comments yet') {
  const empty = root.querySelector('[data-recipe-comments-empty]');

  if (empty) {
    empty.querySelector('[data-empty-message]')?.replaceChildren(document.createTextNode(message));
    empty.classList.remove('d-none');
  }

  root.querySelector('[data-recipe-comments-loading]')?.classList.add('d-none');
  root.querySelector('[data-recipe-comments-list]')?.classList.add('d-none');
}

function renderComments(root, comments) {
  const list = root.querySelector('[data-recipe-comments-list]');

  if (!list) {
    return;
  }

  list.innerHTML = comments
    .map((comment) => `
      <article class="page-panel comment-card">
        <div class="d-flex align-items-start gap-3 mb-3">
          <div class="comment-card__avatar rounded-circle bg-secondary-subtle d-inline-flex align-items-center justify-content-center fw-semibold">
            ${comment.authorAvatarUrl ? `<img src="${comment.authorAvatarUrl}" alt="${escapeHtml(comment.authorName)}" class="w-100 h-100" style="object-fit: cover;" />` : icon('bi-chat-left-text-fill')}
          </div>
          <div class="flex-grow-1">
            <div class="d-flex flex-wrap align-items-center gap-2 justify-content-between">
              <h3 class="h6 mb-0">${escapeHtml(comment.authorName)}</h3>
              <span class="small text-secondary">${new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="mt-1">${renderRatingStars(comment.rating, { showValue: true })}</div>
          </div>
        </div>
        <p class="mb-0 text-secondary">${escapeHtml(comment.content)}</p>
      </article>
    `)
    .join('');

  list.classList.remove('d-none');
  root.querySelector('[data-recipe-comments-loading]')?.classList.add('d-none');
  root.querySelector('[data-recipe-comments-empty]')?.classList.add('d-none');
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
    renderCommentsLoading(root);
    const [recipe, comments] = await Promise.all([getRecipeById(recipeId), listRecipeComments(recipeId)]);
    renderRecipe(root, recipe);

    if (comments.length === 0) {
      renderCommentsEmpty(root);
    } else {
      renderComments(root, comments);
    }
  } catch (error) {
    showToast(error.message, { variant: 'error' });
    const title = root.querySelector('[data-recipe-title]');
    const description = root.querySelector('[data-recipe-description]');
    const commentsEmpty = root.querySelector('[data-recipe-comments-empty]');

    title?.replaceChildren(document.createTextNode('Recipe not found'));
    description?.replaceChildren(document.createTextNode('Unable to load this recipe.'));
    if (commentsEmpty) {
      commentsEmpty.querySelector('[data-empty-message]')?.replaceChildren(document.createTextNode('Unable to load comments.'));
      commentsEmpty.classList.remove('d-none');
    }
  }
}

/**
 * Wire up the recipe details page.
 * @param {HTMLElement} root
 */
export async function setupRecipeDetailsPage(root) {
  root.querySelector('[data-recipe-details-loading]')?.classList.remove('d-none');
  root.querySelector('[data-recipe-details-shell]')?.classList.remove('d-none');
  await renderRecipeDetails(root);
  root.querySelector('[data-recipe-details-loading]')?.classList.add('d-none');
}
import { getSupabaseClient } from './supabaseClient.js';

function getRecipeErrorMessage(error) {
  return error?.message ?? 'An unexpected recipes error occurred.';
}

function normalizeRecipe(recipe) {
  const category = recipe.category ?? null;
  const author = recipe.author ?? null;

  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    imageUrl: recipe.image_url,
    categoryId: recipe.category_id,
    categoryName: category?.name ?? 'Uncategorized',
    authorEmail: author?.email ?? '',
    authorAvatarUrl: author?.avatar_url ?? null,
    authorName: author?.email
      ? author.email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
      : 'Unknown author',
    href: `/pages/recipe-details.html?id=${recipe.id}`,
  };
}

/**
 * Fetch the categories list for filters and recipe forms.
 */
export async function listCategories() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.from('categories').select('id, name').order('name', { ascending: true });

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }

  return data;
}

/**
 * Fetch recipes with category and author data for the dashboard feed.
 */
export async function listDashboardRecipes() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id,
      title,
      description,
      ingredients,
      steps,
      image_url,
      category_id,
      category:categories(id, name),
      author:profiles!recipes_owner_profile_fkey(id, email, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }

  return data.map(normalizeRecipe);
}

/**
 * List published recipes for the home page and browse views.
 */
export async function listRecipes() {
  return listDashboardRecipes();
}

/**
 * Fetch a single recipe by its identifier.
 * @param {string} recipeId
 */
export async function getRecipeById(recipeId) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id,
      title,
      description,
      ingredients,
      steps,
      image_url,
      category_id,
      category:categories(id, name),
      author:profiles!recipes_owner_profile_fkey(id, email, avatar_url)
    `)
    .eq('id', recipeId)
    .single();

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }

  return normalizeRecipe(data);
}

/**
 * Create a new recipe owned by the current user.
 * @param {object} recipeData
 */
export async function createRecipe(recipeData) {
  throw new Error('createRecipe is not implemented yet.');
}

/**
 * Update an existing recipe owned by the current user.
 * @param {string} recipeId
 * @param {object} recipeData
 */
export async function updateRecipe(recipeId, recipeData) {
  throw new Error('updateRecipe is not implemented yet.');
}

/**
 * Delete a recipe owned by the current user.
 * @param {string} recipeId
 */
export async function deleteRecipe(recipeId) {
  throw new Error('deleteRecipe is not implemented yet.');
}

/**
 * List the current user's favorite recipes.
 */
export async function listFavoriteRecipes() {
  throw new Error('listFavoriteRecipes is not implemented yet.');
}
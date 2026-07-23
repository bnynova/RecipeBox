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

function computeCommentStats(comments = []) {
  const count = comments.length;

  if (count === 0) {
    return { commentCount: 0, avgRating: null };
  }

  const sum = comments.reduce((total, comment) => total + Number(comment.rating ?? 0), 0);

  return {
    commentCount: count,
    avgRating: sum / count,
  };
}

function attachCommentStats(recipes, comments) {
  const commentsByRecipeId = new Map();

  comments.forEach((comment) => {
    const existing = commentsByRecipeId.get(comment.recipe_id) ?? [];
    existing.push(comment);
    commentsByRecipeId.set(comment.recipe_id, existing);
  });

  return recipes.map((recipe) => {
    const stats = computeCommentStats(commentsByRecipeId.get(recipe.id) ?? []);

    return {
      ...recipe,
      ...stats,
    };
  });
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
 * Fetch recipes owned by the current user along with comment counts and average ratings.
 * @param {string} ownerId
 */
export async function listMyRecipes(ownerId) {
  const supabase = getSupabaseClient();

  const { data: recipes, error: recipesError } = await supabase
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
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (recipesError) {
    throw new Error(getRecipeErrorMessage(recipesError));
  }

  if (!recipes.length) {
    return [];
  }

  const recipeIds = recipes.map((recipe) => recipe.id);
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('recipe_id, rating')
    .in('recipe_id', recipeIds);

  if (commentsError) {
    throw new Error(getRecipeErrorMessage(commentsError));
  }

  return attachCommentStats(recipes.map(normalizeRecipe), comments);
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
 * Fetch comments for a given recipe.
 * @param {string} recipeId
 */
export async function listRecipeComments(recipeId) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      rating,
      created_at,
      author:profiles!comments_author_id_fkey(id, display_name, avatar_url, email)
    `)
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }

  return data.map((comment) => ({
    id: comment.id,
    content: comment.content,
    rating: comment.rating,
    createdAt: comment.created_at,
    authorName: comment.author?.display_name || comment.author?.email || 'Anonymous',
    authorAvatarUrl: comment.author?.avatar_url ?? null,
  }));
}

/**
 * Create a new recipe owned by the current user.
 * @param {object} recipeData
 */
export async function createRecipe(recipeData) {
  const supabase = getSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(getRecipeErrorMessage(userError));
  }

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      title: recipeData.title,
      description: recipeData.description,
      ingredients: recipeData.ingredients,
      steps: recipeData.steps,
      image_url: recipeData.imageUrl,
      category_id: recipeData.categoryId,
      owner_id: userData.user.id,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }

  return data;
}

/**
 * Update an existing recipe owned by the current user.
 * @param {string} recipeId
 * @param {object} recipeData
 */
export async function updateRecipe(recipeId, recipeData) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('recipes')
    .update({
      title: recipeData.title,
      description: recipeData.description,
      ingredients: recipeData.ingredients,
      steps: recipeData.steps,
      image_url: recipeData.imageUrl,
      category_id: recipeData.categoryId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recipeId)
    .select('id')
    .single();

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }

  return data;
}

/**
 * Delete a recipe owned by the current user.
 * @param {string} recipeId
 */
export async function deleteRecipe(recipeId) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('recipes').delete().eq('id', recipeId);

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }
}

/**
 * List the current user's favorite recipes.
 */
export async function listFavoriteRecipes() {
  throw new Error('listFavoriteRecipes is not implemented yet.');
}
import { getSupabaseClient } from './supabaseClient.js';

function getRecipeErrorMessage(error) {
  return error?.message ?? 'An unexpected recipes error occurred.';
}

function normalizeTagName(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeTag(tag) {
  if (!tag) {
    return null;
  }

  return {
    id: tag.id,
    name: tag.name,
  };
}

function normalizeTags(recipe) {
  const rawTags = recipe.tags ?? recipe.recipe_tags ?? [];

  return rawTags
    .map((tag) => normalizeTag(tag?.tag ?? tag))
    .filter(Boolean);
}

function normalizeRecipe(recipe) {
  const category = recipe.category ?? null;
  const author = recipe.author ?? null;
  const authorName = author?.display_name?.trim() || 'Unknown author';

  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    imageUrl: recipe.image_url,
    categoryId: recipe.category_id,
    categoryName: category?.name ?? 'Uncategorized',
    authorAvatarUrl: author?.avatar_url ?? null,
    authorName,
    tags: normalizeTags(recipe),
    href: `/pages/recipe-details.html?id=${recipe.id}`,
  };
}

async function attachTagsToRecipes(recipes) {
  if (!recipes.length) {
    return [];
  }

  const supabase = getSupabaseClient();
  const recipeIds = recipes.map((recipe) => recipe.id);

  const { data, error } = await supabase
    .from('recipe_tags')
    .select('recipe_id, tag:tags(id, name)')
    .in('recipe_id', recipeIds);

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }

  const tagsByRecipeId = new Map(recipeIds.map((id) => [id, []]));

  data.forEach((row) => {
    const tag = normalizeTag(row.tag);

    if (!tag) {
      return;
    }

    const existingTags = tagsByRecipeId.get(row.recipe_id) ?? [];
    existingTags.push(tag);
    tagsByRecipeId.set(row.recipe_id, existingTags);
  });

  return recipes.map((recipe) => ({
    ...normalizeRecipe(recipe),
    tags: tagsByRecipeId.get(recipe.id) ?? [],
  }));
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
      author:profiles!recipes_owner_profile_fkey(id, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }

  return attachTagsToRecipes(data);
}

/**
 * Fetch recipes owned by the current user.
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
      author:profiles!recipes_owner_profile_fkey(id, display_name, avatar_url)
    `)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (recipesError) {
    throw new Error(getRecipeErrorMessage(recipesError));
  }

  if (!recipes.length) {
    return [];
  }

  return attachTagsToRecipes(recipes);
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
      author:profiles!recipes_owner_profile_fkey(id, display_name, avatar_url)
    `)
    .eq('id', recipeId)
    .single();

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }

  const recipe = normalizeRecipe(data);
  recipe.tags = await getRecipeTags(recipeId);
  return recipe;
}

/**
 * Fetch all tags.
 */
export async function listTags() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('tags')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }

  return data.map(normalizeTag);
}

/**
 * Fetch tags for a single recipe.
 * @param {string | number} recipeId
 */
export async function getRecipeTags(recipeId) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('recipe_tags')
    .select('tag:tags(id, name)')
    .eq('recipe_id', recipeId);

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }

  return data.map((row) => normalizeTag(row.tag)).filter(Boolean);
}

/**
 * Add a tag to a recipe.
 * @param {string | number} recipeId
 * @param {string | number} tagId
 */
export async function attachTagToRecipe(recipeId, tagId) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('recipe_tags').upsert(
    {
      recipe_id: recipeId,
      tag_id: tagId,
    },
    {
      onConflict: 'recipe_id,tag_id',
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }
}

/**
 * Remove a tag from a recipe.
 * @param {string | number} recipeId
 * @param {string | number} tagId
 */
export async function detachTagFromRecipe(recipeId, tagId) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('recipe_tags').delete().match({
    recipe_id: recipeId,
    tag_id: tagId,
  });

  if (error) {
    throw new Error(getRecipeErrorMessage(error));
  }
}

async function ensureTagExists(tagName) {
  const normalizedName = normalizeTagName(tagName);

  if (!normalizedName) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data: existingTag, error: selectError } = await supabase
    .from('tags')
    .select('id, name')
    .eq('name', normalizedName)
    .maybeSingle();

  if (selectError) {
    throw new Error(getRecipeErrorMessage(selectError));
  }

  if (existingTag) {
    return normalizeTag(existingTag);
  }

  const { data, error } = await supabase
    .from('tags')
    .insert({ name: normalizedName })
    .select('id, name')
    .single();

  if (error) {
    const { data: fallbackTag, error: fallbackError } = await supabase
      .from('tags')
      .select('id, name')
      .eq('name', normalizedName)
      .maybeSingle();

    if (fallbackError) {
      throw new Error(getRecipeErrorMessage(fallbackError));
    }

    if (fallbackTag) {
      return normalizeTag(fallbackTag);
    }

    throw new Error(getRecipeErrorMessage(error));
  }

  return normalizeTag(data);
}

/**
 * Replace a recipe's tags with the provided tag names.
 * @param {string | number} recipeId
 * @param {string[]} tagNames
 */
export async function setRecipeTags(recipeId, tagNames) {
  const desiredNames = [...new Set((tagNames ?? []).map(normalizeTagName).filter(Boolean))];
  const desiredTags = [];

  for (const tagName of desiredNames) {
    const tag = await ensureTagExists(tagName);

    if (tag) {
      desiredTags.push(tag);
    }
  }

  const currentTags = await getRecipeTags(recipeId);
  const currentTagIds = new Set(currentTags.map((tag) => String(tag.id)));
  const desiredTagIds = new Set(desiredTags.map((tag) => String(tag.id)));

  await Promise.all(
    desiredTags
      .filter((tag) => !currentTagIds.has(String(tag.id)))
      .map((tag) => attachTagToRecipe(recipeId, tag.id)),
  );

  await Promise.all(
    currentTags
      .filter((tag) => !desiredTagIds.has(String(tag.id)))
      .map((tag) => detachTagFromRecipe(recipeId, tag.id)),
  );

  return desiredTags;
}

/**
 * Filter a recipe list by tag id.
 * @param {Array<object>} recipes
 * @param {string | number | null} tagId
 */
export function filterRecipesByTag(recipes, tagId) {
  if (!tagId || tagId === 'all') {
    return recipes;
  }

  return recipes.filter((recipe) => (recipe.tags ?? []).some((tag) => String(tag.id) === String(tagId)));
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
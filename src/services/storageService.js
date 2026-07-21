import { getSupabaseClient } from './supabaseClient.js';

const RECIPE_IMAGE_BUCKET = 'recipe-images';
const AVATAR_BUCKET = 'avatars';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function getStorageErrorMessage(error) {
  return error?.message ?? 'An unexpected storage error occurred.';
}

function getFileExtension(file) {
  const extensionMatch = file.name.match(/\.[a-z0-9]+$/i);
  if (extensionMatch) {
    return extensionMatch[0].toLowerCase();
  }

  const mimeExtension = file.type.split('/')[1];
  return mimeExtension ? `.${mimeExtension.toLowerCase()}` : '.bin';
}

function buildStoragePath(userId, file) {
  return `${userId}/${Date.now()}-${crypto.randomUUID()}${getFileExtension(file)}`;
}

function validateImageFile(file) {
  if (!(file instanceof File)) {
    throw new Error('Please choose an image file.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image files must be 5 MB or smaller.');
  }
}

async function uploadFile(bucket, file, userId) {
  validateImageFile(file);

  if (!userId) {
    throw new Error('You must be signed in to upload files.');
  }

  const supabase = getSupabaseClient();
  const path = buildStoragePath(userId, file);

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });

  if (error) {
    throw new Error(getStorageErrorMessage(error));
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}

function extractStoragePathFromPublicUrl(bucket, publicUrl) {
  if (!publicUrl) {
    return null;
  }

  try {
    const url = new URL(publicUrl);
    const marker = `/object/public/${bucket}/`;
    const index = url.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

async function deleteByPublicUrl(bucket, publicUrl) {
  const path = extractStoragePathFromPublicUrl(bucket, publicUrl);

  if (!path) {
    return false;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(getStorageErrorMessage(error));
  }

  return true;
}

/**
 * Upload a recipe image into Supabase Storage.
 * @param {File} file
 * @param {string} userId
 */
export async function uploadRecipeImage(file, userId) {
  return uploadFile(RECIPE_IMAGE_BUCKET, file, userId);
}

/**
 * Upload an avatar image into Supabase Storage.
 * @param {File} file
 * @param {string} userId
 */
export async function uploadAvatar(file, userId) {
  return uploadFile(AVATAR_BUCKET, file, userId);
}

/**
 * Build a public URL for a stored asset.
 * @param {string} bucket
 * @param {string} path
 */
export function getPublicStorageUrl(bucket, path) {
  const supabase = getSupabaseClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a recipe image if it lives in recipe-images storage.
 * @param {string | null | undefined} publicUrl
 */
export async function deleteRecipeImageByUrl(publicUrl) {
  return deleteByPublicUrl(RECIPE_IMAGE_BUCKET, publicUrl);
}

/**
 * Delete an avatar image if it lives in avatars storage.
 * @param {string | null | undefined} publicUrl
 */
export async function deleteAvatarByUrl(publicUrl) {
  return deleteByPublicUrl(AVATAR_BUCKET, publicUrl);
}
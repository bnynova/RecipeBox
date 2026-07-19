/**
 * Upload a recipe image into Supabase Storage.
 * @param {File} file
 * @param {string} userId
 */
export async function uploadRecipeImage(file, userId) {
  throw new Error('uploadRecipeImage is not implemented yet.');
}

/**
 * Upload an avatar image into Supabase Storage.
 * @param {File} file
 * @param {string} userId
 */
export async function uploadAvatar(file, userId) {
  throw new Error('uploadAvatar is not implemented yet.');
}

/**
 * Build a public URL for a stored asset.
 * @param {string} bucket
 * @param {string} path
 */
export function getPublicStorageUrl(bucket, path) {
  throw new Error('getPublicStorageUrl is not implemented yet.');
}
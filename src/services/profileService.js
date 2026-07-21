import { getSupabaseClient } from './supabaseClient.js';

function getProfileErrorMessage(error) {
  return error?.message ?? 'An unexpected profile error occurred.';
}

/**
 * Fetch a profile row by user id.
 * @param {string} userId
 */
export async function getProfileById(userId) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, display_name, bio, avatar_url')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(getProfileErrorMessage(error));
  }

  return data;
}

/**
 * Update the current user's profile row.
 * @param {string} userId
 * @param {object} profileData
 * @param {string} profileData.displayName
 * @param {string} profileData.bio
 * @param {string | null} profileData.avatarUrl
 */
export async function updateProfile(userId, profileData) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: profileData.displayName,
      bio: profileData.bio,
      avatar_url: profileData.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('id, email, role, display_name, bio, avatar_url')
    .single();

  if (error) {
    throw new Error(getProfileErrorMessage(error));
  }

  return data;
}
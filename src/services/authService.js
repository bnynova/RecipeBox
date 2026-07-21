import { getSupabaseClient } from './supabaseClient.js';

function getAuthErrorMessage(error) {
  const message = error?.message ?? 'An unexpected auth error occurred.';

  if (message.includes('Invalid login credentials')) {
    return 'Wrong email or password.';
  }

  if (message.includes('User already registered')) {
    return 'That email is already registered.';
  }

  if (message.includes('Email not confirmed')) {
    return 'Please confirm your email address before logging in.';
  }

  return message;
}

/**
 * Register a new user with email and password and prepare their profile record.
 * @param {object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @param {string} [credentials.displayName]
 */
export async function registerUser({ email, password, displayName }) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName?.trim() || email.split('@')[0],
      },
    },
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }

  return data;
}

/**
 * Sign an existing user in with email and password.
 * @param {object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 */
export async function loginUser({ email, password }) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }

  return data;
}

/**
 * Sign the current authenticated user out of Supabase Auth.
 */
export async function logoutUser() {
  const supabase = getSupabaseClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

/**
 * Fetch the currently authenticated Supabase user.
 */
export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }

  return data.user;
}

/**
 * Fetch the current Supabase auth session.
 */
export async function getCurrentSession() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }

  return data.session;
}

/**
 * Fetch the profile row for a given user id.
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
    throw new Error(getAuthErrorMessage(error));
  }

  return data;
}

/**
 * Subscribe to auth state changes such as sign-in and sign-out.
 * @param {(eventName: string, session: unknown) => void} callback
 */
export function subscribeToAuthChanges(callback) {
  const supabase = getSupabaseClient();

  return supabase.auth.onAuthStateChange(callback);
}
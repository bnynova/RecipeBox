/**
 * Register a new user with email and password and prepare their profile record.
 * @param {object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @param {string} [credentials.displayName]
 */
export async function registerUser(credentials) {
  throw new Error('registerUser is not implemented yet.');
}

/**
 * Sign an existing user in with email and password.
 * @param {object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 */
export async function loginUser(credentials) {
  throw new Error('loginUser is not implemented yet.');
}

/**
 * Sign the current authenticated user out of Supabase Auth.
 */
export async function logoutUser() {
  throw new Error('logoutUser is not implemented yet.');
}

/**
 * Fetch the currently authenticated Supabase user.
 */
export async function getCurrentUser() {
  throw new Error('getCurrentUser is not implemented yet.');
}

/**
 * Fetch the current Supabase auth session.
 */
export async function getCurrentSession() {
  throw new Error('getCurrentSession is not implemented yet.');
}

/**
 * Subscribe to auth state changes such as sign-in and sign-out.
 * @param {(eventName: string, session: unknown) => void} callback
 */
export function subscribeToAuthChanges(callback) {
  throw new Error('subscribeToAuthChanges is not implemented yet.');
}
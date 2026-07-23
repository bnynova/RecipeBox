import { loginUser, registerUser } from '../services/authService.js';
import { showToast } from '../components/toasts.js';

function setActiveMode(root, mode) {
  const loginTab = root.querySelector('[data-auth-tab="login"]');
  const registerTab = root.querySelector('[data-auth-tab="register"]');
  const loginPanel = root.querySelector('[data-auth-panel="login"]');
  const registerPanel = root.querySelector('[data-auth-panel="register"]');

  const isLogin = mode === 'login';

  loginTab?.classList.toggle('active', isLogin);
  registerTab?.classList.toggle('active', !isLogin);
  loginPanel?.classList.toggle('d-none', !isLogin);
  registerPanel?.classList.toggle('d-none', isLogin);

  const heading = root.querySelector('[data-auth-heading]');
  if (heading) {
    heading.textContent = isLogin ? 'Sign in to RecipeBox' : 'Create your RecipeBox account';
  }
}

function getAuthModeFromHash() {
  return window.location.hash === '#register' ? 'register' : 'login';
}

async function handleRegister(root, event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const displayName = form.elements.namedItem('displayName').value.trim();
  const email = form.elements.namedItem('email').value.trim();
  const password = form.elements.namedItem('password').value;

  try {
    submitButton.disabled = true;
    submitButton.textContent = 'Creating account...';
    await registerUser({ displayName, email, password });
    showToast('Account created. Your profile is ready.', { variant: 'success' });
    setActiveMode(root, 'login');
    form.reset();
    root.querySelector('[data-auth-panel="login"] [name="email"]')?.focus();
  } catch (error) {
    showToast(error.message, { variant: 'error' });
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Create account';
  }
}

async function handleLogin(root, event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const email = form.elements.namedItem('email').value.trim();
  const password = form.elements.namedItem('password').value;

  try {
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';
    await loginUser({ email, password });
    window.location.assign('/dashboard');
  } catch (error) {
    showToast(error.message, { variant: 'error' });
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Login';
  }
}

/**
 * Wire up the combined login/register page.
 * @param {HTMLElement} root
 */
export function setupAuthPage(root) {
  if (!root) {
    return;
  }

  const syncMode = () => {
    setActiveMode(root, getAuthModeFromHash());
  };

  syncMode();

  root.querySelector('[data-auth-tab="login"]')?.addEventListener('click', () => {
    window.location.hash = '#login';
    syncMode();
  });

  root.querySelector('[data-auth-tab="register"]')?.addEventListener('click', () => {
    window.location.hash = '#register';
    syncMode();
  });

  window.addEventListener('hashchange', syncMode);

  root.querySelector('[data-auth-panel="login"] form')?.addEventListener('submit', (event) => {
    void handleLogin(root, event);
  });

  root.querySelector('[data-auth-panel="register"] form')?.addEventListener('submit', (event) => {
    void handleRegister(root, event);
  });
}
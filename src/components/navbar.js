import { escapeHtml } from '../utils/helpers.js';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'recipe-form', label: 'Add Recipe', href: '/pages/recipe-form.html' },
  { key: 'profile', label: 'Profile', href: '/pages/profile.html' },
  { key: 'admin', label: 'Admin', href: '/pages/admin.html', requiresRole: 'admin' },
];

function getInitials(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}

function getHomeNavigationItem(isAuthenticated) {
  return isAuthenticated
    ? { key: 'dashboard', label: 'Dashboard', href: '/dashboard' }
    : { key: 'home', label: 'Home', href: '/' };
}

/**
 * Create the shared Bootstrap navbar for RecipeBox.
 * @param {object} options
 * @param {string} [options.activePage]
 * @param {boolean} [options.isAuthenticated]
 * @param {string} [options.role]
 * @param {string} [options.displayName]
 * @param {string | null} [options.avatarUrl]
 */
export function createNavbar({
  activePage = 'home',
  isAuthenticated = false,
  role = 'normal',
  displayName = 'Account',
  avatarUrl = null,
} = {}) {
  const safeDisplayName = escapeHtml(displayName);
  const navLinks = [getHomeNavigationItem(isAuthenticated), ...NAV_ITEMS.slice(1)]
    .filter((item) => !item.requiresRole || item.requiresRole === role)
    .map((item) => {
      const activeClass = item.key === activePage ? ' active' : '';

      return `
        <li class="nav-item">
          <a class="nav-link${activeClass}" ${item.key === activePage ? 'aria-current="page"' : ''} href="${item.href}">
            ${item.label}
          </a>
        </li>
      `;
    })
    .join('');

  const authAction = isAuthenticated
    ? `
      <div class="d-flex align-items-center gap-3 ms-lg-3">
        <div class="d-flex align-items-center gap-2 text-white">
          <span class="rounded-circle bg-light text-dark d-inline-flex align-items-center justify-content-center fw-semibold" style="width: 2.25rem; height: 2.25rem; overflow: hidden;">
            ${avatarUrl ? `<img src="${avatarUrl}" alt="${safeDisplayName}" class="w-100 h-100" style="object-fit: cover;" />` : getInitials(displayName)}
          </span>
          <span class="fw-semibold small d-none d-lg-inline">${safeDisplayName}</span>
        </div>
        <button class="btn btn-outline-light" type="button" data-auth-action="logout">Logout</button>
      </div>
    `
    : '<div class="d-flex flex-column flex-lg-row gap-2 ms-lg-3"><a class="btn btn-outline-light" href="/login#register">Register</a><a class="btn btn-light" href="/login#login">Login</a></div>';

  const brandHref = isAuthenticated ? '/dashboard' : '/';

  return `
    <nav class="navbar navbar-expand-lg navbar-dark app-navbar">
      <div class="container">
        <a class="navbar-brand fw-bold text-uppercase" href="${brandHref}">RecipeBox</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#recipeBoxNav" aria-controls="recipeBoxNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="recipeBoxNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">${navLinks}</ul>
          <div class="d-flex align-items-lg-center">${authAction}</div>
        </div>
      </div>
    </nav>
  `;
}
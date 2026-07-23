import { escapeHtml } from '../utils/helpers.js';
import { icon } from './icons.js';

const GUEST_NAV_ITEMS = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'recipes', label: 'Recipes', href: '/recipes' },
  { key: 'contacts', label: 'Contacts', href: '/contacts' },
];

const AUTH_NAV_ITEMS = [
  { key: 'home', label: 'Home', href: '/', requiresAuth: true },
  { key: 'recipes', label: 'Recipes', href: '/recipes', requiresAuth: true },
  { key: 'contacts', label: 'Contacts', href: '/contacts', requiresAuth: true },
  { key: 'my-recipes', label: 'My Recipes', href: '/my-recipes/index.html', requiresAuth: true },
  { key: 'profile', label: 'Profile', href: '/profile', requiresAuth: true },
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

function getNavItems(isAuthenticated) {
  return isAuthenticated ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS;
}

function isActiveNavItem(item, activePage) {
  if (item.key === activePage) {
    return true;
  }

  if (item.key === 'home' && activePage === 'dashboard') {
    return true;
  }

  return item.key === 'recipe-form' && ['recipe-add', 'recipe-edit', 'recipe-form'].includes(activePage);
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
  const navItems = getNavItems(isAuthenticated)
    .filter((item) => (!item.requiresAuth || isAuthenticated) && (!item.requiresRole || item.requiresRole === role))
    .filter((item) => isAuthenticated || ['home', 'recipes', 'contacts'].includes(item.key))
    .filter((item) => !isAuthenticated || ['home', 'recipes', 'contacts', 'my-recipes', 'profile'].includes(item.key));

  const leftNavItems = navItems.filter((item) => ['home', 'recipes', 'contacts'].includes(item.key));
  const rightNavItems = navItems.filter((item) => ['my-recipes', 'profile'].includes(item.key));

  const safeDisplayName = escapeHtml(displayName);

  const renderNavList = (items) => items
    .map((item) => {
      const activeClass = isActiveNavItem(item, activePage) ? ' active' : '';
      const iconMap = {
        home: 'bi-house-door-fill',
        recipes: 'bi-journal-bookmark-fill',
        contacts: 'bi-envelope-paper-fill',
        'my-recipes': 'bi-card-checklist',
        profile: 'bi-person-circle',
      };

      return `
        <li class="nav-item">
          <a class="nav-link${activeClass}" ${item.key === activePage ? 'aria-current="page"' : ''} href="${item.href}">
            ${icon(iconMap[item.key] ?? 'bi-dot', 'me-2')}<span>${item.label}</span>
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
        <ul class="navbar-nav flex-row flex-wrap gap-lg-2 mb-2 mb-lg-0">${renderNavList(rightNavItems)}</ul>
        <button class="btn btn-outline-light" type="button" data-auth-action="logout">${icon('bi-box-arrow-right', 'me-2')}Logout</button>
      </div>
    `
    : `<div class="d-flex flex-column flex-lg-row gap-2 ms-lg-3"><a class="btn btn-outline-light" href="/login#register">${icon('bi-person-plus-fill', 'me-2')}Register</a><a class="btn btn-light" href="/login#login">${icon('bi-box-arrow-in-right', 'me-2')}Login</a></div>`;

  const brandHref = '/';

  return `
    <nav class="navbar navbar-expand-lg navbar-dark app-navbar">
      <div class="container">
        <a class="navbar-brand fw-bold text-uppercase" href="${brandHref}">${icon('bi-egg-fried', 'me-2')}RecipeBox</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#recipeBoxNav" aria-controls="recipeBoxNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="recipeBoxNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">${renderNavList(leftNavItems)}</ul>
          <div class="d-flex align-items-lg-center">${authAction}</div>
        </div>
      </div>
    </nav>
  `;
}
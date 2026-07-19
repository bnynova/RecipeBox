const NAV_ITEMS = [
  { key: 'home', label: 'Home', href: '/pages/index.html' },
  { key: 'recipe-form', label: 'Add Recipe', href: '/pages/recipe-form.html' },
  { key: 'profile', label: 'Profile', href: '/pages/profile.html' },
  { key: 'admin', label: 'Admin', href: '/pages/admin.html', requiresRole: 'admin' },
];

/**
 * Create the shared Bootstrap navbar for RecipeBox.
 * @param {object} options
 * @param {string} [options.activePage]
 * @param {boolean} [options.isAuthenticated]
 * @param {string} [options.role]
 */
export function createNavbar({ activePage = 'home', isAuthenticated = false, role = 'normal' } = {}) {
  const navLinks = NAV_ITEMS.filter((item) => !item.requiresRole || item.requiresRole === role)
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
    ? '<button class="btn btn-outline-light ms-lg-3" type="button" data-auth-action="logout">Logout</button>'
    : '<a class="btn btn-light ms-lg-3" href="/pages/login.html">Login</a>';

  return `
    <nav class="navbar navbar-expand-lg navbar-dark app-navbar">
      <div class="container">
        <a class="navbar-brand fw-bold text-uppercase" href="/pages/index.html">RecipeBox</a>
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
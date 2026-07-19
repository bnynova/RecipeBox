import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { createFooter } from './components/footer.js';
import { createNavbar } from './components/navbar.js';
import { setupAuthPage } from './pages/authPage.js';
import {
  getCurrentSession,
  getCurrentUser,
  getProfileById,
  logoutUser,
  subscribeToAuthChanges,
} from './services/authService.js';
import { readBooleanDataAttribute } from './utils/helpers.js';
import './styles/main.css';

const { body } = document;
const activePage = body.dataset.page ?? 'home';
const navbarRoot = document.querySelector('[data-navbar-root]');
const footerRoot = document.querySelector('[data-footer-root]');

function getDisplayNameFromProfile(user, profile) {
  return user?.user_metadata?.full_name || profile?.email || user?.email || 'Account';
}

async function renderNavbarFromSession() {
  if (!navbarRoot) {
    return;
  }

  const session = await getCurrentSession().catch(() => null);

  if (!session?.user) {
    navbarRoot.innerHTML = createNavbar({ activePage, isAuthenticated: false, role: 'normal' });
    return;
  }

  const user = await getCurrentUser().catch(() => session.user);
  const profile = await getProfileById(user.id).catch(() => null);

  navbarRoot.innerHTML = createNavbar({
    activePage,
    isAuthenticated: true,
    role: profile?.role ?? 'normal',
    displayName: getDisplayNameFromProfile(user, profile),
    avatarUrl: profile?.avatar_url ?? null,
  });
}

async function handleNavbarActions() {
  if (!navbarRoot) {
    return;
  }

  navbarRoot.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const logoutButton = target.closest('[data-auth-action="logout"]');
    if (!logoutButton) {
      return;
    }

    try {
      await logoutUser();
      window.location.assign('/');
    } catch (error) {
      window.alert(error.message);
    }
  });
}

async function bootstrap() {
  const isAuthenticated = readBooleanDataAttribute(body, 'authenticated', false);
  if (footerRoot) {
    footerRoot.innerHTML = createFooter();
  }

  if (activePage === 'login') {
    setupAuthPage(document);

    const session = await getCurrentSession().catch(() => null);
    if (session?.user) {
      window.location.assign('/');
      return;
    }
  }

  if (isAuthenticated) {
    await renderNavbarFromSession();
  } else {
    await renderNavbarFromSession();
  }

  await handleNavbarActions();

  subscribeToAuthChanges(() => {
    void renderNavbarFromSession();
  });
}

void bootstrap();
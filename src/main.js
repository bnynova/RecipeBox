import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { createFooter } from './components/footer.js';
import { createNavbar } from './components/navbar.js';
import { readBooleanDataAttribute } from './utils/helpers.js';
import './styles/main.css';

const { body } = document;
const activePage = body.dataset.page ?? 'home';
const role = body.dataset.role ?? 'normal';
const isAuthenticated = readBooleanDataAttribute(body, 'authenticated', false);

const navbarRoot = document.querySelector('[data-navbar-root]');
if (navbarRoot) {
  navbarRoot.innerHTML = createNavbar({ activePage, isAuthenticated, role });
}

const footerRoot = document.querySelector('[data-footer-root]');
if (footerRoot) {
  footerRoot.innerHTML = createFooter();
}
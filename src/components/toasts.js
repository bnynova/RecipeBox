import { Toast } from 'bootstrap';
import { escapeHtml } from '../utils/helpers.js';
import { icon } from './icons.js';

let toastContainer;

function ensureToastContainer() {
  if (toastContainer) {
    return toastContainer;
  }

  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3 app-toast-stack';
  toastContainer.setAttribute('aria-live', 'polite');
  toastContainer.setAttribute('aria-atomic', 'true');
  document.body.append(toastContainer);

  return toastContainer;
}

function getToastClass(variant) {
  if (variant === 'error') {
    return 'text-bg-danger';
  }

  if (variant === 'success') {
    return 'text-bg-success';
  }

  return 'text-bg-info';
}

function getToastTitle(variant) {
  if (variant === 'error') {
    return 'Error';
  }

  if (variant === 'success') {
    return 'Success';
  }

  return 'Info';
}

/**
 * Show a Bootstrap toast notification.
 * @param {string} message
 * @param {{ variant?: 'info' | 'success' | 'error', title?: string, delay?: number }} [options]
 */
export function showToast(message, options = {}) {
  const { variant = 'info', title, delay = 4000 } = options;
  const container = ensureToastContainer();
  const toastElement = document.createElement('div');
  toastElement.className = `toast ${getToastClass(variant)} border-0 shadow-lg`;
  toastElement.setAttribute('role', 'alert');
  toastElement.setAttribute('aria-live', 'assertive');
  toastElement.setAttribute('aria-atomic', 'true');
  toastElement.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <strong class="me-2">${icon(
          variant === 'error' ? 'bi-exclamation-triangle-fill' : variant === 'success' ? 'bi-check-circle-fill' : 'bi-info-circle-fill',
          'me-2',
        )}${escapeHtml(title ?? getToastTitle(variant))}</strong>
        <span>${escapeHtml(message)}</span>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.append(toastElement);
  const toast = new Toast(toastElement, { autohide: true, delay });

  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });

  toast.show();
}

/**
 * Remove any visible toasts.
 */
export function clearToasts() {
  ensureToastContainer().replaceChildren();
}
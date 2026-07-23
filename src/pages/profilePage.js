import { showToast } from '../components/toasts.js';
import { getCurrentUser } from '../services/authService.js';
import { deleteAvatarByUrl, uploadAvatar } from '../services/storageService.js';
import { getProfileById, updateProfile } from '../services/profileService.js';

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

function getInitials(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || '?';
}

function getFormAlert(root) {
  return root.querySelector('[data-profile-feedback]');
}

function showFormAlert(root, message, variant = 'danger') {
  const alert = getFormAlert(root);

  if (!alert) {
    return;
  }

  alert.className = `alert alert-${variant}`;
  alert.textContent = message;
  alert.classList.remove('d-none');
}

function clearFormAlert(root) {
  const alert = getFormAlert(root);

  if (!alert) {
    return;
  }

  alert.textContent = '';
  alert.className = 'alert d-none';
}

function renderAvatar(root, profile, fallbackText) {
  const image = root.querySelector('[data-profile-avatar-image]');
  const placeholder = root.querySelector('[data-profile-avatar-placeholder]');

  if (!(image instanceof HTMLImageElement)) {
    return;
  }

  if (profile.avatar_url) {
    image.src = profile.avatar_url;
    image.alt = `${profile.display_name ?? fallbackText} avatar`;
    image.classList.remove('d-none');
    placeholder?.classList.add('d-none');
    return;
  }

  image.removeAttribute('src');
  image.classList.add('d-none');
  if (placeholder) {
    placeholder.textContent = getInitials(profile.display_name ?? fallbackText);
    placeholder.classList.remove('d-none');
  }
}

function buildDisplayName(profile, user) {
  return profile.display_name || user?.user_metadata?.full_name || profile.email?.split('@')[0] || 'Account';
}

function validateAvatarFile(file) {
  if (!file) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Profile photo must be an image file.');
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error('Profile photo must be 5 MB or smaller.');
  }
}

function setLoadingState(root, isLoading, message) {
  const loading = root.querySelector('[data-profile-loading]');
  const status = root.querySelector('[data-profile-status]');

  loading?.classList.toggle('d-none', !isLoading);

  if (status) {
    status.textContent = message;
    status.classList.toggle('d-none', isLoading);
  }
}

function syncPageLabels(root, profile, user) {
  const displayName = buildDisplayName(profile, user);

  root.querySelector('[data-profile-page-name]')?.replaceChildren(document.createTextNode(displayName));
  root.querySelector('[data-profile-email]')?.replaceChildren(document.createTextNode(profile.email ?? user.email ?? ''));
  root.querySelector('[name="displayName"]').value = profile.display_name ?? '';
  root.querySelector('[name="bio"]').value = profile.bio ?? '';
  renderAvatar(root, profile, user.email ?? displayName);
}

function handleAvatarSelection(root, state, file) {
  const image = root.querySelector('[data-profile-avatar-image]');
  const placeholder = root.querySelector('[data-profile-avatar-placeholder]');

  if (!(image instanceof HTMLImageElement)) {
    return;
  }

  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = null;
  }

  if (!file) {
    if (state.currentAvatarUrl) {
      image.src = state.currentAvatarUrl;
      image.classList.remove('d-none');
      placeholder?.classList.add('d-none');
      return;
    }

    image.classList.add('d-none');
    placeholder?.classList.remove('d-none');
    placeholder.textContent = state.placeholderText;
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  state.objectUrl = objectUrl;
  image.src = objectUrl;
  image.alt = file.name;
  image.classList.remove('d-none');
  placeholder?.classList.add('d-none');
}

/**
 * Wire up the profile page.
 * @param {HTMLElement} root
 */
export async function setupProfilePage(root) {
  const state = {
    currentAvatarUrl: '',
    objectUrl: null,
    selectedAvatarFile: null,
    placeholderText: '?',
  };

  const form = root.querySelector('form');
  const avatarInput = root.querySelector('[data-profile-avatar-input]');
  const saveButton = root.querySelector('[data-profile-save-button]');

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  try {
    setLoadingState(root, true, 'Loading profile...');
    clearFormAlert(root);

    const currentUser = await getCurrentUser();
    const profile = await getProfileById(currentUser.id);

    state.currentAvatarUrl = profile.avatar_url ?? '';
    state.placeholderText = getInitials(buildDisplayName(profile, currentUser));

    syncPageLabels(root, profile, currentUser);
    handleAvatarSelection(root, state, null);
    setLoadingState(root, false, 'Ready to update your profile');

    avatarInput?.addEventListener('change', () => {
      const file = avatarInput.files?.[0] ?? null;

      try {
        validateAvatarFile(file);
        state.selectedAvatarFile = file;
        clearFormAlert(root);
        handleAvatarSelection(root, state, file);
      } catch (error) {
        state.selectedAvatarFile = null;
        avatarInput.value = '';
        handleAvatarSelection(root, state, null);
        showFormAlert(root, error.message);
      }
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearFormAlert(root);

      const displayName = String(form.elements.namedItem('displayName').value ?? '').trim();
      const bio = String(form.elements.namedItem('bio').value ?? '').trim();

      if (!displayName) {
        showFormAlert(root, 'Display name is required.');
        return;
      }

      let uploadedAvatar = null;
      let avatarUrl = state.currentAvatarUrl || profile.avatar_url || null;

      try {
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        if (state.selectedAvatarFile) {
          uploadedAvatar = await uploadAvatar(state.selectedAvatarFile, currentUser.id);
          avatarUrl = uploadedAvatar.publicUrl;
        }

        const updatedProfile = await updateProfile(currentUser.id, {
          displayName,
          bio,
          avatarUrl,
        });

        if (uploadedAvatar && state.currentAvatarUrl && state.currentAvatarUrl !== avatarUrl) {
          await deleteAvatarByUrl(state.currentAvatarUrl).catch(() => null);
        }

        state.currentAvatarUrl = updatedProfile.avatar_url ?? avatarUrl ?? '';
        state.selectedAvatarFile = null;

        if (state.objectUrl) {
          URL.revokeObjectURL(state.objectUrl);
          state.objectUrl = null;
        }

        syncPageLabels(root, updatedProfile, currentUser);
        showFormAlert(root, 'Profile updated successfully.', 'success');
        showToast('Profile updated successfully.', { variant: 'success' });
        document.dispatchEvent(new CustomEvent('profile:updated'));
      } catch (error) {
        if (uploadedAvatar?.publicUrl) {
          await deleteAvatarByUrl(uploadedAvatar.publicUrl).catch(() => null);
        }

        showFormAlert(root, error.message);
        showToast(error.message, { variant: 'error' });
      } finally {
        saveButton.disabled = false;
        saveButton.textContent = 'Save profile';
      }
    });
  } catch (error) {
    setLoadingState(root, false, 'Unable to load profile');
    showFormAlert(root, error.message);
    showToast(error.message, { variant: 'error' });
  }
}
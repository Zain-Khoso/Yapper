'use strict';

// Lib Imports.
import { default as BaseSwal } from 'sweetalert2';
import axios from 'axios';

// Local Imports.
import { getTheme } from './theme';

// Constants.
const Swal = BaseSwal.mixin({
  theme: getTheme(),
  customClass: {
    confirmButton: 'btn primary',
    cancelButton: 'btn outline',
  },
});
const showError = Swal.mixin({
  icon: 'error',
  iconColor: 'var(--color-danger)',
  customClass: {
    confirmButton: 'btn danger',
    cancelButton: 'btn outline',
  },
});
const showSuccess = Swal.mixin({
  icon: 'success',
  iconColor: 'var(--color-success)',
  customClass: {
    confirmButton: 'btn success',
    cancelButton: 'btn outline',
  },
});

const API = axios.create({ baseURL: '/api/v1' });

// Functions.
function startCooldown(element, seconds = 60) {
  if (!element) return;

  const originalText = element.textContent || element.value;
  let remaining = seconds;

  element.disabled = true;
  element.textContent = `Resend in ${remaining}s`;

  const timer = setInterval(() => {
    remaining--;

    if (remaining <= 0) {
      clearInterval(timer);
      element.disabled = false;
      element.textContent = originalText;
    } else {
      element.textContent = `Resend in ${remaining}s`;
      element.disabled = true;
    }
  }, 1000);
}

export { Swal, showError, showSuccess, API, startCooldown };

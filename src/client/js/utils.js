'use strict';

// Lib Imports.
import { default as BaseSwal } from 'sweetalert2';

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

export { Swal, showError, showSuccess };

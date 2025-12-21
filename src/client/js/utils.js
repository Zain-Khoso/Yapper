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

export { Swal, showError, showSuccess, API };

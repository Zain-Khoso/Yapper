'use strict';

// Function to use Swal for errors.
const showError = function (errorName, errorMessage) {
  return Swal.fire({
    icon: 'error',
    title: `${errorName} Error`,
    text: errorMessage,
    iconColor: 'var(--color-danger)',
    confirmButtonColor: 'var(--color-danger)',
    theme: 'auto',
  });
};

// Function to use Swal for success.
const showSuccess = function (title, text) {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    iconColor: 'var(--color-success)',
    confirmButtonColor: 'var(--color-success)',
    theme: 'auto',
  });
};

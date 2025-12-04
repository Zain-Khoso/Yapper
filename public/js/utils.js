'use strict';

// Function to use Swal for errors.
const showError = function (errorName, errorMessage) {
  return Swal.fire({
    icon: 'error',
    iconColor: 'var(--color-danger)',
    title: `${errorName} Error`,
    text: errorMessage,
    theme: 'auto',
    customClass: {
      confirmButton: 'btn danger',
    },
  });
};

// Function to use Swal for success.
const showSuccess = function (title, text) {
  return Swal.fire({
    icon: 'success',
    iconColor: 'var(--color-success)',
    title,
    text,
    theme: 'auto',
    customClass: {
      confirmButton: 'btn success',
    },
  });
};

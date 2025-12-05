'use strict';

const getTheme = function () {
  let theme = localStorage.getItem('theme');

  if (theme) return theme;

  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (isDarkMode) return 'dark';
  else return 'light';
};

// Function to use Swal for errors.
const showError = function (errorName, errorMessage) {
  return Swal.fire({
    icon: 'error',
    iconColor: 'var(--color-danger)',
    title: `${errorName} Error`,
    text: errorMessage,
    theme: getTheme(),
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
    theme: getTheme(),
    customClass: {
      confirmButton: 'btn success',
    },
  });
};

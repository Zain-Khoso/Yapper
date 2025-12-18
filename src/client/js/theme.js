'use strict';

// Function to get the current selected theme (darkmode/lightmode) of the user.
function getTheme() {
  let theme = localStorage.getItem('theme');

  if (theme) return theme;

  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (isDarkMode) return 'dark';
  else return 'light';
}

// IIFE to set the user's prefered theme on page load.
(function () {
  document.documentElement.setAttribute('data-theme', getTheme());
  localStorage.setItem('theme', getTheme());
})();

export { getTheme };

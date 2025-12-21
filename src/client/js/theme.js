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
  const elem_ThemeLabel = document.querySelector('#setting-theme .setting-value');
  const theme = getTheme();

  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  if (elem_ThemeLabel) elem_ThemeLabel.textContent = theme.at(0).toUpperCase() + theme.slice(1);
})();

export { getTheme };

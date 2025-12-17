'use strict';

// DOM Selections.
const elem_Theme = document.getElementById('theme-value');
const elem_ThemeBtn = document.getElementById('theme-btn');

// Variables.
let isLoading = false;

// Functions.

// Function to handle change displauName action.
const handleThemeChange = async function (event) {
  if (document.documentElement.getAttribute('data-theme') === 'dark')
    document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.setAttribute('data-theme', 'dark');

  localStorage.setItem('theme', document.documentElement.getAttribute('data-theme'));
};

// Event Listeners.
elem_ThemeBtn.addEventListener('click', handleThemeChange);

'use script';

(function () {
  document.documentElement.setAttribute('data-theme', getTheme());
  localStorage.setItem('theme', getTheme());
})();

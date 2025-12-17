'use strict';

// DOM Selections.
const elem_Page = document.getElementById('page-content');
const elem_SidenavBtn = document.getElementById('sidenav-btn');

// Functions.

const handleSidenavOpen = function () {
  elem_Page.classList.add('close');
};

// Event Listeners.
elem_SidenavBtn?.addEventListener('click', handleSidenavOpen);

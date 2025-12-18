'use strict';

// DOM Selections.
const elem_Dropdowns = document.querySelectorAll('.dropdown');

// Variables.
let dropdownTimeout = null;

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

const handleDropdownToggle = (event) => {
  event.stopPropagation();

  const elem_Btn = event.currentTarget;
  const elem_Dropdown = elem_Btn.closest('.dropdown');
  const elem_List = elem_Dropdown.querySelector('.dropdown-list');

  const isOpen = elem_List.classList.contains('show');

  closeAllDropdowns();

  if (!isOpen) {
    openDropdown(elem_List);
  }
};

const openDropdown = (elem_ItemList) => {
  elem_ItemList.style.display = 'block';

  setTimeout(() => elem_ItemList.classList.add('show'), 100);

  document.body.addEventListener('click', closeAllDropdowns, { once: true });
};

const closeDropdown = (elem_ItemList) => {
  elem_ItemList.classList.remove('show');
  setTimeout(() => (elem_ItemList.style.display = 'none'), 300);
};

const closeAllDropdowns = () => {
  document.querySelectorAll('.dropdown-list.show').forEach(closeDropdown);
};

function formatDateString(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function isSameDate(one, two) {
  if (!one || !two) return false;

  if (
    one.getFullYear() === two.getFullYear() &&
    one.getMonth() === two.getMonth() &&
    one.getDate() === two.getDate()
  )
    return true;
  else return false;
}

// Event Listeners.
elem_Dropdowns.forEach((dropdown) => {
  const control = dropdown.querySelector('button');

  control?.addEventListener('click', handleDropdownToggle);
});

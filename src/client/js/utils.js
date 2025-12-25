'use strict';

// Lib Imports.
import { default as BaseSwal } from 'sweetalert2';
import axios from 'axios';

// Local Imports.
import { getTheme } from './theme';

// Variables.
let cooldownTimer = null;
let isRefreshing = false;
let failedQueue = [];

// Constants.
const PROTECTED_ROUTES = ['change-email', '/chat', '/calls', '/settings'];
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
const showInfo = Swal.mixin({
  icon: 'info',
  iconColor: 'var(--color-foreground)',
  customClass: {
    confirmButton: 'btn primary',
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

// DOM Selections.
const elem_Dropdowns = document.querySelectorAll('.dropdown');

// Functions.
function startCooldown(element, seconds = 60) {
  if (!element) return;

  const originalText = element.textContent || element.value;
  let remaining = seconds;

  element.disabled = true;
  element.textContent = `Resend in ${remaining}s`;

  if (cooldownTimer) clearInterval(cooldownTimer);

  cooldownTimer = setInterval(() => {
    remaining--;

    if (remaining <= 0) {
      clearInterval(cooldownTimer);
      element.disabled = false;
      element.textContent = originalText;
    } else {
      element.textContent = `Resend in ${remaining}s`;
      element.disabled = true;
    }
  }, 1000);
}

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
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

const isSameDate = function (one, two) {
  if (!one || !two) return false;

  if (
    one.getFullYear() === two.getFullYear() &&
    one.getMonth() === two.getMonth() &&
    one.getDate() === two.getDate()
  )
    return true;
  else return false;
};

// Event Listeners.
elem_Dropdowns.forEach((dropdown) => {
  const control = dropdown.querySelector('button');

  control?.addEventListener('click', handleDropdownToggle);
});

// Axios Auth Intercepter.
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) return location.assign('/login');

    if (error.response?.status === 403 && !originalRequest.__retry__) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest.__retry__ = true;
      isRefreshing = true;

      try {
        const response = await axios.get('/api/v1/auth/refresh', { withCredentials: true });
        const newToken = response.data.data.accessToken;

        API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        if (!window?.currentUser) window.currentUser = new Map();
        window.currentUser.set('accessToken', newToken);

        processQueue(null, newToken);

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        if (PROTECTED_ROUTES.includes(location.pathname)) return location.assign('/login');
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { Swal, showInfo, showError, showSuccess, API, startCooldown, isSameDate };

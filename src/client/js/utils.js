'use strict';

// Lib Imports.
import { default as BaseSwal } from 'sweetalert2';
import axios from 'axios';

// Local Imports.
import { getTheme } from './theme';

// Constants.
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
const showSuccess = Swal.mixin({
  icon: 'success',
  iconColor: 'var(--color-success)',
  customClass: {
    confirmButton: 'btn success',
    cancelButton: 'btn outline',
  },
});

const API = axios.create({ baseURL: '/api/v1' });

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

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
        return location.assign('/login');
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Functions.
function startCooldown(element, seconds = 60) {
  if (!element) return;

  const originalText = element.textContent || element.value;
  let remaining = seconds;

  element.disabled = true;
  element.textContent = `Resend in ${remaining}s`;

  const timer = setInterval(() => {
    remaining--;

    if (remaining <= 0) {
      clearInterval(timer);
      element.disabled = false;
      element.textContent = originalText;
    } else {
      element.textContent = `Resend in ${remaining}s`;
      element.disabled = true;
    }
  }, 1000);
}

export { Swal, showError, showSuccess, API, startCooldown };

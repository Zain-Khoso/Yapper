'use strict';

// Local Imports.
import { API } from './utils';

(async function () {
  if (window?.user) return;

  try {
    const {
      data: { data },
    } = await API.get('/account');

    Object.keys(data).forEach((key) => {
      if (!window?.currentUser) window.currentUser = new Map();

      window.currentUser.set(key, data[key]);
    });
  } catch {
    window.currentUser = null;
  } finally {
    document
      .querySelectorAll('.auth-action')
      .forEach((elem) => elem.classList.toggle('hidden', !window?.currentUser));
    document
      .querySelectorAll('.noauth-action')
      .forEach((elem) => elem.classList.toggle('hidden', window?.currentUser));
  }
})();

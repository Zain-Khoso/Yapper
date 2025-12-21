'use strict';

// Local Imports.
import { API } from './utils';

// Variables.
let isLoading = false;
let callbacks = [];

async function loadCurrentUser(callback = undefined) {
  callbacks.push(callback);

  if (isLoading) return;
  isLoading = true;

  if (window?.currentUser) return window.currentUser;

  try {
    const {
      data: { data },
    } = await API.get('/account');

    Object.keys(data).forEach((key) => {
      if (!window?.currentUser) window.currentUser = new Map();

      window.currentUser.set(key, data[key]);
    });

    await Promise.all(callbacks.map(async (cb) => await cb?.()));
    callbacks = [];
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
}

loadCurrentUser();

export { loadCurrentUser };

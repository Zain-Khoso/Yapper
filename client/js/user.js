'use strict';

// TODO: Setup a global axios instance.
// TODO: Transform the currentUser into a Map.
(async function () {
  if (window?.currentUser) return;

  try {
    const { data: user } = await axios.get('/api/v1/account');
  } catch {
    window.currentUser = null;

    document.querySelectorAll('.auth-action').forEach((elem) => elem.classList.add('hidden'));
    document.querySelectorAll('.noauth-action').forEach((elem) => elem.classList.remove('hidden'));
  }
})();

'use strict';

// DOM Selections.
const elem_BtnLogout = document.getElementById('btn-logout');

// Functions.

// Function to handle user logout.
const handleLogout = async function (event) {
  // Form Submittion.
  try {
    await axios.get('/account/logout');

    location.assign('/');
  } catch (response) {
    // Extracting Error Information.
    const { errors } = response.response.data;

    if (errors?.root) showError('Server', errors.root);
  }
};

// Event Listeners.
elem_BtnLogout.addEventListener('click', handleLogout);

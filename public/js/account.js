'use strict';

// Constants.
const userEmail = document.getElementById('userData-email').textContent;

// DOM Selections.
const elem_BtnChangePassowrd = document.getElementById('btn-change-password');
const elem_BtnLogout = document.getElementById('btn-logout');

// Variables.
let isLoading = false;

// Functions.

// Function to handle change passowrd action.
const handleChangePassowrd = async function (event) {
  if (isLoading) return;

  isLoading = true;

  // Form Submittion.
  try {
    const { data } = await axios.post('/change-password-token', { email: userEmail });

    location.assign(`/change-password/${data.actionToken}`);
  } catch (response) {
    isLoading = false;
    console.log(response);

    // Extracting Error Information.
    const { errors } = response?.response?.data;

    showError('Server', errors?.root || errors?.email || '');
  }
};

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
elem_BtnChangePassowrd.addEventListener('click', handleChangePassowrd);
elem_BtnLogout.addEventListener('click', handleLogout);

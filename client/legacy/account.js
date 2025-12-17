'use strict';

// Constants.
const userEmail = document.getElementById('userData-email').textContent;
const userDisplayName = document.getElementById('userData-displayName').textContent;

// DOM Selections.
const elem_BtnChangeDisplayName = document.getElementById('btn-change-displayName');
const elem_BtnChangePassowrd = document.getElementById('btn-change-password');
const elem_BtnLogout = document.getElementById('btn-logout');
const elem_BtnDelete = document.getElementById('btn-account-delete');

// Variables.
let isLoading = false;

// Functions.

// Function to handle change displauName action.
const handleChangeDisplayName = async function (event) {
  if (isLoading) return;

  const confirmation = await Swal.fire({
    icon: 'question',
    iconColor: 'var(--color-foreground)',
    title: 'Change Name',
    text: 'Please enter your desired new name then click confirm, to confirm the change.',
    theme: getTheme(),
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    input: 'text',
    inputLabel: 'New Name',
    inputPlaceholder: userDisplayName,
    inputValidator: (value) => {
      if (value.trim() === '') return 'Display Name is required.';

      if (value.trim().length < 3) return 'Display Name cannot be of less than 3 characters.';

      if (value.trim().length > 16) return 'Display Name cannot be of more than 16 characters.';
    },
    customClass: {
      confirmButton: 'btn success',
      cancelButton: 'btn outline',
    },
  });

  if (!confirmation.isConfirmed) return;

  isLoading = true;

  // Form Submittion.
  try {
    await axios.post('/change-displayName', { displayName: confirmation.value });

    await showSuccess(
      'Name Changed',
      `You're name has been changed from ${userDisplayName} to ${confirmation.value}`
    );

    location.reload();
  } catch (response) {
    isLoading = false;

    // Extracting Error Information.
    const { errors } = response?.response?.data;

    showError('Server', errors?.root || '');
  }
};

// Function to handle change passowrd action.
const handleChangePassowrd = async function (event) {
  if (isLoading) return;

  isLoading = true;

  // Form Submittion.
  try {
    const { data } = await axios.post('/change-password-token', { email: userEmail });

    location.assign(data.redirectTo);
  } catch (response) {
    isLoading = false;

    // Extracting Error Information.
    const { errors } = response?.response?.data;

    showError('Server', errors?.root || errors?.email || '');
  }
};

// Function to handle account delete action.
const handleAccountDelete = async function (event) {
  if (isLoading) return;

  const { isConfirmed } = await Swal.fire({
    icon: 'question',
    iconColor: 'var(--color-danger)',
    title: 'Are you sure?',
    text: 'By clicking "YES" you give us consent to delete all data related to your account from our servers.',
    theme: getTheme(),
    showCancelButton: true,
    confirmButtonText: 'YES',
    cancelButtonText: 'NO',
    customClass: {
      confirmButton: 'btn danger',
      cancelButton: 'btn success',
    },
  });

  if (!isConfirmed) return;

  isLoading = true;

  // Form Submittion.
  try {
    await axios.get('/account/delete');

    await showSuccess(
      'Account Deleted',
      'We have deleted everything related to you from our databases. We hope to see you again in the future.'
    );

    location.assign('/');
  } catch (response) {
    isLoading = false;

    // Extracting Error Information.
    const { errors } = response?.response?.data;

    showError('Server', errors?.root);
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
elem_BtnChangeDisplayName.addEventListener('click', handleChangeDisplayName);
elem_BtnChangePassowrd.addEventListener('click', handleChangePassowrd);
elem_BtnDelete.addEventListener('click', handleAccountDelete);
elem_BtnLogout.addEventListener('click', handleLogout);

'use strict';

// Local Imports.
import { Entry } from './components.js';

// Constructing Components.
const NewPassword = new Entry('password');
const ConfirmNewPassword = new Entry('confirmPassword');

// Variables.
let isLoading = false;

// DOM Selections.
const elem_Form = document.getElementById('form');

// Functions.

// Function to handle form submittion.
const handleSubmit = async function (event) {
  event.preventDefault();

  if (isLoading) return;

  // Form Validations.
  const isNewPasswordValid = NewPassword.validate((value) => {
    if (value === '') return 'New Password is required';

    if (!validator.isStrongPassword(value))
      return 'Password must be 8 characters long with a lowercase, an uppercase, a number and a symbol characters.';

    return true;
  });

  if (!isNewPasswordValid) return;

  const isConfirmNewPasswordValid = ConfirmNewPassword.validate((value) => {
    if (value === '') return 'Confirm New Password is required';

    if (value !== NewPassword.getValue()) return 'Passwords do not match';

    return true;
  });

  if (!isConfirmNewPasswordValid) return;

  // Form Submittion.
  try {
    isLoading = true;

    await axios.post(location.pathname, {
      password: NewPassword.getValue(),
    });

    location.assign('/settings/account');
  } catch (response) {
    isLoading = false;

    // Extracting Error Information.
    const { errors } = response.response.data;

    if (errors?.newPassword) NewPassword.setError(errors.newPassword);

    if (errors?.root) showError('Server', errors.root);
  }
};

// Event Listeners.
elem_Form.addEventListener('submit', handleSubmit);

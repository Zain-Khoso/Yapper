'use strict';

// Local Imports.
import { Entry } from './components.js';

// Constructing Components.
const NewEmail = new Entry('newEmail');
const ConfirmNewEmail = new Entry('confirmNewEmail');

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
  const isNewEmailValid = NewEmail.validate((value) => {
    if (value.trim() === '') return 'New Email is required.';

    if (!validator.isEmail(value)) return 'Email is not valid.';

    return true;
  });

  if (!isNewEmailValid) return;

  const isConfirmNewEmailValid = ConfirmNewEmail.validate((value) => {
    if (value.trim() === '') return 'Confirm New Email is required.';

    if (value !== NewEmail.getValue()) return 'Emails do not match.';

    return true;
  });

  if (!isConfirmNewEmailValid) return;

  // Form Submittion.
  try {
    isLoading = true;

    await axios.post('/change-email', {
      newEmail: NewEmail.getValue(),
    });

    location.assign('/settings/account');
  } catch (response) {
    isLoading = false;

    // Extracting Error Information.
    const { errors } = response.response.data;

    if (errors?.newEmail) NewEmail.setError(errors.newEmail);

    if (errors?.root) showError('Server', errors.root);
  }
};

// Event Listeners.
elem_Form.addEventListener('submit', handleSubmit);

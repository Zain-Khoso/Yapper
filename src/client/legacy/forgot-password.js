'use strict';

// Local Imports.
import { Entry } from './components.js';

// Constructing Components.
const Email = new Entry('email');

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
  const isEmailValid = Email.validate((value) => {
    if (value.trim() === '') return 'Email is required.';

    if (!validator.isEmail(value)) return 'Email is not valid.';

    return true;
  });

  if (!isEmailValid) return;

  // Form Submittion.
  try {
    isLoading = true;

    await axios.post('/change-password-token', {
      email: Email.getValue(),
      sendEmail: true,
    });

    await showSuccess(
      'Email Sent',
      'Further instructions have been emailed to you. Please follow through with those to change your password.'
    );

    location.assign('/');
  } catch (response) {
    isLoading = false;

    // Extracting Error Information.
    const { errors } = response.response.data;

    if (errors?.email) Email.setError(errors.email);

    if (errors?.root) showError('Server', errors.root);
  }
};

// Event Listeners.
elem_Form.addEventListener('submit', handleSubmit);

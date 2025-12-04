'use strict';

// Local Imports.
import { Entry } from './components.js';

// Constructing Components.
const Email = new Entry('email');
const Password = new Entry('password');

// Variables.
let isLoading = false;

// DOM Selections.
const elem_Form = document.getElementById('form');

// Functions.

// Function to handle form submittion.
const handleSubmit = async function (event) {
  if (isLoading) return;

  event.preventDefault();

  // Form Validations.
  const isEmailValid = Email.validate((value) => {
    if (value.trim() === '') return 'Email is required.';

    if (!validator.isEmail(value)) return 'Email is not valid.';

    return true;
  });

  if (!isEmailValid) return;

  const isPasswordValid = Password.validate((value) => {
    if (value === '') return 'Password is required';

    return true;
  });

  if (!isPasswordValid) return;

  // Form Submittion.
  try {
    isLoading = true;

    await axios.post('/account/login', {
      email: Email.getValue(),
      password: Password.getValue(),
    });

    location.assign('/chat');
  } catch (response) {
    isLoading = false;

    // Extracting Error Information.
    const { errors } = response.response.data;

    if (errors?.email) Email.setError(errors.email);
    if (errors?.password) Password.setError(errors.password);

    if (errors?.root) showError('Server', errors.root);
  }
};

// Event Listeners.
elem_Form.addEventListener('submit', handleSubmit);

'use strict';

// Local Imports.
import { Entry, Checkbox } from './components.js';

// Constructing Components.
const Email = new Entry('email');
const DisplayName = new Entry('displayName');
const Password = new Entry('password');
const ConfirmPassword = new Entry('confirmPassword');
const Terms = new Checkbox('terms');
const Policies = new Checkbox('policies');

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

  const isDisplayNameValid = DisplayName.validate((value) => {
    if (value.trim() === '') return 'Display Name is required.';

    if (value.trim().length < 3) return 'Display Name cannot be of less than 3 characters.';

    if (value.trim().length > 16) return 'Display Name cannot be of more than 16 characters.';

    return true;
  });

  if (!isDisplayNameValid) return;

  const isPasswordValid = Password.validate((value) => {
    if (value === '') return 'Password is required';

    if (!validator.isStrongPassword(value))
      return 'Password must be 8 characters long with a lowercase, an uppercase, a number and a symbol characters.';

    return true;
  });

  if (!isPasswordValid) return;

  const isConfirmPasswordValid = ConfirmPassword.validate((value) => {
    if (value === '') return 'Confirm Password is required';

    if (value !== Password.getValue()) return 'Passwords do not match';

    return true;
  });

  if (!isConfirmPasswordValid) return;

  const isTermsValid = Terms.validate((value) => {
    if (!value) return 'You must accept our Terms and Conditions';

    return true;
  });

  if (!isTermsValid) return;

  const isPoliciesValid = Policies.validate((value) => {
    if (!value) return 'You must accept our Privacy Policy';

    return true;
  });

  if (!isPoliciesValid) return;

  // Form Submittion.
  try {
    isLoading = true;

    await axios.post('/account/create', {
      email: Email.getValue(),
      displayName: DisplayName.getValue(),
      password: Password.getValue(),
    });

    location.assign('/login');
  } catch (response) {
    isLoading = false;

    // Extracting Error Information.
    const { errors } = response.response.data;

    if (errors?.email) Email.setError(errors.email);
    if (errors?.displayName) DisplayName.setError(errors.displayName);
    if (errors?.password) Password.setError(errors.password);

    if (errors?.root) showError('Server', errors.root);
  }
};

// Event Listeners.
elem_Form.addEventListener('submit', handleSubmit);

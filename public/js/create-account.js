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

// DOM Selections.
const elem_Form = document.getElementById('form');

const handleSubmit = async function (event) {
  event.preventDefault();

  // Form Validations.
  const isEmailValid = Email.validate((value) => {
    if (value === '') return 'Email is required';

    if (!validator.isEmail(value)) return 'Email is not valid';

    return true;
  });

  if (!isEmailValid) return;

  const isDisplayNameValid = DisplayName.validate((value) => {
    if (value === '') return 'Display Name is required';

    if (value.length > 16) return 'Display Name cannot exceed 16 characters';

    return true;
  });

  if (!isDisplayNameValid) return;

  const isPasswordValid = Password.validate((value) => {
    if (value === '') return 'Password is required';

    if (!validator.isStrongPassword(value)) return 'Password is not strong enough';

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
    console.log({
      email: Email.getValue(),
      displayName: DisplayName.getValue(),
      password: Password.getValue(),
    });
  } catch (error) {
    showError('Server', 'Something went wrong');
  }
};

// Event Listeners.
elem_Form.addEventListener('submit', handleSubmit);

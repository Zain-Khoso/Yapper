'use strict';

// Imports.
import {
  Email as EmailComp,
  Password as PasswordComp,
  ConfirmPassword as ConfirmPasswordComp,
} from './Entry.js';
import { Checkbox } from './Checkbox.js';

// Components.
const Email = new EmailComp('email');
const Password = new PasswordComp('password');
const ConfirmPassword = new ConfirmPasswordComp('confirmPassword');
const Terms = new Checkbox('terms');
const Policies = new Checkbox('policies');

// DOM Selections.
const elem_Form = document.getElementById('form');
const elem_BtnSubmit = document.getElementById('submit');
const elem_BtnCancel = document.getElementById('cancel');

// Functions.

// Function to handle form submit event.
const handleFormSubmition = async function (event) {
  // Preventing HTML form's default submit behaviour.
  event.preventDefault();

  if (Email.isInvalid()) return;
  if (Password.isInvalid()) return;
  if (ConfirmPassword.isInvalid(Password.getValue())) return;
  if (Terms.isInvalid()) return;
  if (Policies.isInvalid()) return;

  // Disabling the Form.
  Email.disable();
  Password.disable();
  ConfirmPassword.disable();
  Terms.disable();
  Policies.disable();
  elem_BtnSubmit.disabled = true;
  elem_BtnCancel.disabled = true;

  try {
    await axios.post('/create-account', { email: Email.getValue(), password: Password.getValue() });

    await showSuccess('Account Created', ``);

    // location.assign('/');
  } catch (error) {
    // Enabling the Form.
    Email.enable();
    Password.enable();
    ConfirmPassword.enable();
    elem_BtnSubmit.disable = false;
    elem_BtnCancel.disable = false;

    // Extracting Error Information.
    const { errors } = error.response.data;

    if (errors?.email) Email.setError(errors.email);
    if (errors?.password) Password.setError(errors.password);
  }
};

// Event Handlers.
elem_Form.addEventListener('submit', handleFormSubmition);

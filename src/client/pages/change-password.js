'use strict';

// Styles.
import '../css/utils/index.css';
import '../css/utils/auth.css';
import '../css/components/navbar.css';
import '../css/components/svg.css';
import '../css/components/button.css';

// Local Scripts.
import '../js/theme';
import '../js/user';
import {
  schema_Email,
  schema_OTP,
  schema_Password,
  schema_ConfirmPassword,
} from '../../utils/validations';
import { API, showError, startCooldown } from '../js/utils';

// Components.
import SteppedForm from '../js/SteppedForm';
import { Entry, ConfirmPassword as ConfirmPasswordObj, Checkbox } from '../js/Inputs';

// Constants.
const Form = new SteppedForm('change-password');
const Email = new Entry('email', schema_Email, Form);
const OTP = new Entry('otp', schema_OTP, Form);
const Password = new Entry('password', schema_Password, Form);
const ConfirmPassword = new ConfirmPasswordObj(
  'confirmPassword',
  schema_ConfirmPassword,
  Password,
  Form
);

// Form Configuration.
const formOptions = [
  {
    title: 'Enter your email',
    subtitle: "We'll use your email to send a one-time verification code.",
    fields: [Email],
    async handleSubmit() {
      try {
        await API.put('account/change/password', { email: Email.getValue() });

        startCooldown(Form?.elem_ResendCode);
        return true;
      } catch (error) {
        if (error.isAxiosError) {
          const {
            response: {
              data: { errors },
            },
          } = error;

          if (errors?.email) Email.setError(errors.email);
          if (errors?.root) new showError('Server Error', errors.root);

          if (!Object.keys(errors ?? {}).length) new showError('Something went wrong.');
        } else new showError('Something went wrong.');

        return false;
      }
    },
  },
  {
    title: 'Verify your identity',
    subtitle: "We've sent a one-time code to your current email address.",
    fields: [OTP],
    async handleSubmit() {
      try {
        await API.post('/account/change/password', {
          email: Email.getValue(),
          otp: OTP.getValue(),
        });

        return true;
      } catch (error) {
        if (error.isAxiosError) {
          const {
            response: {
              data: { errors },
            },
          } = error;

          if (errors?.email) Email.setError(errors.email);
          if (errors?.otp) OTP.setError(errors.otp);
          if (errors?.root) new showError('Server Error', errors.root);

          if (Object.keys(errors ?? {}).length === 0) new showError('Something went wrong.');
        } else new showError('Something went wrong.');

        return false;
      }
    },
  },
  {
    title: 'Set a new password',
    subtitle: 'Choose a strong password to keep your account secure.',
    fields: [Password, ConfirmPassword],
    async handleSubmit() {
      try {
        await API.patch('/account/change/password', {
          email: Email.getValue(),
          password: Password.getValue(),
        });

        location.assign('/login');
      } catch (error) {
        if (error.isAxiosError) {
          const {
            response: {
              data: { errors },
            },
          } = error;

          if (errors?.email) Email.setError(errors.email);
          if (errors?.password) Password.setError(errors.password);
          if (errors?.root) new showError('Server Error', errors.root);

          if (Object.keys(errors ?? {}).length === 0) new showError('Something went wrong.');
        } else new showError('Something went wrong.');

        return false;
      }
    },
  },
];

Form.setSteps(formOptions);

Form.elem_ResendCode?.addEventListener('click', async ({ target }) => {
  try {
    await API.put('/account/change/password', { email: Email.getValue() });

    startCooldown(target);
  } catch (error) {
    if (error.isAxiosError) {
      const {
        response: {
          data: { errors },
        },
      } = error;

      if (errors?.email) Email.setError(errors.email);
      if (errors?.root) new showError('Server Error', errors.root);

      if (!Object.keys(errors ?? {}).length) new showError('Something went wrong.');
    } else new showError('Something went wrong.');

    return false;
  }
});

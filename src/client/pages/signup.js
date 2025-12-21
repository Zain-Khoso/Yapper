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
  schema_PictureFile,
  schema_DisplayName,
  schema_Password,
  schema_ConfirmPassword,
  schema_Checkbox,
} from '../../utils/validations';
import { API, showError } from '../js/utils';

// Components.
import SteppedForm from '../js/SteppedForm';
import { Entry, ConfirmPassword as ConfirmPasswordObj, Checkbox } from '../js/Inputs';

// Constants.
const Form = new SteppedForm('signup-steps');
const Email = new Entry('email', schema_Email, Form);
const OTP = new Entry('otp', schema_OTP, Form);
const DisplayName = new Entry('displayName', schema_DisplayName, Form);
const Password = new Entry('password', schema_Password, Form);
const ConfirmPassword = new ConfirmPasswordObj(
  'confirmPassword',
  schema_ConfirmPassword,
  Password,
  Form
);
const TAC = new Checkbox('checkbox-tac', schema_Checkbox, Form);
const PP = new Checkbox('checkbox-pp', schema_Checkbox, Form);

// Form Configuration.
const formOptions = [
  {
    title: 'Enter your email',
    subtitle: "We'll use your email to create your account and send a one-time verification code.",
    fields: [Email],
    async handleSubmit() {
      try {
        await API.put('/account/register', { email: Email.getValue() });

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
    title: 'Enter the verification code',
    subtitle: "We've sent a 6-digit code to your email. Enter it below to confirm it's really you.",
    fields: [OTP],
    async handleSubmit() {
      try {
        await API.patch('/account/register/verify', {
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
    title: 'Set up your profile',
    subtitle: "Choose how you'll appear to others on Yapper.",
    fields: [DisplayName, Password, ConfirmPassword, TAC, PP],
    async handleSubmit() {
      try {
        await API.post('/account/create', {
          email: Email.getValue(),
          displayName: DisplayName.getValue(),
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
          if (errors?.picture) Picture.setError(errors.picture);
          if (errors?.displayName) DisplayName.setError(errors.displayName);
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

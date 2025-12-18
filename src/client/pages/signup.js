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

// Components.
import Form from '../js/SteppedForm';
import {
  Entry,
  ProfilePicture,
  ConfirmPassword as ConfirmPasswordObj,
  Checkbox,
} from '../js/Inputs';

// Constants.
const Email = new Entry('email', schema_Email);
const OTP = new Entry('otp', schema_OTP);
const Picture = new ProfilePicture('file-pfp', schema_PictureFile);
const DisplayName = new Entry('displayName', schema_DisplayName);
const Password = new Entry('password', schema_Password);
const ConfirmPassword = new ConfirmPasswordObj('confirmPassword', schema_ConfirmPassword, Password);
const TAC = new Checkbox('checkbox-tac', schema_Checkbox);
const PP = new Checkbox('checkbox-pp', schema_Checkbox);

// Form Configs.
const formOptions = [
  {
    title: 'Enter your email',
    subtitle: "We'll use your email to create your account and send a one-time verification code.",
    fields: [Email],
    async handleSubmit() {
      try {
        console.log('Email: ', Email.getValue());

        await new Promise((res) => setTimeout(res, 500));
        return true;
      } catch {
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
        console.log('OTP: ', OTP.getValue());

        await new Promise((res) => setTimeout(res, 500));
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    title: 'Set up your profile',
    subtitle: "Choose how you'll appear to others on Yapper.",
    fields: [Picture, DisplayName, Password, ConfirmPassword, TAC, PP],
    async handleSubmit() {
      try {
        console.log('Picture: ', Picture.getValue());
        console.log('DisplayName: ', DisplayName.getValue());
        console.log('Password: ', Password.getValue());
        console.log('ConfirmPassword: ', ConfirmPassword.getValue());

        await new Promise((res) => setTimeout(res, 500));

        return true;
      } catch {
        return false;
      }
    },
  },
];

new Form('signup-steps', formOptions);

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
import { schema_Email, schema_OTP } from '../../utils/validations';
import { API, showError, startCooldown } from '../js/utils';

// Components.
import SteppedForm from '../js/SteppedForm';
import { Entry } from '../js/Inputs';

// Constants.
const Form = new SteppedForm('change-email');
const Email = new Entry('email', schema_Email, Form);
const OTP = new Entry('otp', schema_OTP, Form);

// Form Configuration.
const formOptions = [
  {
    title: 'Enter your email',
    subtitle: "We'll send a verification code to your new email address to confirm the change.",
    fields: [Email],
    async handleSubmit() {
      try {
        await API.post('/account/change/email', { email: Email.getValue() });

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
    title: 'Verify your new email',
    subtitle: 'Enter the one-time code sent to your new email address.',
    fields: [OTP],
    async handleSubmit() {
      try {
        await API.patch('/account/change/email', { otp: OTP.getValue() });

        location.assign('/login');
      } catch (error) {
        if (error.isAxiosError) {
          const {
            response: {
              data: { errors },
            },
          } = error;

          if (errors?.otp) OTP.setError(errors.otp);
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
    await API.post('/account/change/email', { email: Email.getValue() });

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

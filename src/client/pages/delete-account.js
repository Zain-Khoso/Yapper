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
import { schema_OTP } from '../../utils/validations';
import { API, showError, startCooldown } from '../js/utils';

// Components.
import SteppedForm from '../js/SteppedForm';
import { Entry } from '../js/Inputs';

// Constants.
const Form = new SteppedForm('delete-account');
const OTP = new Entry('otp', schema_OTP, Form);

// Form Configuration.
const formOptions = [
  {
    title: 'Delete your account',
    subtitle:
      'This will permanently remove your profile (not messages). This action cannot be undone.',
    fields: [OTP],
    async handleSubmit() {
      try {
        await API.delete('/account/delete', { data: { otp: OTP.getValue() } });

        location.assign('/');
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

// startCooldown(Form.elem_ResendCode);
Form.elem_ResendCode?.addEventListener('click', async ({ target }) => {
  try {
    await API.get('/account/delete', { email: window.currentUser.get('email') });

    startCooldown(target);
  } catch (error) {
    if (error.isAxiosError) {
      const {
        response: {
          data: { errors },
        },
      } = error;

      if (errors?.root) new showError('Server Error', errors.root);

      if (!Object.keys(errors ?? {}).length) new showError('Something went wrong.');
    } else new showError('Something went wrong.');

    return false;
  }
});

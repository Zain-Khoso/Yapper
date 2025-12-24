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
import { schema_Email, schema_String } from '../../utils/validations';
import { API, showError } from '../js/utils';

// Components.
import SteppedForm from '../js/SteppedForm';
import { Entry } from '../js/Inputs';

// Constants.
const Form = new SteppedForm('login-form');
const Email = new Entry('email', schema_Email, Form);
const Password = new Entry('password', schema_String, Form);

// Form Configuration.
const formOptions = [
  {
    title: 'Welcome back',
    subtitle: 'Sign in to continue your conversations on Yapper.',
    fields: [Email, Password],
    async handleSubmit() {
      try {
        await API.patch('/auth/login', { email: Email.getValue(), password: Password.getValue() });

        location.assign('/chat');
      } catch (error) {
        if (error.isAxiosError) {
          const {
            response: {
              status,
              data: { errors },
            },
          } = error;

          if (status === 409) {
            Email.setError('Invalid Credential');
            Password.setError('Invalid Credential');
          } else new showError('Server Error', errors.root);

          if (!Object.keys(errors ?? {}).length) new showError('Something went wrong.');
        } else new showError('Something went wrong.');

        return false;
      }
    },
  },
];

Form.setSteps(formOptions);

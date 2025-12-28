'use strict';

// Page Styles.
import '../css/utils/index.css';
import '../css/components/button.css';

// Page Scripts.
import '../js/theme';
import { loadCurrentUser } from '../js/user';
import { showSuccess } from '../js/utils';

loadCurrentUser(async function () {
  if (!window?.currentUser) return location.assign('/login');

  await showSuccess.fire({
    title: 'Payment Successful!',
    text: 'Thank you for supporting Yapper! Your account has been updated, and you can now enjoy your new features.',
    confirmButtonText: 'Back to Yapper',
    allowOutsideClick: false,
    allowEscapeKey: false,
  });

  location.assign('/chat');
});

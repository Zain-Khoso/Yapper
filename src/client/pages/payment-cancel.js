'use strict';

// Page Styles.
import '../css/utils/index.css';
import '../css/components/button.css';

// Page Scripts.
import '../js/theme';
import { loadCurrentUser } from '../js/user';
import { showError } from '../js/utils';

loadCurrentUser(async function () {
  if (!window?.currentUser) return location.assign('/login');

  await showError.fire({
    title: 'Payment Cancelled',
    text: "The checkout process was cancelled. No charges were made to your account. You can try again whenever you're ready.",
    confirmButtonText: 'Go Home',
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      confirmButton: 'btn primary',
    },
  });

  location.assign('/');
});

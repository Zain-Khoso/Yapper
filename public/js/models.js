'use strict';

const query = new URLSearchParams(location.search);

if (query.get('model') === 'confirmEmail') {
  Swal.fire({
    icon: 'info',
    title: 'Confirm Email',
    text: 'Your account has been created successfully. But bare in mind that you must confirm your email address through the email sent to your inbox. (Double-Check in your spam folder)',
    confirmButtonColor: 'var(--color-success)',
    theme: 'auto',
  }).then(() => {
    query.delete('model');
    location.search = query.toString();
  });
}

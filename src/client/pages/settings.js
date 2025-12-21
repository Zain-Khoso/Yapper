'use strict';

// Page Styles.
import '../css/utils/index.css';
import '../css/utils/app.css';
import '../css/components/svg.css';
import '../css/components/button.css';
import '../css/components/dropdown.css';
import '../css/settings.css';

// Page Scripts.
import { getTheme } from '../js/theme';
import { loadCurrentUser } from '../js/user';
import { API, Swal, showError, showSuccess } from '../js/utils';
import { getZodError, schema_DisplayName } from '../../utils/validations';

// Object to handle the functionality of the entire page.
class App {
  constructor() {
    // Theme
    this.elem_Theme = document.getElementById('setting-theme');
    this.elem_ThemeValue = this.elem_Theme.querySelector('.setting-value');
    this.elem_ThemeButton = this.elem_Theme.querySelector('button');

    // Email
    this.elem_Email = document.getElementById('setting-email');
    this.elem_EmailValue = this.elem_Email.querySelector('.setting-value');

    // DisplayName
    this.elem_DisplayName = document.getElementById('setting-displayName');
    this.elem_DisplayNameValue = this.elem_DisplayName.querySelector('.setting-value');
    this.elem_DisplayNameButton = this.elem_DisplayName.querySelector('button');

    // Logout
    this.elem_Logout = document.getElementById('setting-logout');
    this.elem_LogoutButton = this.elem_Logout.querySelector('button');

    // Delete
    this.elem_Delete = document.getElementById('setting-delete');
    this.elem_DeleteButton = this.elem_Delete.querySelector('button');

    loadCurrentUser(() => this.loadUserState());

    // Event Listeners.
    this.elem_ThemeButton.addEventListener('click', () => this.setTheme(this.getNextTheme()));
    this.elem_DisplayNameButton.addEventListener('click', () => this.handleDisplayNameChange());
    this.elem_LogoutButton.addEventListener('click', () => this.handleLogout());
    this.elem_DeleteButton.addEventListener('click', () => this.handleDelete());
  }

  getNextTheme() {
    const currentTheme = getTheme();

    if (currentTheme === 'light') return 'dark';
    else return 'light';
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.elem_ThemeValue.textContent = theme.at(0).toUpperCase() + theme.slice(1);
  }

  async loadUserState() {
    this.elem_EmailValue.textContent = window.currentUser.get('email');
    this.elem_DisplayNameValue.textContent = window.currentUser.get('displayName');
  }

  async handleDisplayNameChange() {
    const confirmation = await Swal.fire({
      icon: 'question',
      iconColor: 'var(--color-foreground)',
      title: 'Change Name',
      text: 'Please enter your desired new name then click confirm, to confirm the change.',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      input: 'text',
      inputLabel: 'New Name',
      inputPlaceholder: window.currentUser.get('displayName'),
      inputValidator: (value) => {
        const result = schema_DisplayName.safeParse(value);
        if (!result.success) return getZodError(result);
      },
    });

    if (!confirmation.isConfirmed) return;

    try {
      await API.patch('/account/update', { displayName: confirmation.value, picture: null });

      await new showSuccess(
        'Name Changed',
        `Your name has been changed from ${window.currentUser.get('displayName')} to ${confirmation.value}`
      );

      location.reload();
    } catch (error) {
      if (error.isAxiosError) {
        const {
          response: {
            data: { errors },
          },
        } = error;

        if (errors?.displayName) new showError('Error', errors.displayName);
        if (errors?.picture) new showError('Error', errors.picture);
        if (errors?.root) new showError('Server Error', errors.root);

        if (!Object.keys(errors ?? {}).length) new showError('Something went wrong.');
      } else new showError('Something went wrong.');
    }
  }

  async handleLogout() {
    const confirmation = await Swal.fire({
      icon: 'question',
      iconColor: 'var(--color-foreground)',
      title: 'Logout',
      text: 'Want to logout of this account?',
      showCancelButton: true,
      confirmButtonText: 'YES',
      cancelButtonText: 'NO',
    });

    if (!confirmation.isConfirmed) return;

    try {
      await API.get('/auth/logout');

      location.assign('/');
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
    }
  }

  async handleDelete() {
    const confirmation = await Swal.fire({
      icon: 'question',
      iconColor: 'var(--color-foreground)',
      title: 'Delete Account',
      showCancelButton: true,
      confirmButtonText: 'YES',
      cancelButtonText: 'NO',
      customClass: {
        confirmButton: 'btn danger',
        cancelButton: 'btn outline',
      },
    });

    if (!confirmation.isConfirmed) return;

    try {
      await API.get('/account/delete');

      location.assign('/delete-account');
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
    }
  }
}

new App();

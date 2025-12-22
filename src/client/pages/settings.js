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
import { getZodError, schema_DisplayName, schema_PictureFile } from '../../utils/validations';
import axios from 'axios';

// Object to handle the functionality of the entire page.
class App {
  constructor() {
    // Theme
    this.elem_Theme = document.getElementById('setting-theme');
    this.elem_ThemeValue = this.elem_Theme.querySelector('.setting-value');
    this.elem_ThemeButton = this.elem_Theme.querySelector('button');

    // Picture
    this.elem_Picture = document.getElementById('setting-picture');
    this.elem_PictureInput = this.elem_Picture.querySelector('#file-pfp');
    this.elem_PicturePlaceholder = this.elem_Picture.querySelector('.placeholder');
    this.elem_PicturePreview = this.elem_Picture.querySelector('.preview');
    this.elem_PictureButton = this.elem_Picture.querySelector('button');

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
    this.elem_PictureInput.addEventListener('change', ({ target }) =>
      this.handleImageChange(target?.files)
    );
    this.elem_PictureButton.addEventListener('click', () => this.handlePictureButtonClick());
    this.elem_DisplayNameButton.addEventListener('click', () => this.handleDisplayNameChange());
    this.elem_LogoutButton.addEventListener('click', () => this.handleLogout());
    this.elem_DeleteButton.addEventListener('click', () => this.handleDelete());
    this.elem_ThemeButton.addEventListener('click', () => this.setTheme(this.getNextTheme()));
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

  showPicturePreview() {
    this.elem_PicturePreview.classList.remove('hidden');
    this.elem_PicturePlaceholder.classList.add('hidden');
  }

  hidePicturePreview() {
    this.elem_PicturePreview.classList.add('hidden');
    this.elem_PicturePlaceholder.classList.remove('hidden');
  }

  resetPictureInput() {
    this.elem_Input.value = null;
  }

  async handlePictureButtonClick() {
    const currentPicture = window.currentUser.get('picture');

    const confirmation = await Swal.fire({
      title: 'Profile Picture',
      text: 'What would you like to do?',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: currentPicture,
      confirmButtonText: 'Upload New',
      denyButtonText: 'Delete Current',
      customClass: {
        confirmButton: 'btn primary',
        denyButton: 'btn danger',
        cancelButton: 'btn outline',
      },
    });

    if (confirmation.isConfirmed) return this.elem_PictureInput.click();
    if (confirmation.isDenied) return this.deleteCurrentPicture();
  }

  async deleteCurrentPicture() {
    Swal.fire({
      title: 'Deleting...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await API.delete('/file/picture');

      await new showSuccess({ title: 'Deleted', timer: 2000, showConfirmButton: false });

      setTimeout(() => location.reload(), 100);
    } catch (error) {
      Swal.close();
      new showError('Error', 'Failed to delete picture.');
    }
  }

  async handleImageChange(files) {
    if (!files || files.length === 0) return this.setDefaultState();

    const file = files[0];
    const result = schema_PictureFile.safeParse(file);
    if (!result.success) return new showError('Error', getZodError(result));

    const localImageURL = URL.createObjectURL(file);

    this.elem_PicturePreview.setAttribute('src', localImageURL);
    this.elem_PicturePreview.setAttribute(
      'alt',
      `${window.currentUser.get('displayName')}'s Photo`
    );
    this.showPicturePreview();

    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while we update your profile picture.',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const {
        data: {
          data: { signature, url },
        },
      } = await API.post('/file/picture', {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      await axios.put(signature, file, { headers: { 'Content-Type': file.type } });

      await API.patch('/account/update', {
        displayName: window.currentUser.get('displayName'),
        picture: url,
      });

      await new showSuccess({
        title: 'Success!',
        text: 'Profile Update Successful',
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => location.reload(), 100);
    } catch (error) {
      Swal.close();
      URL.revokeObjectURL(localImageURL);
      this.hidePicturePreview();
      this.resetPictureInput();

      if (error.isAxiosError) {
        const {
          response: {
            data: { errors },
          },
        } = error;

        if (errors?.picture) new showError('Picture Error', errors.picture);
        if (errors?.root) new showError('Server Error', errors.root);

        if (!Object.keys(errors ?? {}).length) new showError('Something went wrong.');
      } else new showError('Something went wrong.');
    }
  }

  async loadUserState() {
    const picture = window.currentUser.get('picture');
    const email = window.currentUser.get('email');
    const displayName = window.currentUser.get('displayName');

    this.elem_PicturePreview.setAttribute('src', picture);
    this.elem_PicturePreview.setAttribute('alt', `${displayName}'s Photo`);
    this.elem_EmailValue.textContent = email;
    this.elem_DisplayNameValue.textContent = displayName;

    if (picture) this.showPicturePreview();
    else this.hidePicturePreview();
  }

  async handleDisplayNameChange() {
    await Swal.fire({
      icon: 'question',
      iconColor: 'var(--color-foreground)',
      title: 'Change Name',
      text: 'Please enter your desired new name then click confirm, to confirm the change.',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      input: 'text',
      inputLabel: 'New Name',
      inputPlaceholder: window.currentUser.get('displayName'),
      inputValidator: (value) => {
        const result = schema_DisplayName.safeParse(value);
        if (!result.success) return getZodError(result);
      },
      preConfirm: async function (newName) {
        try {
          Swal.disableInput();
          Swal.disableButtons();

          await API.patch('/account/update', { displayName: newName, picture: null });

          await new showSuccess(
            'Name Changed',
            `Your name has been changed from ${window.currentUser.get('displayName')} to ${newName}`
          );

          location.reload();
        } catch (error) {
          Swal.enableInput();
          Swal.enableButtons();

          if (error.isAxiosError) {
            const {
              response: {
                data: { errors },
              },
            } = error;

            if (errors?.displayName) Swal.showValidationMessage('Error', errors.displayName);
            if (errors?.picture) Swal.showValidationMessage('Error', errors.picture);
            if (errors?.root) Swal.showValidationMessage('Server Error', errors.root);

            if (!Object.keys(errors ?? {}).length)
              Swal.showValidationMessage('Something went wrong.');
          } else Swal.showValidationMessage('Something went wrong.');
        }
      },
    });
  }

  async handleLogout() {
    await Swal.fire({
      icon: 'question',
      iconColor: 'var(--color-foreground)',
      title: 'Logout',
      text: 'Want to logout of this account?',
      showCancelButton: true,
      confirmButtonText: 'YES',
      cancelButtonText: 'NO',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      preConfirm: async function () {
        try {
          Swal.disableInput();
          Swal.disableButtons();

          await API.get('/auth/logout');

          location.assign('/');
        } catch (error) {
          Swal.enableInput();
          Swal.enableButtons();

          if (error.isAxiosError) {
            const {
              response: {
                data: { errors },
              },
            } = error;

            if (errors?.root) Swal.showValidationMessage('Server Error', errors.root);

            if (!Object.keys(errors ?? {}).length)
              Swal.showValidationMessage('Something went wrong.');
          } else Swal.showValidationMessage('Something went wrong.');
        }
      },
    });
  }

  async handleDelete() {
    await Swal.fire({
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
      preConfirm: async function () {
        try {
          Swal.disableInput();
          Swal.disableButtons();

          await API.get('/account/delete');

          location.assign('/delete-account');
        } catch (error) {
          Swal.enableInput();
          Swal.enableButtons();

          if (error.isAxiosError) {
            const {
              response: {
                data: { errors },
              },
            } = error;

            if (errors?.root) Swal.showValidationMessage('Server Error', errors.root);

            if (!Object.keys(errors ?? {}).length)
              Swal.showValidationMessage('Something went wrong.');
          } else Swal.showValidationMessage('Something went wrong.');
        }
      },
    });
  }
}

new App();

// This class handles all the entry.pug component's functionality.
export class Entry {
  constructor(id) {
    // DOM Selections.
    this.elem_Input = document.getElementById(id);
    this.elem_Entry = this.elem_Input.closest('.entry');
    this.elem_Label = this.elem_Entry.querySelector('label.label');
    this.elem_Error = this.elem_Entry.querySelector('label.error-text');

    // Object Data.
    this.errorText = '';

    // Default Event Listeners.
    this.elem_Input.addEventListener('input', () => {
      if (this.elem_Entry.classList.contains('error')) this.removeError();
    });
  }

  hasError() {
    return this.errorText !== '';
  }

  getValue() {
    return this.elem_Input.value;
  }

  setError(message) {
    this.errorText = message;
    this.elem_Entry.classList.add('error');
    this.elem_Error.textContent = message;
  }

  removeError() {
    this.errorText = '';
    this.elem_Error.textContent = '';
    this.elem_Entry.classList.remove('error');
  }

  disable() {
    this.elem_Input.disabled = true;
  }

  enable() {
    this.elem_Input.disabled = false;
  }
}

// Class specifically for Email Entries.
export class Email extends Entry {
  constructor(id) {
    super(id);
  }

  isInvalid() {
    if (this.getValue().length === 0) {
      this.setError('Email is required.');

      return true;
    }

    if (!validator.isEmail(this.getValue())) {
      this.setError('The email you have provided is not valid.');

      return true;
    }

    this.removeError();

    return false;
  }
}

// Class specifically for Passowrd Entries.
export class Password extends Entry {
  constructor(id) {
    super(id);

    this.elem_PasswordToggle = this.elem_Entry.querySelector('.password-visibility-btn');

    this.elem_PasswordToggle.addEventListener('click', (event) => {
      event.preventDefault();

      if (this.elem_Input.type === 'password') this.elem_Input.type = 'text';
      else this.elem_Input.type = 'password';
    });
  }

  isInvalid() {
    if (this.getValue().length === 0) {
      this.setError('Password is required.');

      return true;
    }

    if (
      !validator.isStrongPassword(this.getValue(), {
        minLength: 8,
        minLowercase: 0,
        minUppercase: 0,
        minNumbers: 0,
        minSymbols: 0,
      })
    ) {
      this.setError('Password is cannot be shorter than 8 characters.');

      return true;
    }

    this.removeError();

    return false;
  }
}

// Class specifically for Confirm Passowrd Entry.
export class ConfirmPassword extends Password {
  constructor(id) {
    super(id);
  }

  isInvalid(password) {
    if (this.getValue().length === 0) {
      this.setError('Password is required.');

      return true;
    }

    if (this.getValue() !== password) {
      this.setError('Passwords do not match.');

      return true;
    }

    this.removeError();

    return false;
  }
}

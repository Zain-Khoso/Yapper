'use strict';

// Class for all of text inputs.
class Entry {
  constructor(id) {
    this.elem_Input = document.getElementById(id);
    this.elem_Entry = this.elem_Input.closest('.entry');
    this.elem_Label = this.elem_Entry.querySelector('label.label');
    this.elem_Error = this.elem_Entry.querySelector('#error-text');

    this.errorText = '';

    this.elem_Input.addEventListener('input', () => this.removeError());

    if (id === 'password' || id === 'confirmPassword') {
      this.elem_Entry
        .querySelector('.password-visibility-btn')
        .addEventListener('click', (event) => {
          event.preventDefault();

          if (this.elem_Input.type === 'password') this.elem_Input.type = 'text';
          else this.elem_Input.type = 'password';
        });
    }
  }

  getValue() {
    return this.elem_Input.value;
  }

  setValue(value) {
    this.elem_Input.value = value;
  }

  getError() {
    return this.errorText;
  }

  setError(text) {
    this.errorText = text;
    this.elem_Entry.classList.add('error');
    this.elem_Error.textContent = text;
  }

  removeError() {
    this.errorText = '';
    this.elem_Entry.classList.remove('error');
    this.elem_Error.textContent = '';
  }

  validate(check) {
    const validation = check(this.getValue());

    if (validation === true) return true;

    this.setError(validation);

    return false;
  }
}

// Class for checkboxes.
class Checkbox {
  constructor(id) {
    this.elem_Checkbox = document.getElementById(id);
    this.elem_Entry = this.elem_Checkbox.closest('.checkbox');
    this.elem_Label = this.elem_Entry.querySelector('label.label');
    this.elem_Error = this.elem_Entry.querySelector('.error-text');

    this.errorText = '';

    this.elem_Checkbox.addEventListener('change', () => this.removeError());
  }

  isChecked() {
    return this.elem_Checkbox.checked;
  }

  setChecked(checked) {
    this.elem_Checkbox.checked = checked;
  }

  getError() {
    return this.errorText;
  }

  setError(text) {
    this.errorText = text;
    this.elem_Entry.classList.add('error');
    this.elem_Error.textContent = text;
  }

  removeError() {
    this.errorText = '';
    this.elem_Entry.classList.remove('error');
    this.elem_Error.textContent = '';
  }

  validate(check) {
    const validation = check(this.isChecked());

    if (validation === true) return true;

    this.setError(validation);

    return false;
  }
}

export { Entry, Checkbox };

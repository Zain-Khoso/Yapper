'use strict';

// Styles.
import '../css/components/inputs.css';

// Local Imports.
import { showError } from './utils';
import { getZodError } from '../../utils/validations';

// Base Object of All Input Components.
export class Input {
  constructor(id, schema, form) {
    this.elem_Input = document.getElementById(id);

    if (!this.elem_Input) return console.error('Cannot find an Entry with the ID: ' + id);

    this.Form = form;
    this.schema = schema;
    this.errorText = '';
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
    this.Form.errors.set('email', text);
  }

  removeError() {
    this.errorText = '';
    this.elem_Entry.classList.remove('error');
    this.Form.errors.delete('email');
  }

  isValid() {
    const result = this.schema.safeParse(this.getValue());

    if (result.success) {
      this.removeError();
      return true;
    }

    this.setError(getZodError(result));

    return false;
  }
}

// Object to handle Profile Picture related UI behaviour.
export class ProfilePicture extends Input {
  constructor(id, schema, form) {
    super(id, schema, form);

    this.elem_Entry = this.elem_Input.closest('.picture-input');
    this.elem_Placeholder = this.elem_Entry.querySelector('.placeholder');
    this.elem_Preview = this.elem_Entry.querySelector('.preview');
    this.elem_Btn = this.elem_Entry.querySelector('.btn');

    this.elem_Input.addEventListener('change', (e) => this.handleImageChange(e.target.files));
  }

  setDefaultState() {
    this.removeError();
    this.hidePreview();
    this.elem_Btn.textContent = 'Upload Picture';
    this.elem_Input.value = null;
  }

  getValue() {
    return this.elem_Input.files[0];
  }

  setError(text) {
    super.setError(text);

    new showError('File Error', this.errorText);
  }

  removeError() {
    super.removeError();

    this.elem_Btn.textContent = 'Upload Image';
  }

  showPreview() {
    this.elem_Preview.classList.remove('hidden');
    this.elem_Placeholder.classList.add('hidden');
  }

  hidePreview() {
    this.elem_Preview.classList.add('hidden');
    this.elem_Placeholder.classList.remove('hidden');
  }

  handleImageChange(files) {
    if (files.length === 0) return this.setDefaultState();

    if (!this.isValid()) return;

    const fileReader = new FileReader();
    const newFile = files[0];

    fileReader.addEventListener('load', (event) => {
      const url = event.target.result;

      this.elem_Preview.setAttribute('src', url);
      this.showPreview();
      this.elem_Btn.textContent = 'Update Picture';
    });

    fileReader.readAsDataURL(newFile);
  }
}

// Object to handle all Entry (text input tags) related UI behaviour.
export class Entry extends Input {
  constructor(id, schema, form) {
    super(id, schema, form);

    this.elem_Entry = this.elem_Input.closest('.entry');
    this.elem_Error = this.elem_Entry.querySelector('.error-text');

    this.elem_Input.addEventListener('input', () => this.removeError());

    if (this.elem_Input.type === 'password') {
      this.elem_Entry.querySelector('.eye-btn').addEventListener('click', (event) => {
        event.preventDefault();

        if (this.elem_Input.type === 'password') this.elem_Input.type = 'text';
        else this.elem_Input.type = 'password';
      });
    }
  }

  setError(text) {
    super.setError(text);

    this.elem_Error.textContent = this.errorText;
  }

  removeError() {
    super.removeError();

    this.elem_Error.textContent = '';
  }
}

// Object to handle confirm password inputs related UI behaviour.
export class ConfirmPassword extends Entry {
  constructor(id, schema, Password, form) {
    super(id, schema, form);

    this.Password = Password;
  }

  isValid() {
    const result = this.schema.safeParse({
      password: this.Password.getValue(),
      confirmPassword: this.getValue(),
    });

    if (result.success) return true;

    this.setError(getZodError(result));

    return false;
  }
}

// Object to handle all checkbox inputs related UI behaviour.
export class Checkbox extends Entry {
  constructor(id, schema, form) {
    super(id, schema, form);
  }

  getValue() {
    return this.elem_Input.checked;
  }

  setValue(checked) {
    this.elem_Checkbox.checked = checked;
  }

  isValid() {
    const isValid = this.schema.parse(this.getValue());

    if (isValid) return true;

    this.setError('You must accept this.');

    return false;
  }
}

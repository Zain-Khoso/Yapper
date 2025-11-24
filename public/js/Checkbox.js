// This class handles all the checkbox component's functionality.
export class Checkbox {
  constructor(id) {
    // DOM Selections.
    this.elem_Input = document.getElementById(id);
    this.elem_Checkbox = this.elem_Input.closest('.checkbox');
    this.elem_Error = this.elem_Checkbox.querySelector('label.error-text');

    // Object Data.
    this.errorText = '';

    // Default Event Listeners.
    this.elem_Input.addEventListener('change', () => {
      if (this.elem_Checkbox.classList.contains('error')) this.removeError();
    });
  }

  isInvalid() {
    if (!this.elem_Input.checked) {
      this.setError('You have to accept this.');
      return true;
    }
  }

  setError(message) {
    this.errorText = message;
    this.elem_Checkbox.classList.add('error');
    this.elem_Error.textContent = message;
  }

  removeError() {
    this.errorText = '';
    this.elem_Checkbox.classList.remove('error');
    this.elem_Error.textContent = '';
  }

  disable() {
    this.elem_Input.disabled = true;
  }

  enable() {
    this.elem_Input.disabled = false;
  }
}

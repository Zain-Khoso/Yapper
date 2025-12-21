'use strict';

import { showError } from './utils';

export default class Form {
  constructor(containerId) {
    this.elem_Container = document.getElementById(containerId);

    if (!this.elem_Container)
      return console.error('Cannot find a Stepped Form with ID: ' + containerId);

    this.elem_LineSteps = this.elem_Container.querySelector('.line-steps');
    this.elem_Title = this.elem_Container.querySelector('.heading h2');
    this.elem_Subtitle = this.elem_Container.querySelector('.heading p');
    this.elem_Forms = this.elem_Container.querySelectorAll('.form');
    this.elem_BackButtons = this.elem_Container.querySelectorAll('.btn.back');
    this.elem_ResendCode = this.elem_Container.querySelector('#resend-code');

    this.activeStep = 0;
    this.steps = [];
    this.isLoading = false;
    this.errors = new Map();
  }

  setSteps(steps) {
    this.steps = steps;

    this.addLineSteps();
    this.changeForm();

    this.elem_Forms.forEach((elem) =>
      elem.addEventListener('submit', (event) => {
        event.preventDefault();

        if (this.errors.size === 0) this.nextStep();
        else {
          const firstError = this.errors.entries().next().value;
          new showError(firstError[1]);
        }
      })
    );

    this.elem_BackButtons.forEach((elem) => elem.addEventListener('click', () => this.prevStep()));
  }

  addLineSteps() {
    if (this.elem_Forms.length < 2) return this.elem_LineSteps.remove();

    Array.from(this.elem_Forms).forEach(() => {
      const elem_LineStep = document.createElement('li');
      elem_LineStep.classList.add('line-step');

      this.elem_LineSteps.appendChild(elem_LineStep);
    });
  }

  getActiveStep() {
    return this.steps.at(this.activeStep);
  }

  async nextStep() {
    // Getting data of the currently active step.
    const activeStep = this.getActiveStep();

    // Validating the current step's fields.
    const isStepValid = activeStep.fields.every((field) => field.isValid());
    if (!isStepValid) return;

    this.setLoading(true);

    try {
      const isSubmitted = await activeStep.handleSubmit();

      if (!isSubmitted || this.activeStep + 1 === this.elem_Forms.length) return;

      this.activeStep += 1;
      this.changeForm();
    } catch (error) {
      console.error(error);
    } finally {
      this.setLoading(false);
    }
  }

  prevStep() {
    if (this.activeStep - 1 < 0) return;
    this.activeStep -= 1;
    this.changeForm();
  }

  changeForm() {
    Array.from(this.elem_LineSteps.children).forEach((elem, index) =>
      elem.classList.toggle('active', index <= this.activeStep)
    );

    const step = this.getActiveStep();
    this.elem_Title.textContent = step.title;
    this.elem_Subtitle.textContent = step.subtitle;

    Array.from(this.elem_Forms).forEach((elem, index) =>
      elem.classList.toggle('hidden', index !== this.activeStep)
    );
  }

  disabled() {
    this.elem_Container
      .querySelectorAll('input, button')
      .forEach((elem) => elem.setAttribute('disabled', 'true'));
  }

  enabled() {
    this.elem_Container
      .querySelectorAll('input, button')
      .forEach((elem) => elem.removeAttribute('disabled'));
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
    this.elem_Container.classList.toggle('loading', isLoading);

    if (isLoading) this.disabled();
    else this.enabled();
  }
}

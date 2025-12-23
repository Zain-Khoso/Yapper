// Local Imports.
import { API, showSuccess, Swal } from './utils';
import { getZodError, schema_Email } from '../../utils/validations';

export default class App {
  constructor() {
    // DOM Selections.
    this.elem_AppControls = document.getElementById('app-controls');
    this.elem_BtnAddChat = document.getElementById('btn-add-chat');
    this.elem_ChatsList = document.getElementById('chats-list');
    const elem_Observed = this.elem_ChatsList.querySelector('.observed');

    this.elem_App = document.getElementById('app');
    this.elem_AppEmpty = document.getElementById('app-empty');

    // App State.
    this.rooms = new Map();
    this.activeRoomId = '';

    // Observer Configuration.
    const handleIntersection = ([entry]) => {
      if (!entry || !entry.isIntersecting) return;

      console.log('Fetch Chats: ');
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: this.elem_ChatsList,
      rootMargin: '200px',
    });

    observer.observe(elem_Observed);

    // Event Listeners.
    this.elem_BtnAddChat.addEventListener('click', () => this.createRoom());
  }

  async createRoom() {
    await Swal.fire({
      icon: 'question',
      iconColor: 'var(--color-foreground)',
      title: 'Add a Friend',
      text: "Enter your firend's email address to start chatting.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      input: 'text',
      inputLabel: 'Email Address',
      inputPlaceholder: 'johndoe@example.com',
      inputAttributes: {
        autocomplete: 'off',
      },
      inputValidator: (value) => {
        const result = schema_Email.safeParse(value);
        if (!result.success) return getZodError(result);
      },
      preConfirm: async function (receiverEmail) {
        try {
          Swal.disableInput();
          Swal.disableButtons();

          const {
            data: { data: room },
          } = await API.post('/room/add', { receiverEmail });

          if (room.exists) {
            return await new showSuccess({
              title: 'Friend Already Exists',
              timer: 1500,
              showConfirmButton: false,
            });
          }

          await new showSuccess({ title: 'New Friend Added', timer: 1500 });

          console.log(room);
        } catch (error) {
          Swal.enableInput();
          Swal.enableButtons();

          if (error.isAxiosError) {
            const {
              response: {
                data: { errors },
              },
            } = error;

            if (errors?.receiverEmail) Swal.showValidationMessage(errors.receiverEmail);
            if (errors?.root) Swal.showValidationMessage(errors.root);

            if (!Object.keys(errors ?? {}).length)
              Swal.showValidationMessage('Something went wrong.');
          } else Swal.showValidationMessage('Something went wrong.');
        }
      },
    });
  }
}

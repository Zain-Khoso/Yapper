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
    this.roomsOffset = 0;

    // Observer Configuration.
    const handleIntersection = ([entry]) => {
      if (!entry || !entry.isIntersecting) return;

      this.fetchRooms();
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: this.elem_ChatsList,
      rootMargin: '200px',
    });

    observer.observe(elem_Observed);

    // Event Listeners.
    this.elem_BtnAddChat.addEventListener('click', () => this.createRoom());
  }

  addRoom(room, mode = 'pagination') {
    if (this.rooms.has(room.id)) return;
    else this.rooms.set(room.id, room);

    const {
      id: roomId,
      receiver: { initial, picture, displayName, isOnline },
      lastSpoke,
      lastMessage,
      unreadCount,
    } = room;

    const roomHTML = `
      <li class="chat${unreadCount === 0 ? '' : ' unread'}" data-roomId=${roomId}>
        ${
          picture
            ? `
          <div class="avatar image">
            <img alt="${displayName}'s Image" src="${picture}" />

            <div class="status${isOnline ? ' active' : ''}">
              <div class="dot"></div>
            </div>
          </div>
          `
            : `
          <div class="avatar fallback"> 
            <span class="initial"> ${initial} </span>
            
            <div class="status${isOnline ? ' active' : ''}">
              <div class="dot"></div>
            </div>
          </div>
        `
        }
        
        <div class="user-content">
          <div class="title">
            <span class="bold"> ${displayName} </span>
            <span class="last-spoke"> ${lastSpoke} </span>
          </div>
          
          
          <div class="subtitle">
            <span class="last-message"> ${lastMessage} </span>
            <span class="new-message-count"> ${unreadCount > 99 ? '99+' : unreadCount} </span>
          </div>
        </div>
      </li>
    `;

    if (mode === 'pagination') {
      if (this.elem_ChatsList.children.length === 1) {
        this.elem_ChatsList.insertAdjacentHTML('afterbegin', roomHTML);
      } else {
        this.elem_ChatsList.children.item(-2).insertAdjacentHTML('afterend', roomHTML);
      }
    } else this.elem_ChatsList.insertAdjacentHTML('afterbegin', roomHTML);
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
      preConfirm: async (receiverEmail) => {
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

          new showSuccess({ title: 'New Friend Added', timer: 1500 });

          this.addRoom(room, 'new');
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

  async fetchRooms() {
    const {
      data: { data },
    } = await API.get(`/room/get-all/${this.roomsOffset}`);

    this.roomsOffset = data.offset;
    data.rooms.forEach((room) => this.addRoom(room));
  }
}

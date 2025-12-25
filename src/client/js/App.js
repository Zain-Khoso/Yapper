// Local Imports.
import { API, showError, showSuccess, Swal } from './utils';
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

    this.elem_HeaderAvatar = document.getElementById('header-avatar');
    this.elem_HeaderPicture = this.elem_HeaderAvatar.querySelector('img');
    this.elem_HeaderPictureFallback = this.elem_HeaderAvatar.querySelector('.initial');
    this.elem_HeaderOnlineStatus = this.elem_HeaderAvatar.querySelector('.status');
    this.elem_HeaderDisplayName = document.getElementById('header-displayName');
    this.elem_OpenNavButton = document.getElementById('btn-open-sidenav');

    this.elem_VoiceCallButton = document.getElementById('btn-call-voice');
    this.elem_VideoCallButton = document.getElementById('btn-call-video');
    this.elem_BlockChatButton = document.getElementById('btn-chat-block');
    this.elem_UnblockChatButton = document.getElementById('btn-chat-unblock');

    this.elem_MobileVoiceCallButton = document.getElementById('btn-mobile-call-voice');
    this.elem_MobileVideoCallButton = document.getElementById('btn-mobile-call-video');
    this.elem_MobileBlockChatButton = document.getElementById('btn-mobile-chat-block');
    this.elem_MobileUnblockChatButton = document.getElementById('btn-mobile-chat-unblock');

    this.elem_MessageForm = document.getElementById('message-form');
    this.elem_MessageFileInput = document.getElementById('message-file-input');
    this.elem_MessageFileInputLabel = this.elem_MessageFileInput.closest('.file-label');
    this.elem_MessageTextInput = document.getElementById('message-text-input');
    this.elem_MessageSendBtn = document.getElementById('message-send-btn');

    // App State.
    this.rooms = new Map();
    this.activeRoomId = '';
    this.roomsOffset = 0;
    this.isFetchingRooms = false;

    // Observer Configuration.
    const handleIntersection = ([entry]) => {
      if (!entry || !entry.isIntersecting || this.isFetchingRooms) return;

      this.fetchRooms();
    };

    this.observer = new IntersectionObserver(handleIntersection, {
      root: this.elem_ChatsList,
      rootMargin: '200px',
    });

    this.observer.observe(elem_Observed);

    // Event Listeners.
    this.elem_BtnAddChat.addEventListener('click', () => this.createRoom());
    this.elem_ChatsList.addEventListener('click', ({ target }) => this.toggleRoom(target));
    [this.elem_BlockChatButton, this.elem_MobileBlockChatButton].forEach((elem) => {
      elem.addEventListener('click', () => this.toggleRoomBlock('block'));
    });
    [this.elem_UnblockChatButton, this.elem_MobileUnblockChatButton].forEach((elem) => {
      elem.addEventListener('click', () => this.toggleRoomBlock('unblock'));
    });
    this.elem_OpenNavButton.addEventListener('click', () => this.toggleNavigation(false));
  }

  toggleAppUI(showUI) {
    this.elem_App.classList.toggle('hidden', !showUI);
    this.elem_AppEmpty.classList.toggle('hidden', showUI);
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
        <div class="avatar${picture ? '' : ' fallback'}">
          <img alt="${displayName}'s Image" src="${picture}" />

          <span class="initial"> ${initial} </span>

          <div class="status${isOnline ? ' active' : ''}">
            <div class="dot"></div>
          </div>
        </div>
        
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
        Array.from(this.elem_ChatsList.children).at(-1).insertAdjacentHTML('beforebegin', roomHTML);
      }
    } else {
      this.elem_ChatsList.insertAdjacentHTML('afterbegin', roomHTML);
      this.setActiveRoom(roomId);
      this.toggleAppUI(true);
    }
  }

  toggleRoom(target) {
    const elem_ChatOption = target.closest('.chat');
    if (!elem_ChatOption) return;

    this.setActiveRoom(elem_ChatOption.getAttribute('data-roomId'));
    this.toggleNavigation(true);
  }

  getActiveRoom() {
    return this.rooms.get(this.activeRoomId);
  }

  setActiveRoom(roomId) {
    if (roomId === this.activeRoomId) return;
    this.activeRoomId = roomId;

    this.loadActiveRoom();
    this.elem_MessageTextInput.focus();
  }

  updateChatHeader(initial, picture, displayName, isOnline) {
    this.elem_HeaderPicture.setAttribute('src', picture);
    this.elem_HeaderPictureFallback.textContent = initial;
    this.elem_HeaderAvatar.classList.toggle('fallback', !picture);

    this.elem_HeaderDisplayName.textContent = displayName;
    this.elem_HeaderOnlineStatus.classList.toggle('active', isOnline);
  }

  loadActiveRoom() {
    const activeRoom = this.getActiveRoom();

    this.elem_ChatsList.querySelectorAll('li.chat').forEach((elem) => {
      elem.classList.toggle('active', elem.getAttribute('data-roomId') === activeRoom.id);
    });

    const {
      receiver: { initial, picture, displayName, isOnline, isBlocked, isDeleted },
    } = activeRoom;

    // Updating Document Title.
    document.title = `Your chat with ${displayName} | Yapper`;

    // Update Header Copy.
    this.updateChatHeader(initial, picture, displayName, isOnline);

    // Showing/Hiding controls.
    this.elem_VoiceCallButton.classList.toggle('hidden', isDeleted || isBlocked);
    this.elem_VideoCallButton.classList.toggle('hidden', isDeleted || isBlocked);
    this.elem_MobileVoiceCallButton.classList.toggle('hidden', isDeleted || isBlocked);
    this.elem_MobileVideoCallButton.classList.toggle('hidden', isDeleted || isBlocked);

    this.elem_BlockChatButton.closest('.dropdown').classList.toggle('hidden', isDeleted);
    this.elem_MobileBlockChatButton.closest('.dropdown').classList.toggle('hidden', isDeleted);

    this.elem_BlockChatButton.classList.toggle('hidden', isDeleted || isBlocked);
    this.elem_MobileBlockChatButton.classList.toggle('hidden', isDeleted || isBlocked);
    this.elem_UnblockChatButton.classList.toggle('hidden', isDeleted || !isBlocked);
    this.elem_MobileUnblockChatButton.classList.toggle('hidden', isDeleted || !isBlocked);

    // Checking wether the form will should be disabled or not.
    const isFormDisabled = isBlocked || isDeleted || activeRoom.sender.isBlocked;

    // Resetting the Message Form's state.
    this.elem_MessageFileInput.value = null;
    this.elem_MessageTextInput.value = null;

    this.elem_MessageFileInputLabel.classList.toggle('hidden', isFormDisabled);
    this.elem_MessageSendBtn.classList.toggle('hidden', isFormDisabled);

    isFormDisabled
      ? this.elem_MessageTextInput.setAttribute('disabled', true)
      : this.elem_MessageTextInput.removeAttribute('disabled');

    this.elem_MessageTextInput.setAttribute(
      'placeholder',
      isDeleted
        ? 'Deleted User'
        : isBlocked
          ? 'You have blocked this user'
          : activeRoom.sender.isBlocked
            ? 'This user has blocked You'
            : 'Type your message...'
    );
  }

  toggleNavigation(close) {
    this.elem_AppControls.classList.toggle('hide', close);
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
            this.setActiveRoom(room.id);

            return new showSuccess({
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
    try {
      const {
        data: { data },
      } = await API.get(`/room/get-all/${this.roomsOffset}`);

      if (data.finished) this.observer.disconnect();

      this.roomsOffset = data.offset;
      data.rooms.forEach((room) => this.addRoom(room));

      this.toggleAppUI(this.rooms.size !== 0);

      if (data.offset === 25 && this.rooms.size !== 0) {
        this.setActiveRoom(this.rooms.entries().next().value[0]);
      }
    } catch (error) {
      console.log(error);
      new showError(
        'Something went wrong',
        'We were unable to fetch your Chats. Please try again letter.'
      );
    } finally {
      this.isFetchingRooms = false;
    }
  }

  async toggleRoomBlock(action) {
    let activeRoom = this.getActiveRoom();

    try {
      await API.patch(`/room/${action}`, {
        roomId: activeRoom.id,
        receiverId: activeRoom.receiver.id,
      });

      this.rooms.set(this.activeRoomId, {
        ...activeRoom,
        receiver: { ...activeRoom.receiver, isBlocked: action === 'block' ? true : false },
      });

      this.loadActiveRoom();
    } catch (response) {
      new showError('Error', response?.data?.errors?.root ?? 'Something went wrong');
    }
  }
}

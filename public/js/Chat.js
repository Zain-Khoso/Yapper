export class Chat {
  constructor() {
    // DOM Selections.
    this.elem_ChatInterface = document.getElementById('chatapp-ui');
    this.elem_EmptyInterface = document.getElementById('chatapp-empty-ui');

    this.elem_BtnAddChat = document.getElementById('btn-add-chat');
    this.elem_ChatsList = document.getElementById('chatslist');

    this.elem_ChatInterfaceUserInitial =
      this.elem_ChatInterface.querySelector('#chatapp-user-initial');
    this.elem_ChatInterfaceUserDisplayName = this.elem_ChatInterface.querySelector(
      '#chatapp-user-displayName'
    );
    this.elem_BtnCallVoice = document.getElementById('btn-call-voice');
    this.elem_BtnCallVideo = document.getElementById('btn-call-video');
    this.elem_BtnChatDelete = document.getElementById('btn-chat-delete');
    this.elem_BtnChatBlock = document.getElementById('btn-chat-block');
    this.elem_BtnChatUnblock = document.getElementById('btn-chat-unblock');

    this.elem_MessageList = this.elem_ChatInterface.querySelector('.messages');

    this.elem_MessageForm = document.getElementById('message-form');
    this.elem_MessageFileInput = document.getElementById('message-file-input');
    this.elem_MessageFileInputLabel = this.elem_MessageFileInput.closest('.file-label');
    this.elem_MessageTextInput = document.getElementById('message-text-input');
    this.elem_MessageSendBtn = document.getElementById('message-send-btn');

    // Values.
    this.rooms = new Map();
    this.activeRoomId = '';

    this.getChatrooms();
  }

  showChatInterface() {
    this.elem_ChatInterface.classList.remove('hidden');
    this.elem_EmptyInterface.classList.add('hidden');
  }

  showEmptyInterface() {
    this.elem_EmptyInterface.classList.remove('hidden');
    this.elem_ChatInterface.classList.add('hidden');
    document.querySelector('.content-wrapper').classList.add('close');
  }

  getActiveRoom() {
    return this.rooms.get(this.activeRoomId);
  }

  setActiveRoom(roomId) {
    if (roomId === this.activeRoomId) return;

    this.activeRoomId = roomId;
    const activeRoom = this.getActiveRoom();

    this.elem_ChatsList
      .querySelectorAll('li.chat')
      .forEach((elem) =>
        elem.classList.toggle('active', elem.getAttribute('data-roomId') === activeRoom.id)
      );

    this.elem_ChatInterfaceUserInitial.textContent = activeRoom.receiver.pfp;
    this.elem_ChatInterfaceUserDisplayName.textContent = activeRoom.receiver.displayName;
    this.elem_MessageList.innerHTML = '';
    this.addMessages(activeRoom.messages);

    this.updateBlockState();
  }

  async getChatrooms() {
    try {
      const { data: chatrooms } = await axios.get('/chat/room/all');

      this.addRooms(chatrooms);

      if (chatrooms.length > 0) this.showChatInterface();
      else this.showEmptyInterface();
    } catch (error) {
      if (error.errors) return showError('Server', error.errors.root);

      this.showEmptyInterface();
    }
  }

  addRooms(rooms) {
    rooms.forEach((room) => {
      this.rooms.set(room.id, room);

      const {
        id: roomId,
        receiver: { pfp, displayName },
        lastSpoke,
        lastMessage,
      } = room;

      this.elem_ChatsList.insertAdjacentHTML(
        'beforeend',
        `
        <li class="chat" data-roomId=${roomId}>
          <div class="user-icon"> 
            <span class="user-initial"> ${pfp} </span>
          </div>
          
          <div class="user-content">
            <div class="title">
              <span class="highlight"> ${displayName} </span>
              <span class="last-spoke"> ${lastSpoke} </span>
            </div>
            
            
            <span class="last-message"> ${lastMessage} </span>
          </div>
        </li>
        `
      );
    });

    this.setActiveRoom(rooms.at(0).id);
  }

  addRoom(room) {
    if (this.rooms.has(room.id)) return this.setActiveRoom(room.id);
    else this.rooms.set(room.id, room);

    const {
      id: roomId,
      receiver: { pfp, displayName },
      lastSpoke,
      lastMessage,
    } = room;

    this.elem_ChatsList.insertAdjacentHTML(
      'afterbegin',
      `
      <li class="chat" data-roomId=${roomId}>
        <div class="user-icon"> 
          <span class="user-initial"> ${pfp} </span>
        </div>
        
        <div class="user-content">
          <div class="title">
            <span class="highlight"> ${displayName} </span>
            <span class="last-spoke"> ${lastSpoke} </span>
          </div>
          
          
          <span class="last-message"> ${lastMessage} </span>
        </div>
      </li>
      `
    );

    this.setActiveRoom(roomId);
  }

  async blockRoom() {
    let activeRoom = this.getActiveRoom();

    try {
      await axios.put('/chat/room/block', {
        roomId: activeRoom.id,
        receiverId: activeRoom.receiver.id,
      });

      this.rooms.set(this.activeRoomId, {
        ...activeRoom,
        receiver: { ...activeRoom.receiver, isBlocked: true },
      });

      this.updateBlockState();
    } catch (response) {
      showError('Server', response?.data?.errors?.root ?? 'Something went wrong');
    }
  }

  async unblockRoom() {
    let activeRoom = this.getActiveRoom();

    try {
      await axios.put('/chat/room/unblock', {
        roomId: activeRoom.id,
        receiverId: activeRoom.receiver.id,
      });

      this.rooms.set(this.activeRoomId, {
        ...activeRoom,
        receiver: { ...activeRoom.receiver, isBlocked: false },
      });

      this.updateBlockState();
    } catch (response) {
      showError('Server', response?.data?.errors?.root ?? 'Something went wrong');
    }
  }

  updateBlockState() {
    const activeRoom = this.rooms.get(this.activeRoomId);

    // Showing/Hiding block buttons.
    this.elem_BtnChatBlock.classList.toggle('hidden', activeRoom.receiver.isBlocked);
    this.elem_BtnChatUnblock.classList.toggle('hidden', !activeRoom.receiver.isBlocked);

    // Reseting the Message Form's state.
    this.elem_MessageFileInput.value = null;
    this.elem_MessageTextInput.value = null;

    // Changing the Message form's state if/not disabled.
    const isFormDisabled = activeRoom.receiver.isBlocked || activeRoom.sender.isBlocked;

    this.elem_MessageFileInputLabel.classList.toggle('hidden', isFormDisabled);
    this.elem_MessageSendBtn.classList.toggle('hidden', isFormDisabled);
    isFormDisabled
      ? this.elem_MessageTextInput.setAttribute('disabled', true)
      : this.elem_MessageTextInput.removeAttribute('disabled');
    this.elem_MessageTextInput.setAttribute(
      'placeholder',
      activeRoom.receiver.isBlocked
        ? 'You have blocked this user'
        : activeRoom.sender.isBlocked
          ? 'This user has blocked You'
          : 'Type your message...'
    );
  }

  addMessages(messages) {
    const activeRoom = this.getActiveRoom();

    messages.forEach((message) => {
      const isSender = activeRoom.sender.id === message.senderId;

      this.elem_MessageList.insertAdjacentHTML(
        'afterbegin',
        `
          <div class="message-wrapper ${isSender ? 'right' : 'left'}"> 
            <div class="message-box"> 
              <p class="message-text">Yup, just wrapped it up. Starting on the chat list UI now. </p>
              <span class="time-text">16:32</span>
            </div>
          </div>
        `
      );
    });
  }
}

`
  .message-wrapper.center 
    span.date-separator Today
  
  .message-wrapper.left 
    .message-box 
      p.message-text Hey! Did you finish the login page?
      span.time-text 16:32
       
  .message-wrapper.right 
    .message-box 
      p.message-text Yup, just wrapped it up. Starting on the chat list UI now.
      span.time-text 16:32 
`;

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

    this.getRooms();
  }

  showChatInterface() {
    this.elem_ChatInterface.classList.remove('hidden');
    this.elem_EmptyInterface.classList.add('hidden');

    this.scrollToEnd();
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

    this.updateChatHeader();

    this.elem_MessageList.innerHTML = '';
    activeRoom.messages.forEach((message) => this.addMessage(message, 'afterbegin'));
  }

  scrollToEnd() {
    this.elem_MessageList.scrollTo({
      top: this.elem_MessageList.scrollHeight,
      behavior: 'smooth',
    });
  }

  addRoom(room, at = 'afterbegin') {
    if (this.rooms.has(room.id)) return this.setActiveRoom(room.id);
    else this.rooms.set(room.id, room);

    const {
      id: roomId,
      receiver: { pfp, displayName },
      lastSpoke,
      lastMessage,
    } = room;

    this.elem_ChatsList.insertAdjacentHTML(
      at,
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
  }

  updateRoom(id) {
    const {
      id: roomId,
      receiver: { pfp, displayName },
      lastSpoke,
      lastMessage,
    } = this.rooms.get(id);

    const elem_Room = this.elem_ChatsList.querySelector(`li.chat[data-roomId="${roomId}"]`);
    const elem_RoomPfp = elem_Room.querySelector('.user-initial');
    const elem_RoomName = elem_Room.querySelector('.highlight');
    const elem_RoomLastSpoke = elem_Room.querySelector('.last-spoke');
    const elem_RoomLastMessage = elem_Room.querySelector('.last-message');

    elem_RoomPfp.textContent = pfp;
    elem_RoomName.textContent = displayName;
    elem_RoomLastSpoke.textContent = lastSpoke;
    elem_RoomLastMessage.textContent = lastMessage;
  }

  moveRoomToTop(id) {
    const elem_Room = this.elem_ChatsList.querySelector(`li.chat[data-roomId="${id}"]`);

    const roomHTML = elem_Room.outerHTML;
    elem_Room.remove();
    this.elem_ChatsList.insertAdjacentHTML('afterbegin', roomHTML);
  }

  updateChatHeader() {
    const {
      receiver: { pfp, displayName, isBlocked, isDeleted },
    } = this.getActiveRoom();

    // Update Header Copy.
    this.elem_ChatInterfaceUserInitial.textContent = pfp;
    this.elem_ChatInterfaceUserDisplayName.textContent = displayName;

    // Showing/Hiding controls.
    this.elem_BtnCallVoice.classList.toggle('hidden', isDeleted || isBlocked);
    this.elem_BtnCallVideo.classList.toggle('hidden', isDeleted || isBlocked);

    this.elem_BtnChatDelete.closest('.dropdown').classList.toggle('hidden', isDeleted);

    this.elem_BtnChatBlock.classList.toggle('hidden', isDeleted || isBlocked);
    this.elem_BtnChatUnblock.classList.toggle('hidden', isDeleted || !isBlocked);
    this.elem_BtnChatDelete.classList.toggle('hidden', isDeleted);

    this.updateMessageForm();
  }

  updateMessageForm() {
    const activeRoom = this.getActiveRoom();

    // Checking weather the form will should be disabled or not.
    const isFormDisabled =
      activeRoom.receiver.isBlocked || activeRoom.receiver.isDeleted || activeRoom.sender.isBlocked;

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
      activeRoom.receiver.isDeleted
        ? 'Deleted User'
        : activeRoom.receiver.isBlocked
          ? 'You have blocked this user'
          : activeRoom.sender.isBlocked
            ? 'This user has blocked You'
            : 'Type your message...'
    );
  }

  addMessage(message, at = 'beforeend') {
    this.elem_MessageList.insertAdjacentHTML(
      at,
      `
        <div class="message-wrapper ${message.isSender ? 'right' : 'left'}"> 
          <div class="message-box" data-messageId="${message.id}"> 
            <p class="message-text">${message.content}</p>
            <span class="time-text">${message.sentAt}</span>
          </div>
        </div>
      `
    );

    this.scrollToEnd();
  }

  removeMessage(id) {
    this.elem_MessageList.querySelector(`div.message-box[data-messageId="${id}"]`).remove();
  }

  canDeleteMessage(id) {
    return this.getActiveRoom()?.messages?.find((message) => message.id === id)?.isSender ?? false;
  }

  canDeleteChat() {
    return (this.getActiveRoom()?.messages?.length ?? 0) > 0;
  }

  async getRooms() {
    try {
      const { data: chatrooms } = await axios.get('/chat/room/all');

      chatrooms.forEach((room) => this.addRoom(room, 'beforeend'));

      if (chatrooms.length > 0) {
        await this.getChat(chatrooms.at(0).id);
        this.setActiveRoom(chatrooms.at(0).id);
        this.showChatInterface();
      } else this.showEmptyInterface();
    } catch (error) {
      if (error.errors) return showError('Server', error.errors.root);

      this.showEmptyInterface();
    }
  }

  async getChat(roomId) {
    const room = this.rooms.get(roomId);

    try {
      const { data: messages } = await axios.get(`/chat/room/${room.id}/all`);

      this.rooms.set(room.id, {
        ...room,
        messages,
      });
    } catch (error) {
      if (error.errors) return showError('Server', error.errors.root);

      this.showEmptyInterface();
    }
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

      this.updateChatHeader();
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

      this.updateChatHeader();
    } catch (response) {
      showError('Server', response?.data?.errors?.root ?? 'Something went wrong');
    }
  }

  async deleteChat() {
    const activeRoom = this.getActiveRoom();

    try {
      await axios.put(`/chat/delete`, {
        roomId: this.activeRoomId,
      });

      this.rooms.set(this.activeRoomId, {
        ...activeRoom,
        lastMessage: '',
        lastSpoke: '',
        messages: [],
      });

      this.elem_MessageList.innerHTML = '';
      this.updateRoom(activeRoom.id);
    } catch (response) {
      showError('Server', response?.data?.errors?.root ?? 'Something went wrong');
    }
  }

  async sendMessage(messageText) {
    const activeRoom = this.getActiveRoom();

    try {
      const { data: message } = await axios.post('/chat/message/send', {
        roomId: activeRoom.id,
        content: messageText,
      });

      this.rooms.set(this.activeRoomId, {
        ...activeRoom,
        lastSpoke: message.sentAt,
        lastMessage: message.content,
        messages: [message, ...activeRoom.messages],
      });

      this.addMessage(message);
      this.updateRoom(activeRoom.id);
      this.moveRoomToTop(activeRoom.id);
    } catch (response) {
      showError('Server', response?.data?.errors?.root ?? 'Something went wrong');
    }
  }

  async deleteMessage(id) {
    const activeRoom = this.getActiveRoom();

    try {
      const {
        data: { messageId },
      } = await axios.delete(`/chat/message/${id}`);

      // Deleting the deleted message from local state.
      activeRoom.messages.splice(
        activeRoom.messages.findIndex((message) => message.id === messageId),
        1
      );

      this.rooms.set(this.activeRoomId, {
        ...activeRoom,
        lastMessage: activeRoom.messages.at(0)?.content ?? '',
      });

      this.removeMessage(messageId);
      this.updateRoom(activeRoom.id);
    } catch (response) {
      showError('Server', response?.data?.errors?.root ?? 'Something went wrong');
    }
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

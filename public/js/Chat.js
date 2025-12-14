export class Chat {
  constructor() {
    // DOM Selections.
    this.elem_AppContent = document.getElementById('page-content');
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
    this.elem_BtnChatBlock = document.getElementById('btn-chat-block');
    this.elem_BtnChatUnblock = document.getElementById('btn-chat-unblock');
    this.elem_MobileBtnCallVoice = document.getElementById('mobile-btn-call-voice');
    this.elem_MobileBtnCallVideo = document.getElementById('mobile-btn-call-video');
    this.elem_MobileBtnChatBlock = document.getElementById('mobile-btn-chat-block');
    this.elem_MobileBtnChatUnblock = document.getElementById('mobile-btn-chat-unblock');

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

  scrollToEnd() {
    this.elem_MessageList.scrollTo({
      top: this.elem_MessageList.scrollHeight,
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
      unreadCount,
    } = room;

    this.elem_ChatsList.insertAdjacentHTML(
      at,
      `
      <li class="chat ${unreadCount === 0 ? '' : 'unread'}" data-roomId=${roomId}>
        <div class="user-icon"> 
          <span class="user-initial"> ${pfp} </span>
        </div>
        
        <div class="user-content">
          <div class="title">
            <span class="highlight"> ${displayName} </span>
            <span class="last-spoke"> ${lastSpoke} </span>
          </div>
          
          
          <div class="subtitle">
            <span class="last-message"> ${lastMessage} </span>
            <span class="new-message-count"> ${unreadCount > 99 ? '99+' : unreadCount} </span>
          </div>
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

    // Updating Document Title.
    document.title = `${displayName} | Yapper`;

    // Update Header Copy.
    this.elem_ChatInterfaceUserInitial.textContent = pfp;
    this.elem_ChatInterfaceUserDisplayName.textContent = displayName;

    // Showing/Hiding controls.
    this.elem_BtnCallVoice.classList.toggle('hidden', isDeleted || isBlocked);
    this.elem_BtnCallVideo.classList.toggle('hidden', isDeleted || isBlocked);
    this.elem_MobileBtnCallVoice.classList.toggle('hidden', isDeleted || isBlocked);
    this.elem_MobileBtnCallVideo.classList.toggle('hidden', isDeleted || isBlocked);

    this.elem_BtnChatBlock.closest('.dropdown').classList.toggle('hidden', isDeleted);
    this.elem_MobileBtnChatBlock.closest('.dropdown').classList.toggle('hidden', isDeleted);

    this.elem_BtnChatBlock.classList.toggle('hidden', isDeleted || isBlocked);
    this.elem_MobileBtnChatBlock.classList.toggle('hidden', isDeleted || isBlocked);
    this.elem_BtnChatUnblock.classList.toggle('hidden', isDeleted || !isBlocked);
    this.elem_MobileBtnChatUnblock.classList.toggle('hidden', isDeleted || !isBlocked);

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

  addDateSeparator(dateString, at = 'beforeend') {
    this.elem_MessageList.insertAdjacentHTML(
      at,
      `
        <div class="message-wrapper center" data-dateString="${dateString}">
            <span class="date-separator">${dateString}</span>
        </div>
      `
    );

    this.scrollToEnd();
  }

  addMessage(message, at = 'beforeend') {
    message.content = message.isFile
      ? message.content
      : Autolinker.link(message.content, { target: '_blank', stripPrefix: false });

    const elem_LastMessageChild = Array.from(this.elem_MessageList.children).at(
      at === 'beforeend' ? -1 : 0
    );

    let fileIcon = null;

    if (message.fileType) {
      switch (message.fileType) {
        case 'PNG':
          fileIcon = 'photo';
          break;
        case 'JPEG':
          fileIcon = 'photo';
          break;
        case 'PDF':
          fileIcon = 'picture_as_pdf';
          break;
        default:
          fileIcon = 'article';
          break;
      }
    }

    const messageBox = message.isFile
      ? `
      <div class="message-box" data-messageId="${message.id}"> 
        <div class="file">
          <span class="material-icons">${fileIcon}</span>
          
          <div class="details">
            <span class="title">${message.fileName}</span>
            <span class="subtitle">${message.fileType} &middot; ${message.fileSize}</span>
          </div>
        </div>
        <span class="time-text">${message.sentAt}</span>
      </div>
      `
      : `
      <div class="message-box" data-messageId="${message.id}"> 
        <p class="message-text">${message.content}</p>
        <span class="time-text">${message.sentAt}</span>
      </div>
    `;

    if (elem_LastMessageChild?.classList?.contains('right') && message?.isSender) {
      elem_LastMessageChild.insertAdjacentHTML(at, messageBox);
    } else if (elem_LastMessageChild?.classList?.contains('left') && !message?.isSender) {
      elem_LastMessageChild.insertAdjacentHTML(at, messageBox);
    } else {
      this.elem_MessageList.insertAdjacentHTML(
        at,
        `
          <div class="message-wrapper ${message.isSender ? 'right' : 'left'}"> 
            ${messageBox}
          </div>
        `
      );
    }

    this.scrollToEnd();
  }

  removeMessage(id) {
    this.elem_MessageList.querySelector(`div.message-box[data-messageId="${id}"]`).remove();
  }

  canDeleteMessage(id) {
    return (
      this.getActiveRoom()
        ?.messages?.flat()
        ?.find((message) => message.id === id)?.isSender ?? false
    );
  }

  getActiveRoom() {
    return this.rooms.get(this.activeRoomId);
  }

  canDownloadFile(messageId) {
    return this.getActiveRoom()
      ?.messages?.flat()
      ?.find((message) => message.id === messageId)?.isFile;
  }

  async setActiveRoom(roomId) {
    if (roomId === this.activeRoomId) return;

    this.activeRoomId = roomId;
    const activeRoom = this.getActiveRoom();

    const chat = () =>
      activeRoom.messages.length > 0 ? Promise.resolve() : this.getChat(activeRoom.id);

    this.elem_ChatsList
      .querySelectorAll('li.chat')
      .forEach((elem) =>
        elem.classList.toggle('active', elem.getAttribute('data-roomId') === activeRoom.id)
      );

    this.updateChatHeader();

    this.elem_MessageList.innerHTML = '';

    await chat();

    this.rooms.get(activeRoom.id).messages.forEach((entry) => {
      if (typeof entry === 'string') this.addDateSeparator(entry, 'afterbegin');
      else entry.forEach((message) => this.addMessage(message, 'afterbegin'));
    });

    this.elem_MessageTextInput.focus();

    this.setLastRead();
  }

  async getRooms() {
    try {
      const { data: chatrooms } = await axios.get('/chat/room/all');

      chatrooms.forEach((room) => this.addRoom(room, 'beforeend'));

      if (chatrooms.length > 0) {
        this.showChatInterface();
        await this.setActiveRoom(chatrooms.at(0).id);
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

  async setLastRead() {
    const activeRoom = this.getActiveRoom();

    if (
      activeRoom.messages.length === 0 ||
      new Date(activeRoom.sender.lastReadAt) >= new Date(activeRoom.messages.at(0).at(0).createdAt)
    )
      return;

    try {
      const newLastReadAt = activeRoom.messages.at(0)?.at(0).createdAt;

      await axios.put('/chat/room/read-receipt', {
        roomId: activeRoom.id,
        lastReadAt: newLastReadAt,
      });

      this.rooms.set(activeRoom.id, {
        ...activeRoom,
        sender: { ...activeRoom.sender, lastReadAt: newLastReadAt },
        unreadCount: 0,
      });

      this.elem_ChatsList
        .querySelector(`.chat[data-roomId="${activeRoom.id}"]`)
        .classList.remove('unread');
    } catch (error) {}
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

  async sendMessage(
    content,
    isFile = false,
    { fileName, fileSize, fileType } = { fileName: null, fileSize: null, fileType: null }
  ) {
    const activeRoom = this.getActiveRoom();

    try {
      const { data: message } = await axios.post('/chat/message/send', {
        roomId: activeRoom.id,
        content,
        isFile,
        fileName,
        fileSize,
        fileType,
      });

      const newMessages = activeRoom?.messages ?? [];
      const messageCreatedAt = new Date(message.createdAt);
      const latestMessage = activeRoom?.messages?.at(0)?.at(0) ?? null;
      const latestMessageCreatedAt = new Date(latestMessage?.createdAt) ?? null;

      if (newMessages.length === 0 || !isSameDate(latestMessageCreatedAt, messageCreatedAt)) {
        newMessages.unshift(formatDateString(messageCreatedAt));
        newMessages.unshift([message]);
        this.addDateSeparator(formatDateString(messageCreatedAt));
      } else {
        newMessages.at(0).unshift(message);
      }

      this.rooms.set(this.activeRoomId, {
        ...activeRoom,
        lastSpoke: message.sentAt,
        lastMessage: message.isFile ? message.fileName : message.content,
        messages: newMessages,
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
      const { data: chatroom } = await axios.delete(`/chat/message/${id}`);

      // Deleting the deleted message from local state.
      const newMessages = activeRoom.messages
        .map((entry) => {
          if (typeof entry !== 'string') {
            entry.splice(
              entry.findIndex((message) => message.id === id),
              1
            );
          }

          return entry;
        })
        .filter((entry) => entry.length > 0)
        .filter((entry, index, entries) => {
          if (index === 0 && typeof entry === 'string') return false;

          const lastEntry = entries.at(index - 1);

          if (typeof lastEntry === 'string' && typeof entry === 'string') return false;

          return true;
        });

      this.rooms.set(this.activeRoomId, {
        ...activeRoom,
        lastSpoke: chatroom.lastSpoke,
        lastMessage: chatroom.lastMessage,
        messages: newMessages,
      });

      this.removeMessage(id);
      this.updateRoom(activeRoom.id);
    } catch (response) {
      showError('Server', response?.data?.errors?.root ?? 'Something went wrong');
    }
  }

  async downloadFile(id) {
    const activeRoom = this.getActiveRoom();
    const message = activeRoom.messages.flat().find((message) => message.id === id);

    try {
      const {
        data: { downloadURL },
      } = await axios.post(`/chat/file/download`, {
        fileKey: message.content,
        fileName: message.fileName,
      });

      const elem_TempLink = document.createElement('a');
      elem_TempLink.setAttribute('href', downloadURL);
      elem_TempLink.classList.add('hidden');

      document.body.appendChild(elem_TempLink);
      elem_TempLink.click();
      elem_TempLink.remove();
    } catch (response) {
      showError('Server', response?.data?.errors?.root ?? 'Something went wrong');
    }
  }
}

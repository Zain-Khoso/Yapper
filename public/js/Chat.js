export class Chat {
  constructor() {
    // DOM Selections.
    this.elem_ChatsList = document.getElementById('chatslist');
    this.elem_ChatInterface = document.getElementById('chatapp-ui');
    this.elem_EmptyInterface = document.getElementById('chatapp-empty-ui');
    this.elem_ChatInterfaceUserInitial =
      this.elem_ChatInterface.querySelector('#chatapp-user-initial');
    this.elem_ChatInterfaceUserDisplayName = this.elem_ChatInterface.querySelector(
      '#chatapp-user-displayName'
    );
    this.elem_MessageList = this.elem_ChatInterface.querySelector('.messages');

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

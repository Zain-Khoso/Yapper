export class Chat {
  constructor() {
    // DOM Selections.
    this.elem_ChatsList = document.getElementById('chatslist');
    this.elem_ChatInterface = document.getElementById('chatapp-ui');
    this.elem_EmptyInterface = document.getElementById('chatapp-empty-ui');

    // Values.
    this.rooms = new Map();
    this.activeRoom = {};

    if (this.elem_ChatsList.children.length > 0) this.showChatInterface();
    else this.showEmptyInterface();
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

  addRoom(room) {
    if (this.rooms.has(room.id)) return;
    else this.rooms.set(room.id, room);

    const roomId = room.id;
    const pfp = room.receiver.displayName.at(0).toUpperCase();
    const displayName = room.receiver.displayName;
    const lastSpoke = '';
    const lastMessage = '';

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

  setActiveRoom(roomId) {
    this.elem_ChatsList
      .querySelectorAll('li.chat')
      .forEach((elem) =>
        elem.classList.toggle('active', elem.getAttribute('data-roomId') === roomId)
      );

    this.activeRoom = this.rooms.get(roomId);
  }
}

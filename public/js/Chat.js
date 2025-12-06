export class Chat {
  constructor() {
    this.elem_ChatsList = document.getElementById('chatslist');
    this.elem_ChatInterface = document.getElementById('chatapp-ui');
    this.elem_EmptyInterface = document.getElementById('chatapp-empty-ui');

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
  }
}

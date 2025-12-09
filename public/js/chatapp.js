'use strict';

// Local Imports.
import { Chat } from './Chat.js';

// Contants.
const App = new Chat();

// Functions.
const handleAddChatClick = async function () {
  const question = await Swal.fire({
    icon: 'question',
    iconColor: 'var(--color-foreground)',
    title: 'Add a Yap',
    text: "Please enter your friend's email address to start Yapping.",
    theme: getTheme(),
    showCancelButton: true,
    confirmButtonText: 'Add',
    cancelButtonText: 'Cancel',
    input: 'text',
    inputLabel: 'Email',
    inputPlaceholder: 'abc@xyz.com',
    inputValidator: (value) => {
      if (value.trim() === '') return 'Email is required.';

      if (!validator.isEmail(value)) return 'Email is not valid.';
    },
    customClass: {
      confirmButton: 'btn success',
      cancelButton: 'btn outline',
    },
  });

  if (!question.isConfirmed) return;

  // Form Submittion.
  try {
    const {
      data: { chatroom },
    } = await axios.post('/chat/room/add', {
      receiverEmail: question.value,
    });

    App.addRoom(chatroom);
    App.setActiveRoom(chatroom.id);
  } catch (response) {
    // Extracting Error Information.
    const { errors } = response.response.data;

    if (errors?.receiverEmail) showError('Email', errors.receiverEmail);
    if (errors?.root) showError('Server', errors.root);
  }
};

const handleChatChange = function ({ target }) {
  const elem_ChatOption = target.closest('.chat');

  if (elem_ChatOption) App.setActiveRoom(elem_ChatOption.getAttribute('data-roomId'));
};

const handleWillBeAddedShortly = function () {
  Swal.fire({
    icon: 'info',
    iconColor: 'var(--color-foreground)',
    title: 'Coming Soon',
    theme: getTheme(),
    customClass: {
      confirmButton: 'btn primary',
    },
  });
};

const handleMessageSend = async function (event) {
  event.preventDefault();

  const messageText = App.elem_MessageTextInput.value;

  if (messageText.trim() === '') return;

  App.sendMessage(messageText);

  App.elem_MessageTextInput.value = null;
};

// Event Listeners.
App.elem_BtnAddChat.addEventListener('click', handleAddChatClick);
App.elem_ChatsList.addEventListener('click', handleChatChange);
App.elem_BtnCallVoice.addEventListener('click', handleWillBeAddedShortly);
App.elem_BtnCallVideo.addEventListener('click', handleWillBeAddedShortly);
App.elem_BtnChatDelete.addEventListener('click', handleWillBeAddedShortly);
App.elem_BtnChatBlock.addEventListener('click', () => App.blockRoom());
App.elem_BtnChatUnblock.addEventListener('click', () => App.unblockRoom());
App.elem_MessageForm.addEventListener('submit', handleMessageSend);

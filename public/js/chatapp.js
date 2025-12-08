'use strict';

// Local Imports.
import { Chat } from './Chat.js';

// Contants.
const App = new Chat();
const elem_BtnAddChat = document.getElementById('btn-add-chat');

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
  } catch (response) {
    // Extracting Error Information.
    const { errors } = response.response.data;

    if (errors?.receiverEmail) showError('Email', errors.receiverEmail);
    if (errors?.root) showError('Server', errors.root);
  }
};

// Event Listeners.
elem_BtnAddChat.addEventListener('click', handleAddChatClick);

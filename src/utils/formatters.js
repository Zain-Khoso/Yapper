function formatUser(user) {
  const isDeleted = Object.keys(user).length === 0;

  return {
    id: isDeleted ? '' : user.id,
    pfp: isDeleted ? 'Y' : user?.displayName?.at(0)?.toUpperCase(),
    displayName: isDeleted ? 'Yapper User' : user.displayName,
    lastReadAt: user?.ChatroomMember?.lastReadAt,
    isBlocked: user?.ChatroomMember?.isBlocked === true ? true : false,
    isDeleted,
  };
}

function formatLastSeen(inputDate) {
  const date = new Date(inputDate);
  const now = new Date();

  const oneDay = 24 * 60 * 60 * 1000;

  // Normalize for comparison (strip time)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfInput = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.floor((startOfToday - startOfInput) / oneDay);

  // TODAY -> return HH:MM
  if (diffDays === 0) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // YESTERDAY
  if (diffDays === 1) return 'Yesterday';

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // LAST 7 DAYS → return weekday name
  if (diffDays < 7) return dayNames[date.getDay()];

  // OLDER → return dd/mm/yyyy
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatDateString(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatMessage(message, senderId) {
  const createdAt = message.createdAt;
  const sentAt = `${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;

  return {
    id: message.id,
    isSender: senderId === message.senderId,
    content: message.content,
    isFile: message.isFile,
    sentAt,
    createdAt,
  };
}

function formatMessagesList(messages, senderId = '') {
  if (messages.length === 0) return [];
  if (senderId === '') throw new Error('senderId is required.');

  const output = [];

  for (let message of messages) {
    message = formatMessage(message, senderId);
    const currentCreatedAt = message.createdAt;

    if (output.length === 0) output.push([message]);
    else {
      const lastEntry = output.at(-1);

      if (Array.isArray(lastEntry)) {
        const lastCreatedAt = lastEntry.at(-1).createdAt;

        if (
          lastCreatedAt.getFullYear() === currentCreatedAt.getFullYear() &&
          lastCreatedAt.getMonth() === currentCreatedAt.getMonth() &&
          lastCreatedAt.getDate() === currentCreatedAt.getDate()
        ) {
          if (lastEntry.at(-1).isSender === message.isSender) output.at(-1).push(message);
          else output.push([message]);
        } else {
          output.push(formatDateString(lastCreatedAt));
          output.push([message]);
        }
      } else output.push([message]);
    }
  }

  if (output.length !== 0) output.push(formatDateString(output.at(-1).at(-1).createdAt));

  return output;
}

function formatChatroom(chatroom, senderId) {
  const sender = formatUser(chatroom?.Users?.find((user) => user.id === senderId) ?? {});
  const receiver = formatUser(chatroom?.Users?.find((user) => user.id !== senderId) ?? {});

  return {
    id: chatroom.id,
    lastSpoke: formatLastSeen(chatroom.lastMessageAt),
    lastMessage: chatroom?.Messages?.at(0)?.content ?? '',
    unreadCount: chatroom?.unreadCount ?? 0,
    messages: [],
    sender,
    receiver,
  };
}

module.exports = { formatChatroom, formatMessage, formatMessagesList };

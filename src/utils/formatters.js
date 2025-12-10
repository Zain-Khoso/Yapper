function formatUser(user) {
  const isDeleted = Object.keys(user).length === 0;

  return {
    id: isDeleted ? '' : user.id,
    pfp: isDeleted ? 'Y' : user?.displayName?.at(0)?.toUpperCase(),
    displayName: isDeleted ? 'Yapper User' : user.displayName,
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

function formatMessage(message, senderId) {
  const createdAt = new Date(message.createdAt);
  const sentAt = `${
    createdAt.getHours() > 9 ? createdAt.getHours() : '0' + createdAt.getHours()
  }:${createdAt.getMinutes() > 9 ? createdAt.getMinutes() : '0' + createdAt.getMinutes()}`;

  return {
    id: message.id,
    isSender: senderId === message.senderId,
    content: message.content,
    sentAt,
  };
}

function formatChatroom(chatroom, senderId) {
  const sender = formatUser(chatroom.Users.find((user) => user.id === senderId) ?? {});
  const receiver = formatUser(chatroom.Users.find((user) => user.id !== senderId) ?? {});
  const messages = chatroom?.Messages?.map((message) => formatMessage(message, senderId)) ?? [];

  const data = {
    id: chatroom.id,
    lastSpoke: formatLastSeen(chatroom.lastMessageAt),
    lastMessage: messages.at(0)?.content ?? '',
    sender,
    receiver,
    messages,
  };

  return data;
}

module.exports = { formatChatroom, formatMessage };

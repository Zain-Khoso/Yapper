function formatLastSeen(inputDate) {
  if (!inputDate) return null;

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

function formatFileType(type) {
  let output = type.split('/').at(-1).toUpperCase();

  if (output === 'PLAIN') output = 'TXT';

  return output;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formatted = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${formatted} ${sizes[i]}`;
}

function formatDateString(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function isSameDate(one, two) {
  if (!one || !two) return false;

  if (
    one.getFullYear() === two.getFullYear() &&
    one.getMonth() === two.getMonth() &&
    one.getDate() === two.getDate()
  )
    return true;
  else return false;
}

function serializeResponse(data = {}, errors = {}) {
  return {
    success: Object.keys(errors).length === 0,
    errors,
    data,
  };
}

function serializeUser(user) {
  const isDeleted = !user || Object.keys(user).length === 0;

  return {
    id: user?.id ?? '',
    email: user?.email ?? '',
    initial: user?.displayName?.at(0)?.toUpperCase() ?? 'Y',
    picture: user?.picture ?? '',
    displayName: user?.displayName ?? 'Yapper User',
    isOnline: user?.isOnline ?? false,
    lastSeen: formatLastSeen(user?.lastSeen),
    lastReadAt: user?.chatroomMember?.lastReadAt,
    isBlocked: user?.chatroomMember?.isBlocked === true ? true : false,
    isDeleted,
  };
}

function serializeRoom(room, senderId) {
  const sender = serializeUser(room?.members?.find((member) => member.id === senderId) ?? {});
  const receiver = serializeUser(room?.members?.find((member) => member.id !== senderId) ?? {});
  const lastMessageObj = room?.messages?.at(0);
  const lastMessage =
    lastMessageObj === undefined
      ? ''
      : lastMessageObj.isFile
        ? lastMessageObj.fileName
        : lastMessageObj.content;

  return {
    id: room.id,
    lastSpoke: formatLastSeen(room.lastMessageAt),
    unreadCount: room?.unreadCount ?? 0,
    lastMessage,
    sender,
    receiver,
  };
}

function serializeMessage(message, senderId) {
  const createdAt = message.createdAt;
  const sentAt = `${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;

  return {
    id: message.id,
    isSender: senderId === message.userId,
    content: message.content,
    isFile: message.isFile,
    fileType: message.isFile ? formatFileType(message.fileType) : null,
    fileName: message.isFile ? message.fileName : null,
    fileSize: message.isFile ? formatFileSize(message.fileSize) : null,
    sentAt,
    createdAt,
  };
}

function serializeMessagesList(messages, senderId) {
  if (messages.length === 0) return [];

  const output = [];

  for (let message of messages) {
    message = serializeMessage(message, senderId);
    const currentCreatedAt = message.createdAt;

    if (output.length === 0) output.push([message]);
    else {
      const lastEntry = output.at(-1);

      if (Array.isArray(lastEntry)) {
        const lastCreatedAt = lastEntry.at(-1).createdAt;

        if (isSameDate(lastCreatedAt, currentCreatedAt)) {
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

export {
  serializeResponse,
  serializeUser,
  serializeRoom,
  serializeMessage,
  serializeMessagesList,
  formatDateString,
  isSameDate,
};

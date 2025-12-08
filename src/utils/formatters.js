const formatUser = function (user) {
  return {
    id: user.id,
    displayName: user.displayName,
    isBlocked: user.ChatroomMember.isBlocked,
  };
};

exports.formatChatroom = function (chatroom, senderId) {
  const sender = formatUser(chatroom.Users.find((user) => user.id === senderId));
  const receiver = formatUser(chatroom.Users.find((user) => user.id !== senderId));

  const data = {
    id: chatroom.id,
    updatedAt: chatroom.updatedAt,
    sender,
    receiver,
  };

  return data;
};

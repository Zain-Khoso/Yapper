// Lib Imports.
const validator = require('validator');

// Local Imports.
const sequelize = require('../utils/database');
const User = require('../models/user.model');
const Chatroom = require('../models/chatroom.model');
const ChatroomMember = require('../models/chatroomMember.model');
const Message = require('../models/message.model');
const getMetadata = require('../utils/metadata');
const { schema_email } = require('../utils/validations');
const { formatChatroom, formatMessage } = require('../utils/formatters');

exports.getChatPage = function (req, res) {
  const metadata = getMetadata({
    title: 'Chat',
    description:
      'Real-time messaging on Yapper. Instantly send and receive messages, stay connected with your contacts, and enjoy a fast, modern chat experience built for privacy, speed, and reliability.',
    keywords: [
      'chat',
      'messaging',
      'real-time chat',
      'conversations',
      'Yapper chat',
      'instant messaging',
      'secure chat',
      'user conversations',
    ],
    url: { hostname: req.hostname, path: req.url },
  });

  res.render('chat', {
    metadata,
    path: 'chat',
    heading: 'Yaps',
  });
};

exports.getChatrooms = function (req, res, next) {
  const senderId = req.session.user.id;

  User.findByPk(senderId, {
    attributes: [],
    include: {
      model: Chatroom,
      attributes: ['id', 'updatedAt'],
      through: { attributes: [] },
      include: [
        {
          model: User,
          attributes: ['id', 'displayName'],
          through: { attributes: ['id', 'isBlocked'] },
        },
        {
          model: Message,
          attributes: ['id', 'isFile', 'content', 'senderId', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit: 100,
          separate: true,
        },
      ],
    },
    order: [[Chatroom, 'createdAt', 'DESC']],
  })
    .then((user) =>
      res
        .status(200)
        .json(user.Chatrooms.map((chatroom) => formatChatroom(chatroom, req.session.user.id)))
    )
    .catch((error) => {
      console.log('\n\n', error);

      next(Error());
    });
};

exports.postAddChatroom = function (req, res) {
  let { receiverEmail } = req.body;
  const session = req.session;

  // Sanitizing body data.
  receiverEmail = validator.trim(receiverEmail);
  receiverEmail = validator.normalizeEmail(receiverEmail, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  });

  // Validating body data.
  const result_receiverEmail = schema_email.safeParse(receiverEmail);

  if (!result_receiverEmail.success) {
    return res.status(409).json({
      errors: {
        receiverEmail: result_receiverEmail?.error?.issues?.at(0)?.message,
      },
    });
  }

  if (receiverEmail === session.user.email) {
    return res.status(409).json({
      errors: {
        receiverEmail: 'Invalid Email',
      },
    });
  }

  sequelize
    .transaction((t) =>
      User.findOne({ where: { email: receiverEmail }, transaction: t })
        .then((receiver) => {
          if (!receiver) throw { errors: { receiverEmail: 'User does not exist.' } };

          return Promise.all([
            receiver,
            Chatroom.findAll({
              attributes: ['id', 'updatedAt'],
              include: {
                model: User,
                where: {
                  id: [receiver.id, session.user.id],
                },
                attributes: ['id', 'displayName'],
                through: { attributes: ['id', 'isBlocked'] },
              },
              transaction: t,
            }),
          ]);
        })
        .then(([receiver, chatrooms]) => {
          const existingRoom = chatrooms.find((chatroom) => chatroom.Users.length === 2);

          if (existingRoom) throw { chatroom: formatChatroom(existingRoom, session.user.id) };

          return Promise.all([receiver, Chatroom.create({}, { transaction: t })]);
        })
        .then(([receiver, chatroom]) =>
          chatroom.addUsers([receiver.id, session.user.id], { transaction: t })
        )
        .then(([chatroomMember]) =>
          Chatroom.findByPk(chatroomMember.ChatroomId, {
            attributes: ['id', 'updatedAt'],
            include: {
              model: User,
              attributes: ['id', 'displayName'],
              through: { attributes: ['id', 'isBlocked'] },
            },
            transaction: t,
          })
        )
    )
    .then((chatroom) =>
      res.status(200).json({ chatroom: formatChatroom(chatroom, session.user.id) })
    )
    .catch((error) => {
      if (error?.chatroom) res.status(200).json(error);
      else if (error?.errors) res.status(409).json(error);
      else res.status(500).json({ errors: { root: 'Something went wrong.' } });
    });
};

exports.putBlockChat = function (req, res) {
  const { roomId, receiverId } = req.body;

  ChatroomMember.update(
    {
      isBlocked: true,
    },
    {
      where: {
        ChatroomId: roomId,
        UserId: receiverId,
      },
    }
  )
    .then((chatroomMembers) => {
      if (chatroomMembers.at(0) !== 1) throw new Error();

      res.status(200).json();
    })
    .catch(() => res.status(500).json({ errors: { root: 'Something went wrong.' } }));
};

exports.putUnblockChat = function (req, res) {
  const { roomId, receiverId } = req.body;

  ChatroomMember.update(
    {
      isBlocked: false,
    },
    {
      where: {
        ChatroomId: roomId,
        UserId: receiverId,
      },
    }
  )
    .then((chatroomMembers) => {
      if (chatroomMembers.at(0) !== 1) throw new Error();

      res.status(200).json();
    })
    .catch(() => res.status(500).json({ errors: { root: 'Something went wrong.' } }));
};

exports.postSendMessage = function (req, res) {
  const { roomId, content } = req.body;
  const senderId = req.session.user.id;

  if (roomId.trim() === '') return res.status(400).json();
  if (content.trim() === '') return res.status(400).json();

  Chatroom.findByPk(roomId, {
    attributes: ['id'],
    include: {
      model: User,
      attributes: ['id'],
      through: { attributes: ['isBlocked'] },
    },
  })
    .then((chatroom) => {
      if (!chatroom) throw new Error();

      const { isBlocked: isSenderBlocked } = chatroom.Users.find(
        (user) => user.id === senderId
      ).ChatroomMember;
      const { isBlocked: isReceiverBlocked } = chatroom.Users.find(
        (user) => user.id !== senderId
      ).ChatroomMember;

      if (isSenderBlocked)
        throw { errors: { root: 'Cannot send message to someone who has block you.' } };
      if (isReceiverBlocked)
        throw { errors: { root: 'Cannot send message to someone whom you have blocked.' } };

      return chatroom.createMessage({ content, senderId });
    })
    .then((message) => res.status(201).json(formatMessage(message, senderId)))
    .catch((error) => {
      console.log(error);
      if (error?.errors) res.status(400).json(error.errors);
      else res.status(500).json({ errors: { root: 'Something went wrong.' } });
    });
};

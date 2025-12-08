// Lib Imports.
const validator = require('validator');

// Local Imports.
const sequelize = require('../utils/database');
const User = require('../models/user.model');
const Chatroom = require('../models/chatroom.model');
const Message = require('../models/message.model');
const getMetadata = require('../utils/metadata');
const { schema_email } = require('../utils/validations');
const { formatChatroom } = require('../utils/formatters');

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
          attributes: ['id', 'isFile', 'content', 'senderId'],
          order: [['createdAt', 'DESC']],
          limit: 20,
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

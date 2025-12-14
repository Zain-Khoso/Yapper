// Node Imports.
const crypto = require('crypto');

// Lib Imports.
const validator = require('validator');
const he = require('he');
const { Op, col, fn, where } = require('sequelize');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Local Imports.
const sequelize = require('../utils/database');
const User = require('../models/user.model');
const Chatroom = require('../models/chatroom.model');
const ChatroomMember = require('../models/chatroomMember.model');
const Message = require('../models/message.model');
const getMetadata = require('../utils/metadata');
const { schema_email, schema_file } = require('../utils/validations');
const { formatChatroom, formatMessage, formatMessagesList } = require('../utils/formatters');
const storage = require('../utils/storage');

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
      attributes: ['id', 'lastMessageAt'],
      through: { attributes: [] },
      include: [
        {
          model: User,
          attributes: ['id', 'displayName'],
          through: { attributes: ['id', 'isBlocked', 'lastReadAt'] },
        },
        {
          model: Message,
          attributes: ['id', 'isFile', 'content', 'fileName', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit: 1,
          separate: true,
        },
      ],
    },
    order: [[Chatroom, 'lastMessageAt', 'DESC']],
  })
    .then((user) => {
      const chatroomIds = user.Chatrooms.map((chatroom) => chatroom.id);

      return Promise.all([
        user,
        Chatroom.findAll({
          attributes: ['id', [fn('COUNT', col('Messages.id')), 'unreadCount']],
          where: { id: chatroomIds },
          include: [
            {
              model: User,
              attributes: [],
              through: {
                model: ChatroomMember,
                attributes: ['lastReadAt'],
              },
              where: { id: senderId },
              required: true,
            },
            {
              model: Message,
              attributes: [],
              where: where(col('Messages.createdAt'), '>', col('Users.ChatroomMember.lastReadAt')),
              required: false,
            },
          ],
          group: ['Chatroom.id', 'Users.ChatroomMember.lastReadAt'],
          raw: true,
        }),
      ]);
    })
    .then(([user, unreadCounts]) => {
      const unreadMap = new Map();
      unreadCounts.forEach((unread) => unreadMap.set(unread.id, unread.unreadCount));

      const chatrooms = user.Chatrooms.map((chatroom) => {
        chatroom.unreadCount = unreadMap.get(chatroom.id);

        return formatChatroom(chatroom, senderId);
      });

      res.status(200).json(chatrooms);
    })
    .catch((error) => {
      next(Error(error));
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
              attributes: ['id', 'lastMessageAt'],
              include: [
                {
                  model: User,
                  where: {
                    id: [receiver.id, session.user.id],
                  },
                  attributes: ['id', 'displayName'],
                  through: { attributes: ['id', 'isBlocked', 'lastReadAt'] },
                },
                {
                  model: Message,
                  attributes: ['id', 'isFile', 'content', 'createdAt'],
                  order: [['createdAt', 'DESC']],
                  limit: 1,
                  separate: true,
                },
              ],
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
            attributes: ['id', 'lastMessageAt'],
            include: {
              model: User,
              attributes: ['id', 'displayName'],
              through: { attributes: ['id', 'isBlocked', 'lastReadAt'] },
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

exports.getChat = function (req, res) {
  const { roomId } = req.params;
  const senderId = req.session.user.id;

  Chatroom.findOne({
    attributes: ['id'],
    where: { id: roomId },
    include: [
      {
        model: User,
        where: {
          id: senderId,
        },
        attributes: ['id'],
        through: { attributes: [] },
      },
      {
        model: Message,
        attributes: [
          'id',
          'isFile',
          'content',
          'fileType',
          'fileName',
          'fileSize',
          'senderId',
          'createdAt',
        ],
        order: [['createdAt', 'DESC']],
        separate: true,
      },
    ],
  })
    .then((chatroom) => {
      if (!chatroom) throw new Error();

      res.status(200).json(formatMessagesList(chatroom.Messages, senderId));
    })
    .catch((errors) => {
      console.log(errors);
      res.status(500).json({ errors: { root: 'Something went wrong.' } });
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
  const { roomId, content, fileType, fileName, fileSize, isFile } = req.body;
  const senderId = req.session.user.id;

  if (roomId.trim() === '') return res.status(400).json();
  if (content.trim() === '') return res.status(400).json();

  sequelize
    .transaction((t) =>
      Chatroom.findByPk(roomId, {
        attributes: ['id', 'lastMessageAt'],
        include: {
          model: User,
          attributes: ['id'],
          through: { attributes: ['id', 'isBlocked', 'lastReadAt'] },
        },
        transaction: t,
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

          return chatroom.update({ lastMessageAt: new Date() }, { transaction: t });
        })
        .then((chatroom) =>
          Promise.all([
            chatroom.createMessage(
              {
                content: he.encode(content, { allowUnsafeSymbols: true }),
                senderId,
                isFile,
                fileType,
                fileName,
                fileSize,
                chatroomMemberId: chatroom.Users.find((u) => u.id === senderId).ChatroomMember.id,
              },
              { transaction: t }
            ),
            ChatroomMember.update(
              { lastReadAt: new Date() },
              { where: { ChatroomId: roomId, UserId: senderId }, transaction: t }
            ),
          ])
        )
    )
    .then(([message]) => res.status(201).json(formatMessage(message, senderId)))
    .catch((error) => {
      console.log(error);
      if (error?.errors) res.status(400).json(error.errors);
      else res.status(500).json({ errors: { root: 'Something went wrong.' } });
    });
};

exports.deleteMessage = function (req, res) {
  const { id: messageId } = req.params;
  const senderId = req.session.user.id;

  sequelize
    .transaction((t) =>
      Message.findByPk(messageId, { transaction: t })
        .then((message) => {
          if (!message) throw new Error();

          if (senderId !== message.senderId) throw new Error();

          return message.destroy({ transaction: t });
        })
        .then((message) => {
          if (!message) throw new Error();

          return Chatroom.findByPk(message.roomId, {
            attributes: ['id', 'lastMessageAt', 'createdAt'],
            include: {
              model: Message,
              attributes: ['id', 'isFile', 'content', 'createdAt'],
              order: [['createdAt', 'DESC']],
              limit: 1,
              separate: true,
            },
            transaction: t,
          });
        })
        .then((chatroom) => {
          if (!chatroom) throw new Error();

          const lastMessage = chatroom?.Messages?.at(0);

          return chatroom.update(
            {
              lastMessageAt: lastMessage ? lastMessage.createdAt : chatroom.createdAt,
            },
            { transaction: t }
          );
        })
    )
    .then((chatroom) => res.status(200).json(formatChatroom(chatroom)))
    .catch((error) => {
      if (error?.errors) res.status(400).json(error.errors);
      else res.status(500).json({ errors: { root: 'Something went wrong.' } });
    });
};

exports.putUpdateReadReceipt = function (req, res) {
  const { roomId, lastReadAt } = req.body;

  ChatroomMember.update(
    {
      lastReadAt,
    },
    {
      where: {
        ChatroomId: roomId,
        UserId: req.session.user.id,
        lastReadAt: {
          [Op.lt]: lastReadAt,
        },
      },
    }
  )
    .then((chatroomMembers) => {
      if (chatroomMembers.at(0) !== 1) throw new Error();

      res.status(200).json();
    })
    .catch(() => res.status(500).json({ errors: { root: 'Something went wrong.' } }));
};

exports.postGetFileSignature = function (req, res) {
  // Extracting Body Data.
  const { type, size } = req.body;

  // Validating body data.
  const result_file = schema_file.safeParse({ type, size });

  if (!result_file.success) {
    return res.status(409).json({
      errors: {
        file: result_file?.error?.issues?.at(0)?.message,
      },
    });
  }

  const fileKey = `messages/${crypto.randomUUID()}`;
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: type,
    ContentLength: size,
  });

  getSignedUrl(storage, command, {
    expiresIn: 60 * 3,
  })
    .then((signedUrl) => res.json({ signedUrl, fileKey }))
    .catch((error) => {
      console.log(error);
      res.status(500).json({ errors: { root: 'Failed to generate upload URL' } });
    });
};

exports.postDownloadFile = function (req, res) {
  const { fileKey, fileName } = req.body;

  const command = new GetObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: fileKey,
    ResponseContentDisposition: `attachment; filename="${fileName}"`,
  });

  getSignedUrl(storage, command, {
    expiresIn: 60,
  }).then((downloadURL) => res.json({ downloadURL }));
};

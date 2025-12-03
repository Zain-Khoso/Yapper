// Local Imports.
const getMetadata = require('../utils/metadata');

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

  res.render('chat', { metadata, path: 'chat', heading: 'Yaps' });
};

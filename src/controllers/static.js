// Local Imports.
const getMetadata = require('../utils/metadata');

exports.getLandingPage = function (req, res) {
  const metadata = getMetadata({
    title: 'The Simple Chat App',
    description:
      'Yapper is a lightweight hobby chat app built for learning and fun. Enjoy clean, fast, real-time conversations without distractions or complexity. Not a production tool—just a simple place to chat and experiment.',
    keywords: [
      'yapper',
      'chat app',
      'real-time chat',
      'hobby project',
      'express chat',
      'simple messaging',
      'minimal chat app',
      'nodejs chat',
      'learning project',
    ],
    url: { hostname: req.hostname, path: req.url },
  });

  res.render('landing', { metadata });
};

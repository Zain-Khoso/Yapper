// Local Imports.
const getMetadata = require('../utils/metadata');

exports.getCreateAccountPage = function (req, res) {
  const metadata = getMetadata({
    title: 'Create Your Account',
    description:
      'Yapper is a lightweight hobby chat app built for learning and fun. Enjoy clean, fast, real-time conversations without distractions or complexity. Create Your Yapper Account',
    keywords: ['yapper', 'account creation', 'user creation', 'signup', 'registration'],
    url: { hostname: req.hostname, path: req.url },
  });

  res.render('create-account', { metadata });
};

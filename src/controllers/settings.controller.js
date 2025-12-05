// Local Imports.
const getMetadata = require('../utils/metadata');

exports.getSettingsPage = function (_, res, __) {
  res.redirect('/settings/account');
};

exports.getAccountPage = function (req, res, _) {
  const metadata = getMetadata({
    title: 'Account Settings',
    description:
      'Manage your Yapper account preferences. Update personal information, adjust privacy and security options, change your credentials, and customize your overall app experience—all from one place.',
    keywords: [
      'account settings',
      'user settings',
      'profile settings',
      'change email',
      'change password',
      'privacy settings',
      'security settings',
      'Yapper account',
      'manage account',
    ],
    url: { hostname: req.hostname, path: req.url },
  });

  res.render('account', {
    metadata,
    path: 'settings',
    heading: 'Settings',
    user: req.session.user,
  });
};

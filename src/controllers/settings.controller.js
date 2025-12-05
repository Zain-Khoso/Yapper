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
    path: 'account',
    heading: 'Settings',
    user: req.session.user,
  });
};

exports.getPreferencesPage = function (req, res, _) {
  const metadata = getMetadata({
    title: 'Preferences',
    description:
      'Customize your Yapper experience. Adjust theme, notifications, accessibility options, and other app preferences to make Yapper feel just the way you like it.',
    keywords: [
      'preferences',
      'user preferences',
      'theme settings',
      'notification settings',
      'accessibility settings',
      'app customization',
      'Yapper preferences',
      'personalize Yapper',
    ],
    url: { hostname: req.hostname, path: req.url },
  });

  res.render('preferences', {
    metadata,
    path: 'settings',
    heading: 'Settings',
    user: req.session.user,
  });
};

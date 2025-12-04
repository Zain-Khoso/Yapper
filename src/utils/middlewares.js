// Middleware for protecting routes from already signed in users.
exports.protectFromAuthenticatedUsers = function (req, res, next) {
  const isAuthenticated = req?.session?.isAuthenticated;

  if (req.method === 'GET') {
    if (!isAuthenticated) next();
    else res.redirect('/chat');
  } else {
    if (!isAuthenticated) next();
    else res.status(401).json({ errors: { root: 'Invalid Request.' } });
  }
};

// Middleware for protecting routes from non-signed in users.
exports.protectFromUnAuthenticatedUsers = function (req, res, next) {
  const isAuthenticated = req?.session?.isAuthenticated;

  if (req.method === 'GET') {
    if (isAuthenticated) next();
    else res.redirect('/login');
  } else {
    if (isAuthenticated) next();
    else res.status(401).json({ errors: { root: 'Invalid Request.' } });
  }
};

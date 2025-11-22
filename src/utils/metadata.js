module.exports = function getMetadata({
  title = '',
  absoluteTitle = '',
  description = '',
  keywords = [],
  url = { hostname: 'localhost', path: '/' },
}) {
  // Title.
  if (absoluteTitle !== '') title = absoluteTitle;
  else if (title === '') title = 'Yapper';
  else title = `${title} | Yapper`;

  // Description.
  if (!description)
    description =
      "Yapper is a simple hobby chat app built for learning, experimenting, and chatting with friends. It's lightweight, real-time, and not meant for sensitive or important communication. Use at your own risk.";

  // Page URL.
  let baseURL;

  if (url.hostname === 'localhost') baseURL = `http://${url.hostname}:${process.env.PORT}`;
  else baseURL = `https://${url.hostname}`;

  const pageURL = baseURL + url.path;
  const landingPage = baseURL + '/';
  const imageURL = baseURL + '/images/brand/opengraph.png';
  const faviconLight = baseURL + '/images/brand/favicon-light.png';
  const faviconDark = baseURL + '/images/brand/favicon-dark.png';

  return {
    title,
    faviconLight,
    faviconDark,
    description,
    keywords: [
      'yapper',
      'chat',
      'messaging',
      'hobby-project',
      'simple',
      'fast',
      ...keywords,
    ].join(),
    author: 'https://zain-khoso.vercel.app',
    pageURL,
    landingPage,
    opengraph: {
      siteName: 'Yapper',
      imageURL,
    },
  };
};

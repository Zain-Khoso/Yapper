// Constants.
const DEFAULTS = {
  siteName: 'Yapper',
  description:
    "Yapper is a simple hobby chat app built for learning, experimenting, and chatting with friends. It's lightweight, real-time, and not meant for sensitive or important communication. Use at your own risk.",
  keywords: ['yapper', 'chat', 'messaging', 'hobby-project', 'real-time', 'simple', 'fast'],
};

module.exports = function getMetadata({
  title = '',
  absoluteTitle = '',
  description = '',
  keywords = [],
  baseURL,
  pagePath,
} = {}) {
  let finalTitle;

  if (absoluteTitle) finalTitle = absoluteTitle;
  else if (title) finalTitle = `${title} | ${DEFAULTS.siteName}`;
  else finalTitle = DEFAULTS.siteName;

  const finalDescription = description || DEFAULTS.description;

  const pageURL = baseURL + pagePath;

  const assets = {
    faviconLight: `${baseURL}/assets/brand/favicon-light.png`,
    faviconDark: `${baseURL}/assets/brand/favicon-dark.png`,
    ogImageLight: `${baseURL}/assets/brand/opengraph-light.png`,
    ogImageDark: `${baseURL}/assets/brand/opengraph-dark.png`,
  };

  const finalKeywords = [...new Set([...DEFAULTS.keywords, ...keywords])].join(', ');

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: finalKeywords,

    author: 'https://zain-khoso.vercel.app',
    pageURL,
    landingPage: baseURL + '/',

    faviconLight: assets.faviconLight,
    faviconDark: assets.faviconDark,

    openGraph: {
      type: 'website',
      siteName: DEFAULTS.siteName,
      title: finalTitle,
      description: finalDescription,
      url: pageURL,
      image: assets.ogImageLight,
    },

    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      image: assets.ogImageLight,
    },
  };
};

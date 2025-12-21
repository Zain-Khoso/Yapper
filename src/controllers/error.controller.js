// Local Imports.
import { serializeResponse } from '../utils/serializers.js';
import getMetadata from '../utils/metadata.js';

async function notFoundError(_, res) {
  return res.status(404).json(serializeResponse({}, { root: 'This is not a valid Endpoint.' }));
}

async function serverError(error, _, res, __) {
  console.log('\n API server error: ', error, '\n');

  return res.status(500).json(serializeResponse({}, { root: 'Something went wrong.' }));
}

function getNotFoundPage(req, res) {
  const metadata = getMetadata({
    title: 'Page Not Found',
    description:
      'The page you are looking for does not exist or may have been moved. Return to Yapper to continue chatting.',
    keywords: ['404', 'page not found', 'error page', 'yapper'],
    baseURL: req.protocol + '://' + req.get('host'),
    pagePath: req.originalUrl,
  });

  res.status(404).render('not-found', { metadata, bundleName: 'landing' });
}

function getServerErrorPage(error, req, res, _) {
  const pagePath = req.originalUrl;

  const metadata = getMetadata({
    title: 'Internal Server Error',
    description:
      'Something went wrong on our end. We are working to fix the issue. Please try refreshing the page or return to Yapper to continue chatting.',
    keywords: ['500', 'server error', 'internal error', 'yapper'],
    baseURL: req.protocol + '://' + req.get('host'),
    pagePath,
  });

  console.log(`\n Server Error (${pagePath}): `, error, '\n');

  res.status(500).render('server-error', { metadata, bundleName: 'landing' });
}

export { notFoundError, serverError, getNotFoundPage, getServerErrorPage };

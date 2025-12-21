// Local Imports.
import { serializeResponse } from '../utils/serializers.js';

async function notFoundError(_, res) {
  return res.status(404).json(serializeResponse({}, { root: 'This is not a valid Endpoint.' }));
}

async function serverError(error, _, res, __) {
  console.log('\n API server error: ', error, '\n');

  return res.status(500).json(serializeResponse({}, { root: 'Something went wrong.' }));
}

export { notFoundError, serverError };

// Local Imports.
import { serializeResponse } from '../utils/serializers.js';

async function serverError(error, _, res, __) {
  console.log('\n', error, '\n');

  return res.status(500).json(serializeResponse({}, { root: 'Something went wrong.' }));
}

export { serverError };

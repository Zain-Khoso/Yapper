// Lib Imports.
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Local Imports.
import { getZodError, schema_PictureObject } from '../utils/validations.js';
import { serializeResponse } from '../utils/serializers.js';
import storage from '../utils/storage.js';

async function signPictureUpload(req, res) {
  // Working body data.
  const picture = req.body;
  const result = schema_PictureObject.safeParse(picture);
  if (!result.success) {
    return res.status(409).json(serializeResponse({}, { picture: getZodError(result) }));
  }

  const fileName = picture.name.split('.');
  const fileKey = `pictures/${crypto.randomUUID()}${fileName.length > 1 ? '.' + fileName.at(-1) : ''}`;
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: picture.type,
    ContentLength: picture.size,
  });

  const signature = await getSignedUrl(storage, command, { expiresIn: 60 });
  res
    .status(200)
    .json(
      serializeResponse({ signature, url: process.env.CLOUDFLARE_R2_PUBLIC_URL + '/' + fileKey })
    );
}

export { signPictureUpload };

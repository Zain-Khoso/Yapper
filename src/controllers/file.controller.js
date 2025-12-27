// Lib Imports.
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Local Imports.
import storage from '../utils/storage.js';
import { deleteOldImage, generateFileKey } from '../utils/helpers.js';
import { serializeResponse } from '../utils/serializers.js';
import {
  getZodError,
  schema_MessageFileObject,
  schema_PictureObject,
} from '../utils/validations.js';

async function signPictureUpload(req, res) {
  // Working body data.
  const picture = req.body;
  const result = schema_PictureObject.safeParse(picture);
  if (!result.success) {
    return res.status(409).json(serializeResponse({}, { picture: getZodError(result) }));
  }

  const fileKey = generateFileKey(picture.name, 'pictures');
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

async function deletePicture(req, res) {
  const user = req.user;

  await deleteOldImage(user.picture);

  await user.update({ picture: null });

  return res.status(200).json(serializeResponse());
}

async function signMessageFileUpload(req, res) {
  // Working body data.
  const file = req.body;

  const result = schema_MessageFileObject.safeParse(file);
  if (!result.success) {
    return res.status(409).json(serializeResponse({}, { file: getZodError(result) }));
  }

  const fileKey = generateFileKey(file.name, 'messages');
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: file.type,
    ContentLength: file.size,
  });

  const signature = await getSignedUrl(storage, command, { expiresIn: 60 });
  res
    .status(200)
    .json(
      serializeResponse({ signature, url: process.env.CLOUDFLARE_R2_PUBLIC_URL + '/' + fileKey })
    );
}

export { signPictureUpload, deletePicture, signMessageFileUpload };

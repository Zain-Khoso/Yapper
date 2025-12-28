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
import Message from '../models/message.model.js';

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
  const user = req.user;

  // Working body data.
  const { roomId, fileName, fileType, fileSize } = req.body;

  const result = schema_MessageFileObject.safeParse({
    name: fileName,
    type: fileType,
    size: fileSize,
  });
  if (!result.success) {
    return res.status(409).json(serializeResponse({}, { file: getZodError(result) }));
  }

  // Paywall.
  const filesCount = await Message.count({
    where: {
      roomId,
      userId: user.id,
      isFile: true,
    },
  });
  if (user.plan === 'silver') {
    if (filesCount >= 2) {
      return res
        .status(402)
        .json(serializeResponse({}, { root: 'Upgrade to Gold plan to send upto 50 files.' }));
    }

    const messagesCount = await Message.count({
      where: {
        roomId,
        userId: user.id,
      },
    });
    if (messagesCount >= 25) {
      return res
        .status(402)
        .json(serializeResponse({}, { root: 'Upgrade to Gold plan to send unlimited messages.' }));
    }
  }
  if (user.plan === 'gold' && filesCount >= 50) {
    return res
      .status(402)
      .json(serializeResponse({}, { root: 'Cannot send anymore files in this chatroom.' }));
  }

  const fileKey = generateFileKey(fileName, 'messages');
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
    ContentLength: fileSize,
  });

  const signature = await getSignedUrl(storage, command, { expiresIn: 60 });
  res
    .status(200)
    .json(
      serializeResponse({ signature, url: process.env.CLOUDFLARE_R2_PUBLIC_URL + '/' + fileKey })
    );
}

export { signPictureUpload, deletePicture, signMessageFileUpload };

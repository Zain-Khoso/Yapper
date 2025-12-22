// Lib Imports.
import { Router } from 'express';

// Local Imports.
import { allowAuthenticatedUserOnly } from '../utils/auth.utils.js';
import { signPictureUpload, deletePicture } from '../controllers/file.controller.js';

// File Upload Routes.
const router = Router();

// POST : Uploads user picture.
router.post('/picture', allowAuthenticatedUserOnly, signPictureUpload);

// DELETE : Deletes user picture.
router.delete('/picture', allowAuthenticatedUserOnly, deletePicture);

export default router;

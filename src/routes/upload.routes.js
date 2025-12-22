// Lib Imports.
import { Router } from 'express';

// Local Imports.
import { signPictureUpload, deletePicture } from '../controllers/upload.controller.js';
import { allowAuthenticatedUserOnly } from '../utils/auth.utils.js';

// File Upload Routes.
const router = Router();

// POST : Sign user picture upload.
router.post('/picture', allowAuthenticatedUserOnly, signPictureUpload);

// DELETE : Deletes current user's picture.
router.delete('/delete', allowAuthenticatedUserOnly, deletePicture);

export default router;

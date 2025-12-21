// Lib Imports.
import { Router } from 'express';

// Local Imports.
import { signPictureUpload } from '../controllers/upload.controller.js';

// File Upload Routes.
const router = Router();

// POST : Sign user picture upload.
router.post('/picture', signPictureUpload);

export default router;

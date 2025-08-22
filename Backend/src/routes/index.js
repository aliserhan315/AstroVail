import { Router } from 'express';
import auth from './auth.js';
import stars from './stars.js';

const router = Router();

router.use('/auth', auth);
router.use('/stars', stars);

export default router;

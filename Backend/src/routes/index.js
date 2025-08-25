import { Router } from 'express';
import auth from './auth.js';
import stars from './stars.js';
import events from './events.js';
import notifications from './notifications.js';

const router = Router();

router.use('/auth', auth);
router.use('/stars', stars);
router.use('/events', events);
router.use('/notifications', notifications);
export default router;

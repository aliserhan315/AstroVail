import { Router } from 'express';
import auth from './auth.js';
import stars from './stars.js';
import events from './events.js';
import notifications from './notifications.js';
import checkout from './checkout.js';
import cart from './cart.js';
const router = Router();

router.use('/auth', auth);
router.use('/stars', stars);
router.use('/events', events);
router.use('/notifications', notifications);
router.use('/checkout', checkout);
router.use('/cart', cart); 
export default router;

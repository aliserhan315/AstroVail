import { Router } from 'express';
import { getStars, createStar, updateStar, getStar, deleteStar } from '../controllers/starController.js';

const router = Router();

router.get('/', getStars);
router.post('/', createStar);
router.get('/:id', getStar);
router.patch('/:id', updateStar);
router.delete('/:id', deleteStar);

export default router;

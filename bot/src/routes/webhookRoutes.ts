import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { whatsappWebhook } from '../controllers/webhookController';

const router = Router();

router.post('/whatsapp', asyncHandler(whatsappWebhook));

export default router;


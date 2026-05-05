import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { analyseClaim, acceptReport, getClaim, getReport } from '../controllers/apiController';

const router = Router();

router.get('/claim/:id', asyncHandler(getClaim));
router.post('/claim/:id/analyse', asyncHandler(analyseClaim));
router.get('/report/:claimId', asyncHandler(getReport));
router.post('/report/:claimId/accept', asyncHandler(acceptReport));

export default router;


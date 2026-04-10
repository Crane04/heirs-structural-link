import { Router, Request, Response } from 'express';
import { Claim, DamageReport, connectDB } from './db';
import { sendWhatsApp, buildClaimReadyMessage, buildFraudFlagMessage } from './notify';
import { clearSession } from './session';

const router = Router();

// GET /api/claim/:id — web app fetches claim status
router.get('/claim/:id', async (req: Request, res: Response) => {
  try {
    await connectDB(process.env.MONGODB_URI!);
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    res.json(claim);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/claim/:id/analyse — web app sends frames here after upload
router.post('/claim/:id/analyse', async (req: Request, res: Response) => {
  try {
    await connectDB(process.env.MONGODB_URI!);

    const { frameUrls, carModel } = req.body as { frameUrls: string[]; carModel: string };
    const claimId = req.params.id;

    const claim = await Claim.findById(claimId);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    // Update status to processing
    claim.status = 'processing';
    claim.carModel = carModel;
    await claim.save();

    // Call Python AI service
    const aiRes = await fetch(`${process.env.AI_SERVICE_URL}/analyse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame_urls: frameUrls, car_model: carModel }),
    });
    if (!aiRes.ok) throw new Error(`AI service error: ${aiRes.statusText}`);

    const aiData = await aiRes.json() as {
      predictions: any[];
      total_payout_ngn: number;
      fraud_flagged: boolean;
    };

    // Save report to MongoDB
    const report = await DamageReport.create({
      claimId: claim._id,
      predictions: aiData.predictions,
      totalPayoutNgn: aiData.total_payout_ngn,
      fraudFlagged: aiData.fraud_flagged,
    });

    // Update claim status
    claim.status = aiData.fraud_flagged ? 'flagged' : 'complete';
    await claim.save();

    // Notify Mr. Bayo via WhatsApp
    const whatsappTo = `whatsapp:${claim.phoneNumber}`;
    if (aiData.fraud_flagged) {
      await sendWhatsApp(whatsappTo, buildFraudFlagMessage());
    } else {
      await sendWhatsApp(whatsappTo, buildClaimReadyMessage(claimId, aiData.total_payout_ngn));
    }

    res.json({ reportId: report._id, fraudFlagged: aiData.fraud_flagged });
  } catch (err) {
    console.error('[Analyse] Error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// GET /api/report/:claimId — web app fetches the full damage report
router.get('/report/:claimId', async (req: Request, res: Response) => {
  try {
    await connectDB(process.env.MONGODB_URI!);
    const report = await DamageReport.findOne({ claimId: req.params.claimId });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/report/:claimId/accept — Mr. Bayo taps Accept Payout
router.post('/report/:claimId/accept', async (req: Request, res: Response) => {
  try {
    await connectDB(process.env.MONGODB_URI!);

    const report = await DamageReport.findOne({ claimId: req.params.claimId });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    report.acceptedAt = new Date();
    await report.save();

    const claim = await Claim.findById(req.params.claimId);
    if (claim) {
      await clearSession(claim.phoneNumber);
      await sendWhatsApp(
        `whatsapp:${claim.phoneNumber}`,
        `🎉 *Payout accepted!*\n\n` +
        `Your claim has been approved. Heirs Insurance will process your payment shortly.\n\n` +
        `Thank you for using Heirs Structural-Link AI. Drive safe! 🚗`
      );
    }

    res.json({ success: true, acceptedAt: report.acceptedAt });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

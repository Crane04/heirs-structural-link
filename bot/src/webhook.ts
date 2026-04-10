import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Claim, connectDB } from './db';
import { setSession, getSession } from './session';
import { sendWhatsApp, buildWelcomeMessage } from './notify';

const router = Router();

// POST /webhook/whatsapp — Twilio sends all incoming WhatsApp messages here
router.post('/whatsapp', async (req: Request, res: Response) => {
  try {
    await connectDB(process.env.MONGODB_URI!);

    const body: string = (req.body.Body || '').trim().toLowerCase();
    const from: string = req.body.From || ''; // e.g. whatsapp:+2348012345678
    const phoneNumber = from.replace('whatsapp:', '');

    // Check if this phone already has an active session
    const existingClaimId = await getSession(phoneNumber);

    if (existingClaimId) {
      // Returning user — remind them of their active claim
      await sendWhatsApp(from,
        `You already have an active claim in progress.\n\n` +
        `Continue your scan here:\n` +
        `${process.env.WEB_APP_URL}/claim/${existingClaimId}/scan`
      );
      return res.status(200).send('<Response></Response>');
    }

    // New user or any greeting message — create a new claim
    if (body.includes('hello') || body.includes('hi') || body.includes('claim') || body.length < 20) {
      const claimId = uuidv4();
      const claimUrl = `${process.env.WEB_APP_URL}/claim/${claimId}/scan`;

      await Claim.create({
        phoneNumber,
        status: 'initiated',
        claimUrl,
      });

      await setSession(phoneNumber, claimId);
      await sendWhatsApp(from, buildWelcomeMessage(claimId));

      return res.status(200).send('<Response></Response>');
    }

    // Unknown message
    await sendWhatsApp(from,
      `Hi! To start a new insurance claim, simply reply *Hello* and I'll guide you through the process. 👋`
    );

    res.status(200).send('<Response></Response>');
  } catch (err) {
    console.error('[Webhook] Error:', err);
    res.status(500).send('<Response></Response>');
  }
});

export default router;

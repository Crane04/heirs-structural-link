import type { Request, Response } from 'express';
import { getSession, setSession } from '../session';
import { sendWhatsApp, buildWelcomeMessage } from '../notify';
import { createClaimForPhone } from '../services/claimService';
import { env } from '../config/env';

export async function whatsappWebhook(req: Request, res: Response) {
  try {
    const body: string = (req.body.Body || '').trim().toLowerCase();
    const from: string = req.body.From || ''; // e.g. whatsapp:+2348012345678
    const phoneNumber = from.replace('whatsapp:', '');

    const existingClaimId = await getSession(phoneNumber);
    if (existingClaimId) {
      await sendWhatsApp(
        from,
        `You already have an active claim in progress.\n\n` +
          `Continue your scan here:\n` +
          `${env.WEB_APP_URL}/claim/${existingClaimId}/scan`
      );
      return res.status(200).send('<Response></Response>');
    }

    const isGreeting =
      body.includes('hello') ||
      body.includes('hi') ||
      body.includes('claim') ||
      body.length < 20;

    if (isGreeting) {
      const { claimId } = await createClaimForPhone(phoneNumber);
      await setSession(phoneNumber, claimId);
      await sendWhatsApp(from, buildWelcomeMessage(claimId));
      return res.status(200).send('<Response></Response>');
    }

    await sendWhatsApp(
      from,
      `Hi! To start a new insurance claim, simply reply *Hello* and I'll guide you through the process. 👋`
    );
    return res.status(200).send('<Response></Response>');
  } catch (err) {
    console.error('[Webhook] Error:', err);
    // Twilio retries on non-2xx; acknowledge to avoid duplicate messages.
    return res.status(200).send('<Response></Response>');
  }
}

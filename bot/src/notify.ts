import twilio from "twilio";
import { env } from "./config/env";

let client: twilio.Twilio;

function getClient(): twilio.Twilio {
  if (!client) {
    client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }

  return client;
}

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  const normalised = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  await getClient().messages.create({
    from: env.TWILIO_WHATSAPP_FROM,
    to: normalised,
    body,
  });
}

export function buildClaimReadyMessage(
  claimId: string,
  totalPayoutNgn: number,
): string {
  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(totalPayoutNgn);

  return (
    `✅ *Your damage report is ready, Mr. Bayo.*\n\n` +
    `Our AI has completed the structural analysis.\n` +
    `Estimated payout: *${formatted}*\n\n` +
    `View your full report and accept your payout here:\n` +
    `${env.WEB_APP_URL}/claim/${claimId}/report`
  );
}

export function buildWelcomeMessage(claimId: string, name = "there"): string {
  return (
    `👋 Hi ${name}! Are you safe?\n\n` +
    `I'm the Heirs Insurance digital inspector. I'll help you assess your vehicle damage right now — no waiting for an adjuster.\n\n` +
    `Please tap the link below to start your scan:\n` +
    `${env.WEB_APP_URL}/claim/${claimId}/scan\n\n` +
    `The scan takes less than 2 minutes. 📱`
  );
}

export function buildFraudFlagMessage(): string {
  return (
    `⚠️ *Claim flagged for review.*\n\n` +
    `Our physics verification system has detected an inconsistency in your claim. ` +
    `A Heirs claims officer will contact you within 24 hours to resolve this.\n\n` +
    `Reference your claim ID when they call.`
  );
}

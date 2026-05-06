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

type FaultPrediction = {
  zone?: string;
  damageType?: string;
  severity?: string;
  dentDepthCm?: number;
  payoutParts?: string;
};

function prettyZone(zone?: string): string {
  if (!zone) return "Unknown zone";
  return zone.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function prettySeverity(severity?: string): string {
  if (!severity) return "Unknown";
  return severity.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function depthToPlain(depthCm?: number): string | null {
  if (typeof depthCm !== "number" || Number.isNaN(depthCm)) return null;
  if (depthCm < 0.5) return "very light dent";
  if (depthCm < 2.0) return "light dent";
  if (depthCm < 7.0) return "moderate dent";
  if (depthCm < 14.0) return "deep dent";
  if (depthCm < 22.0) return "very deep dent";
  return "severe deformation";
}

export function formatFaults(predictions: FaultPrediction[], maxItems = 5): string {
  if (!predictions || predictions.length === 0) return "No faults detected.";

  const items = predictions.slice(0, maxItems).map((p) => {
    const zone = prettyZone(p.zone);
    const damage = p.damageType ? `${p.damageType}` : "damage";
    const severity = p.severity ? `${p.severity}` : "unknown severity";
    const depth = typeof p.dentDepthCm === "number" ? `, ${p.dentDepthCm.toFixed(1)}cm` : "";
    const parts = p.payoutParts ? ` (parts: ${p.payoutParts})` : "";
    return `• ${zone} — ${damage} (${severity}${depth})${parts}`;
  });

  const more = predictions.length > maxItems ? `\n• +${predictions.length - maxItems} more` : "";
  return items.join("\n") + more;
}

export function formatConciseSummary(input: {
  fraudFlagged: boolean;
  totalPayoutNgn: number;
  claimId?: string;
  predictions: FaultPrediction[];
  maxFaults?: number;
}): string {
  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(input.totalPayoutNgn);

  const status = input.fraudFlagged ? "FLAGGED" : "COMPLETE";
  const preds = input.predictions || [];
  const maxFaults = input.maxFaults ?? 3;

  const faultsText =
    preds.length === 0
      ? "No visible faults detected from this scan."
      : preds
          .slice(0, maxFaults)
          .map((p) => {
            const zone = prettyZone(p.zone);
            const sev = prettySeverity(p.severity);
            const depthPlain = depthToPlain(p.dentDepthCm);
            return depthPlain ? `${zone} (${sev}, ${depthPlain})` : `${zone} (${sev})`;
          })
          .join("; ") + (preds.length > maxFaults ? `; +${preds.length - maxFaults} more` : "");

  const claimLine = input.claimId ? `Claim ID: ${input.claimId}\n` : "";

  return (
    `Status: ${status}\n` +
    `${formatted}\n` +
    claimLine +
    `Summary: ${faultsText}`
  );
}

export function formatConciseFaultSummary(predictions: FaultPrediction[], maxFaults = 3): string {
  const preds = predictions || [];
  if (preds.length === 0) return "No visible faults detected from this scan.";
  const items = preds.slice(0, maxFaults).map((p) => {
    const zone = prettyZone(p.zone);
    const sev = prettySeverity(p.severity);
    const depthPlain = depthToPlain(p.dentDepthCm);
    return depthPlain ? `${zone} (${sev}, ${depthPlain})` : `${zone} (${sev})`;
  });
  const more = preds.length > maxFaults ? `; +${preds.length - maxFaults} more` : "";
  return items.join("; ") + more;
}

export function buildClaimReadyMessage(
  claimId: string,
  totalPayoutNgn: number,
  predictions: FaultPrediction[] = [],
  summaryOverride?: string,
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
    `Summary: ${summaryOverride || formatConciseFaultSummary(predictions)}\n\n` +
    `Detected faults:\n` +
    `${formatFaults(predictions)}\n\n` +
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

export function buildFraudFlagMessage(predictions: FaultPrediction[] = [], summaryOverride?: string): string {
  return (
    `⚠️ *Claim flagged for review.*\n\n` +
    `Our physics verification system has detected an inconsistency in your claim. ` +
    `A Heirs claims officer will contact you within 24 hours to resolve this.\n\n` +
    (summaryOverride ? `Summary: ${summaryOverride}\n\n` : "") +
    (predictions.length
      ? `Detected faults:\n${formatFaults(predictions)}\n\n`
      : "") +
    `Reference your claim ID when they call.`
  );
}

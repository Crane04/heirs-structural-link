import TopNav from "../components/layout/TopNav";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import HeroVisualization from "../components/HeroVisualization";
import {
  FaComments,
  FaCamera,
  FaBrain,
  FaLightbulb,
  FaShieldAlt,
  FaCheckCircle,
  FaCommentDots,
  FaWhatsapp,
  FaCrosshairs,
  FaChartLine,
} from "react-icons/fa";

const STEPS = [
  {
    title: "Start Claim",
    body: "Start on WhatsApp and answer a few quick questions to open your claim.",
  },
  {
    title: "Scan Vehicle",
    body: "Get a secure link to capture photos of your vehicle from your phone.",
  },
  {
    title: "Get Assessment",
    body: "Receive an instant damage assessment, including hidden structural risk signals.",
  },
];

const FEATURES = [
  {
    title: "Fast Scan",
    body: "Low-latency processing optimized for real-world networks.",
  },
  {
    title: "AI Detection",
    body: "Detects dents, cracks, deformation and scratches.",
  },
  {
    title: "Depth Estimation",
    body: "Estimates dent depth to infer internal structural risk.",
  },
  {
    title: "Fraud Check",
    body: "Physics verification flags inconsistent claims for review.",
  },
  {
    title: "Instant Payout",
    body: "Estimates payout using Ladipo Market seed pricing.",
  },
  {
    title: "WhatsApp Flow",
    body: "Simple onboarding from chat → scan → report.",
  },
];

const FAQ = [
  {
    q: "How fast is the damage detection process?",
    a: "A typical scan takes under 2 minutes, and the report is generated shortly after upload.",
  },
  {
    q: "Is the AI accurate as a manual inspection?",
    a: "It’s designed to speed up triage and provide consistent estimates. Flagged cases are reviewed by a claims officer.",
  },
  {
    q: "How do I receive my payout?",
    a: "After you accept the payout in the report page, Heirs processes payment based on your policy and claim terms.",
  },
  {
    q: "Can I use it for commercial vehicles?",
    a: "Current support is limited to select models. More vehicles can be added by expanding the structural lookup tables.",
  },
  {
    q: "Do I need a special app installed?",
    a: "No. You start on WhatsApp and use your phone browser to complete the scan.",
  },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Landing() {
  const whatsappUrl = import.meta.env.VITE_WHATSAPP_START_URL as
    | string
    | undefined;

  return (
    <div className="min-h-screen bg-offwhite text-ink">
      <TopNav active="claims" />

      <div className="mx-auto w-full max-w-6xl px-4 py-14">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.05] tracking-tight">
              Detect hidden vehicle damage instantly
            </h1>
            <p className="mt-5 text-ink/65 text-base sm:text-lg max-w-xl">
              Start your claim on WhatsApp. Structural AI detects visible and
              hidden vehicle damage in seconds. Get a structural assessment in
              under 5 minutes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={whatsappUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="whatsapp"
                  disabled={!whatsappUrl}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl"
                >
                  Start on WhatsApp
                  <span className="text-offwhite/80">→</span>
                </Button>
              </a>
              <Button
                variant="secondary"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-ink/20"
                onClick={() => scrollToId("how")}
              >
                See how it works
              </Button>
            </div>

            {!whatsappUrl && (
              <p className="mt-3 text-xs text-ink/45">
                WhatsApp link not configured. Set{" "}
                <code className="text-ink/70">VITE_WHATSAPP_START_URL</code> in{" "}
                <code className="text-ink/70">web/.env</code>.
              </p>
            )}
          </div>

          <Card className="p-6 lg:p-7 relative overflow-hidden">
            <div className="relative">
              <HeroVisualization />

              <div className="mt-5 flex items-center justify-start gap-4">
                <style>{`
                  @keyframes pulse-green {
                    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                    50% { opacity: 0.7; }
                    75% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
                  }
                  .pulse-dot {
                    animation: pulse-green 2s infinite;
                  }
                `}</style>
                <div className="hs-chip">
                  <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot inline-block" />
                  Structural AI online
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* How it works */}
        <div id="how" className="mt-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold">How it works</h2>
              <p className="text-ink/50 text-sm mt-2">
                Three simple steps to resolve your claim.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((s, i) => {
              const icons = [
                <FaWhatsapp key="0" />,
                <FaCrosshairs key="1" />,
                <FaChartLine key="2" />,
              ];
              return (
                <Card key={s.title} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="hs-chip">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-ink/5 border border-ink/10 flex items-center justify-center text-ink text-lg">
                      {icons[i]}
                    </div>
                  </div>
                  <div className="mt-5 font-semibold">{s.title}</div>
                  <div className="mt-2 text-sm text-ink/55">{s.body}</div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold">Features</h2>
          <p className="text-ink/50 text-sm mt-2">
            Designed for speed, clarity, and claims confidence.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const featureIcons = [
                <FaLightbulb key="0" />,
                <FaBrain key="1" />,
                <FaCheckCircle key="2" />,
                <FaShieldAlt key="3" />,
                <FaCheckCircle key="4" />,
                <FaCommentDots key="5" />,
              ];
              return (
                <Card key={f.title} className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-ink/5 border border-ink/10 flex items-center justify-center text-ink text-lg">
                    {featureIcons[i]}
                  </div>
                  <div className="mt-4 font-semibold">{f.title}</div>
                  <div className="mt-2 text-sm text-ink/55">{f.body}</div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Supported vehicles */}
        <div className="mt-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold">Supported vehicles</h2>
              <p className="text-ink/50 text-sm mt-2">
                Our AI is specialized for top-tier automotive precision.
              </p>
            </div>
            <div className="text-xs text-ink/60 font-semibold hidden sm:block">
              VIEW ALL MODELS →
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "Toyota Camry",
                image:
                  "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop",
              },
              {
                name: "Honda Accord",
                image:
                  "https://media.ed.edmunds-media.com/honda/accord/2023/oem/2023_honda_accord_sedan_touring-hybrid_fq_oem_1_1600x1067.jpg",
              },
              {
                name: "Lexus RX",
                image:
                  "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=500&h=300&fit=crop",
              },
            ].map((vehicle) => (
              <Card key={vehicle.name} className="p-5">
                <div className="rounded-xl bg-surface2/50 border border-border/50 aspect-[16/9] overflow-hidden">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 font-semibold">{vehicle.name}</div>
                <div className="text-xs text-ink/45 mt-1">
                  FULL SUPPORT • 2020–2024
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-center">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 mx-auto max-w-3xl flex flex-col gap-3">
            {FAQ.map((item) => (
              <details key={item.q} className="hs-card px-5 py-4">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink/90">{item.q}</span>
                  <span className="text-ink/40">⌄</span>
                </summary>
                <p className="mt-3 text-sm text-ink/60">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20">
          <Card className="p-10 text-center">
            <h3 className="text-3xl font-bold">Ready to scan?</h3>
            <p className="mt-3 text-ink/55 text-sm">
              Join smart drivers who have simplified their insurance
              claims with Heirs AI.
            </p>
            <div className="mt-7 flex justify-center">
              <a href={whatsappUrl || "#"} target="_blank" rel="noreferrer">
                <Button
                  variant="whatsapp"
                  disabled={!whatsappUrl}
                  className="px-8 py-3 rounded-xl"
                >
                  Start on WhatsApp
                </Button>
              </a>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 pb-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink/40">
          <div className="font-semibold text-ink/70">
            Heirs Structural‑Link AI
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy protocol</span>
            <span>Terms of service</span>
            <span>API status</span>
            <span>Global network</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import TopNav from '../components/layout/TopNav';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const STEPS = [
  {
    title: 'WhatsApp Bot',
    body: 'Initiate your claim by sending a simple message to our automated assistant.',
  },
  {
    title: 'Scan Link',
    body: 'Receive a secure link to capture a quick vehicle scan from your phone.',
  },
  {
    title: 'AI Report',
    body: 'Our AI analyses structural integrity and generates a damage report instantly.',
  },
];

const FEATURES = [
  { title: 'Fast Scan', body: 'Low-latency processing optimized for real-world networks.' },
  { title: 'AI Detection', body: 'Detects dents, cracks, deformation and scratches.' },
  { title: 'Depth Estimation', body: 'Estimates dent depth to infer internal structural risk.' },
  { title: 'Fraud Check', body: 'Physics verification flags inconsistent claims for review.' },
  { title: 'Instant Payout', body: 'Estimates payout using Ladipo Market seed pricing.' },
  { title: 'WhatsApp Flow', body: 'Simple onboarding from chat → scan → report.' },
];

const FAQ = [
  {
    q: 'How fast is the damage detection process?',
    a: 'A typical scan takes under 2 minutes, and the report is generated shortly after upload.',
  },
  {
    q: 'Is the AI accurate as a manual inspection?',
    a: 'It’s designed to speed up triage and provide consistent estimates. Flagged cases are reviewed by a claims officer.',
  },
  {
    q: 'How do I receive my payout?',
    a: 'After you accept the payout in the report page, Heirs processes payment based on your policy and claim terms.',
  },
  {
    q: 'Can I use it for commercial vehicles?',
    a: 'Current support is limited to select models. More vehicles can be added by expanding the structural lookup tables.',
  },
  {
    q: 'Do I need a special app installed?',
    a: 'No. You start on WhatsApp and use your phone browser to complete the scan.',
  },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Landing() {
  const whatsappUrl = import.meta.env.VITE_WHATSAPP_START_URL as string | undefined;

  return (
    <div className="min-h-screen bg-offwhite text-ink">
      <TopNav active="claims" />

      <div className="mx-auto w-full max-w-6xl px-4 py-14">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.05] tracking-tight">
              Precision damage detection via AI
            </h1>
            <p className="mt-5 text-ink/65 text-base sm:text-lg max-w-xl">
              Start your claim instantly on WhatsApp. Our neural networks analyse structural integrity in seconds,
              ensuring accurate estimates without the wait.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href={whatsappUrl || '#'} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                <Button variant="whatsapp" disabled={!whatsappUrl} className="w-full sm:w-auto px-6 py-3 rounded-xl">
                  Start on WhatsApp
                  <span className="text-offwhite/80">→</span>
                </Button>
              </a>
              <Button
                variant="secondary"
                className="w-full sm:w-auto px-6 py-3 rounded-xl"
                onClick={() => scrollToId('how')}
              >
                See how it works
              </Button>
            </div>

            {!whatsappUrl && (
              <p className="mt-3 text-xs text-ink/45">
                WhatsApp link not configured. Set <code className="text-ink/70">VITE_WHATSAPP_START_URL</code> in{' '}
                <code className="text-ink/70">web/.env</code>.
              </p>
            )}
          </div>

          <Card className="p-6 lg:p-7 relative overflow-hidden">
            <div className="relative">
              <div className="rounded-2xl border border-border/60 bg-surface2/50 overflow-hidden aspect-[16/10] flex items-center justify-center">
                {/* simple inline "car" placeholder */}
                <svg width="520" height="220" viewBox="0 0 520 220" className="w-full h-full">
                  <rect x="0" y="0" width="520" height="220" fill="transparent" />
                  <path
                    d="M98 132c10-34 34-52 74-57 55-7 152-7 198 0 46 7 71 25 83 57l8 23c2 6-2 12-9 12H78c-7 0-11-6-9-12l8-23Z"
                    fill="rgba(6,20,37,0.06)"
                    stroke="rgba(116,227,211,0.35)"
                    strokeWidth="2"
                  />
                  <circle cx="165" cy="170" r="22" fill="rgba(6,20,37,0.04)" stroke="rgba(6,20,37,0.20)" />
                  <circle cx="360" cy="170" r="22" fill="rgba(6,20,37,0.04)" stroke="rgba(6,20,37,0.20)" />
                  <path
                    d="M170 98c18-20 42-28 72-30 52-4 96-4 140 0 30 2 52 10 70 30"
                    stroke="rgba(6,20,37,0.20)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-2xl font-bold text-ink">99.8%</div>
                  <div className="text-[11px] uppercase tracking-widest text-ink/50">Detection accuracy</div>
                </div>
                <div className="hs-chip">
                  <span className="w-2 h-2 rounded-full bg-ink" />
                  Structural engine active
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
              <p className="text-ink/50 text-sm mt-2">Three simple steps to resolve your claim.</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <Card key={s.title} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="hs-chip">{String(i + 1).padStart(2, '0')}</div>
                  <div className="w-9 h-9 rounded-xl bg-ink/5 border border-ink/10 flex items-center justify-center text-ink">
                    ■
                  </div>
                </div>
                <div className="mt-5 font-semibold">{s.title}</div>
                <div className="mt-2 text-sm text-ink/55">{s.body}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold">Features</h2>
          <p className="text-ink/50 text-sm mt-2">Designed for speed, clarity, and claims confidence.</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-6">
                <div className="w-10 h-10 rounded-xl bg-ink/5 border border-ink/10 flex items-center justify-center text-ink">
                  ●
                </div>
                <div className="mt-4 font-semibold">{f.title}</div>
                <div className="mt-2 text-sm text-ink/55">{f.body}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Supported vehicles */}
        <div className="mt-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold">Supported vehicles</h2>
              <p className="text-ink/50 text-sm mt-2">Our AI is specialized for top-tier automotive precision.</p>
            </div>
            <div className="text-xs text-ink/60 font-semibold hidden sm:block">VIEW ALL MODELS →</div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Toyota Camry', 'Honda Accord', 'Lexus RX'].map((m) => (
              <Card key={m} className="p-5">
                <div className="rounded-xl bg-surface2/50 border border-border/50 aspect-[16/9]" />
                <div className="mt-4 font-semibold">{m}</div>
                <div className="text-xs text-ink/45 mt-1">FULL SUPPORT • 2020–2024</div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
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
              Join thousands of drivers who have simplified their insurance claims with Heirs AI.
            </p>
            <div className="mt-7 flex justify-center">
              <a href={whatsappUrl || '#'} target="_blank" rel="noreferrer">
                <Button variant="whatsapp" disabled={!whatsappUrl} className="px-8 py-3 rounded-xl">
                  Start on WhatsApp
                </Button>
              </a>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 pb-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink/40">
          <div className="font-semibold text-ink/70">Heirs Structural‑Link AI</div>
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

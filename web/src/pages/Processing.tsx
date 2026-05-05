import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { claimApi } from '../api/client';
import ClaimShell from '../components/layout/ClaimShell';
import Card from '../components/ui/Card';
import Icon from '../components/ui/Icon';

const STEPS = [
  { label: 'Mapping surface geometry',        duration: 2500 },
  { label: 'Running depth estimation',         duration: 2500 },
  { label: 'Calculating Von Mises stress',     duration: 3000 },
  { label: 'Predicting internal damage',       duration: 2500 },
  { label: 'Fetching Ladipo Market prices',    duration: 2000 },
  { label: 'Running physics fraud check',      duration: 2000 },
  { label: 'Generating damage report',         duration: 1500 },
];

export default function Processing() {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate    = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone]               = useState(false);
  const [elapsed, setElapsed]         = useState(0);

  // Advance through steps visually
  useEffect(() => {
    let stepIndex = 0;
    let total = 0;

    function advance() {
      if (stepIndex >= STEPS.length) {
        setDone(true);
        return;
      }
      setCurrentStep(stepIndex);
      const delay = STEPS[stepIndex].duration;
      total += delay;
      stepIndex++;
      setTimeout(advance, delay);
    }

    advance();

    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll for report readiness
  useEffect(() => {
    if (!claimId) return;
    const interval = setInterval(async () => {
      try {
        const claim = await claimApi.getClaim(claimId);
        if (claim.status === 'complete' || claim.status === 'flagged') {
          clearInterval(interval);
          navigate(`/claim/${claimId}/report`);
        }
      } catch { /* keep polling */ }
    }, 3000);

    return () => clearInterval(interval);
  }, [claimId, navigate]);

  const totalSteps = STEPS.length;
  const percent = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <ClaimShell claimId={claimId} active="report" navActive="analytics">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="rgba(42,174,155,0.9)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - (currentStep + 1) / totalSteps)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-4xl font-bold">{percent}%</div>
                  <div className="text-[11px] tracking-widest uppercase text-white/50 mt-1">Analyzing</div>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight mt-7">Vehicle Structural Diagnostics</h1>
            <p className="text-white/55 text-sm mt-3 max-w-lg">
              AI is currently inspecting structural nodes from the submitted high-definition scan.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="hs-chip">
                <span className="w-2 h-2 rounded-full bg-teal" />
                ELAPSED: {elapsed}s
              </span>
              <span className="hs-chip">Est. Remaining: {Math.max(0, 30 - elapsed)}s</span>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">Process Queue</div>
                <div className="text-[11px] tracking-widest uppercase text-white/45 mt-1">
                  Engine: HS‑LINK v2.4
                </div>
              </div>
              <span className="hs-chip">
                <span className="w-2 h-2 rounded-full bg-teal" />
                Active Step {Math.min(currentStep + 1, totalSteps)}/{totalSteps}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {STEPS.map((s, i) => {
                const isDone = i < currentStep;
                const isActive = i === currentStep;
                return (
                  <div
                    key={s.label}
                    className={[
                      'flex items-center gap-3 rounded-2xl border px-4 py-4 transition-colors',
                      isActive ? 'border-teal/40 bg-surface2/40' : isDone ? 'border-border/50 bg-surface/30' : 'border-border/40 bg-surface/20 opacity-60',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'w-10 h-10 rounded-xl flex items-center justify-center border text-sm font-bold',
                        isDone ? 'border-teal/40 bg-teal/10 text-tealL' : isActive ? 'border-teal/40 bg-white/5 text-tealL' : 'border-border/50 text-white/40',
                      ].join(' ')}
                    >
                      {isDone ? <Icon name="check" className="w-5 h-5" /> : i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white/90">{s.label}</div>
                      <div className="text-[11px] tracking-widest uppercase text-white/40 mt-1">
                        {isDone ? 'Complete' : isActive ? 'Processing…' : 'Pending queue'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            <Card className="p-5">
              <div className="text-2xl font-bold text-tealL">2,840</div>
              <div className="text-[11px] tracking-widest uppercase text-white/45 mt-1">Point cloud density</div>
            </Card>
            <Card className="p-5">
              <div className="text-2xl font-bold text-tealL">0.02mm</div>
              <div className="text-[11px] tracking-widest uppercase text-white/45 mt-1">Precision threshold</div>
            </Card>
            <Card className="p-5">
              <div className="text-2xl font-bold text-tealL">GPU</div>
              <div className="text-[11px] tracking-widest uppercase text-white/45 mt-1">Compute instance</div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-3 text-center text-xs text-white/35">
          {done ? 'Finalising report…' : 'Von Mises stress simulation running…'}
        </div>
      </div>
    </ClaimShell>
  );
}

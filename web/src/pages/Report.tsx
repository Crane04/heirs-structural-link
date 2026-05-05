import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { claimApi, DamageReport, Prediction } from '../api/client';
import DamageMap from '../components/DamageMap';
import ClaimShell from '../components/layout/ClaimShell';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

function formatNgn(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
  }).format(amount);
}

function severityColor(s: string): string {
  const map: Record<string, string> = {
    minor: 'text-green-400', moderate: 'text-yellow-400',
    significant: 'text-orange-400', severe: 'text-red-400', critical: 'text-red-600',
  };
  return map[s] ?? 'text-white';
}

function SeverityBadge({ severity }: { severity: string }) {
  const color = severityColor(severity);
  return (
    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 ${color}`}>
      {severity}
    </span>
  );
}

function PredictionCard({ p }: { p: Prediction }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-surface border border-border/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${p.fraudFlagged ? 'bg-gold' : 'bg-teal'}`} />
          <div>
            <p className="text-white font-semibold text-sm capitalize">{p.zone.replace(/_/g, ' ')}</p>
            <p className="text-white/40 text-xs capitalize">{p.damageType} · {p.dentDepthCm.toFixed(1)}cm depth</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SeverityBadge severity={p.severity} />
          <span className="text-white/30 text-lg">{expanded ? '−' : '+'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-5 flex flex-col gap-3 border-t border-border/40 pt-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Visible Damage</p>
            <p className="text-white/80 text-sm">{p.payoutParts}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Predicted Hidden Damage</p>
            <p className="text-tealL text-sm">{p.hiddenDamage}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Components at Risk</p>
            <p className="text-white/70 text-sm">{p.componentsAtRisk}</p>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Severity Score</p>
              <p className={`text-lg font-bold ${severityColor(p.severity)}`}>{p.severityScore}/10</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase tracking-wider">AI Confidence</p>
              <p className="text-white font-bold">{Math.round(p.confidence * 100)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Report() {
  const { claimId }   = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<DamageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted]   = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!claimId) return;
    claimApi.getReport(claimId)
      .then(setReport)
      .catch(() => setError('Could not load your report. Please refresh.'))
      .finally(() => setLoading(false));
  }, [claimId]);

  async function handleAccept() {
    if (!claimId || accepting) return;
    setAccepting(true);
    try {
      await claimApi.acceptPayout(claimId);
      setAccepted(true);
    } catch {
      setError('Failed to accept payout. Please try again.');
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-teal rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-6">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  if (!report) return null;

  const damagedZones = report.predictions.map((p) => p.zone);
  const zonesDetected = Array.from(new Set(damagedZones)).length;

  return (
    <ClaimShell claimId={claimId} active="report" navActive="analytics">
      <div className="pb-28">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <div className="text-4xl font-bold tracking-tight">Analysis</div>
            <div className="text-white/55 text-sm mt-2">
              Claim {claimId?.slice(0, 8).toUpperCase()} • Generated via Structural‑Link AI
            </div>
          </div>
          <span className="hs-chip">
            <span className={`w-2 h-2 rounded-full ${report.fraudFlagged ? 'bg-gold' : 'bg-teal'}`} />
            {report.fraudFlagged ? 'FLAGGED' : 'COMPLETE'}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="text-[11px] tracking-widest uppercase text-white/45">Estimated payout</div>
            <div className="mt-3 text-4xl font-bold">{formatNgn(report.totalPayoutNgn)}</div>
            <div className="mt-2 text-xs text-white/45">Based on Ladipo Market seed pricing</div>
          </Card>
          <Card className="p-6">
            <div className="text-[11px] tracking-widest uppercase text-white/45">Fraud flagged</div>
            <div className="mt-3 text-4xl font-bold">{report.fraudFlagged ? 'Yes' : 'No'}</div>
            <div className="mt-2 text-xs text-white/45">
              {report.fraudFlagged ? 'Physics verification mismatch detected' : 'Structural integrity match'}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-[11px] tracking-widest uppercase text-white/45">Zones detected</div>
            <div className="mt-3 text-4xl font-bold">{zonesDetected}</div>
            <div className="mt-2 text-xs text-white/45">Frontal & lateral impact clusters</div>
          </Card>
        </div>

        {report.fraudFlagged && (
          <div className="mt-6">
            <Card className="p-6 border border-gold/40 bg-surface2/40">
              <div className="text-gold font-bold">Claim flagged for review</div>
              <p className="text-white/60 text-sm mt-2">
                Our Von Mises stress analysis detected an inconsistency between reported impact and observed structural
                damage. A Heirs claims officer will contact you within 24 hours.
              </p>
              <div className="mt-4">
                <Button variant="secondary" onClick={() => navigate(`/claim/${claimId}/scan`)}>
                  Rescan
                </Button>
              </div>
            </Card>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card className="p-6">
            <div className="text-[11px] tracking-widest uppercase text-white/45 mb-4">Damage map</div>
            <div className="bg-surface2/30 border border-border/50 rounded-2xl p-4">
              <DamageMap damagedZones={damagedZones} fraudFlagged={report.fraudFlagged} />
            </div>
          </Card>

          <div>
            <div className="text-[11px] tracking-widest uppercase text-white/45 mb-4">
              {report.predictions.length} zone{report.predictions.length !== 1 ? 's' : ''} detected
            </div>
            <div className="flex flex-col gap-3">
              {report.predictions.map((p, i) => (
                <PredictionCard key={i} p={p} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Card className="p-5 flex items-center justify-between gap-4">
            <div className="text-sm text-white/55">Claim reference</div>
            <div className="font-mono text-xs text-white/80">{claimId}</div>
          </Card>
        </div>
      </div>

      {!report.fraudFlagged && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-navy/90 backdrop-blur border-t border-border/50">
          <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="text-xs text-white/45">
              {accepted ? 'Payout accepted. Processing…' : 'Review complete. You can accept payout or rescan.'}
              {error && <div className="text-gold font-semibold mt-1">{error}</div>}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate(`/claim/${claimId}/scan`)} className="px-6">
                Rescan
              </Button>
              <Button
                variant="solid"
                onClick={handleAccept}
                disabled={accepting || accepted}
                className="px-7"
              >
                {accepted ? 'Accepted' : accepting ? 'Processing…' : `Accept payout • ${formatNgn(report.totalPayoutNgn)}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ClaimShell>
  );
}

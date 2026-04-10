import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { claimApi, DamageReport, Prediction } from '../api/client';
import DamageMap from '../components/DamageMap';

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
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${p.fraudFlagged ? 'bg-gold' : 'bg-red-400'}`} />
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
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/5 pt-3">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Visible Damage</p>
            <p className="text-white/80 text-sm">{p.payoutParts}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Predicted Hidden Damage</p>
            <p className="text-teal text-sm">{p.hiddenDamage}</p>
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
        <div className="w-12 h-12 border-4 border-teal/20 border-t-teal rounded-full animate-spin" />
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

  return (
    <div className="min-h-screen bg-navy pb-32">
      {/* Header */}
      <div className={`px-4 py-4 ${report.fraudFlagged ? 'bg-gold/20 border-b border-gold/30' : 'border-b border-teal/20'}`}>
        <p className="text-xs font-bold tracking-widest uppercase text-teal">Heirs Insurance</p>
        <h1 className="text-white font-bold text-xl mt-0.5">
          {report.fraudFlagged ? '⚠️ Claim Flagged for Review' : '✅ Damage Report Ready'}
        </h1>
      </div>

      <div className="px-4 pt-6 flex flex-col gap-6">

        {/* Fraud flag banner */}
        {report.fraudFlagged && (
          <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-4">
            <p className="text-gold font-bold text-sm mb-1">Physics Verification Failed</p>
            <p className="text-white/70 text-sm">
              Our Von Mises stress analysis detected an inconsistency between the reported impact and the structural damage observed. A Heirs claims officer will contact you within 24 hours.
            </p>
          </div>
        )}

        {/* Car diagram + payout */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-4">
          <DamageMap damagedZones={damagedZones} fraudFlagged={report.fraudFlagged} />
          <div className="w-full text-center border-t border-white/10 pt-4">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Estimated Payout</p>
            <p className="text-4xl font-bold text-white">{formatNgn(report.totalPayoutNgn)}</p>
            <p className="text-white/40 text-xs mt-1">Based on live Ladipo Market prices</p>
          </div>
        </div>

        {/* Predictions */}
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
            {report.predictions.length} Damage Zone{report.predictions.length !== 1 ? 's' : ''} Detected
          </p>
          <div className="flex flex-col gap-3">
            {report.predictions.map((p, i) => (
              <PredictionCard key={i} p={p} />
            ))}
          </div>
        </div>

        {/* Claim ID */}
        <div className="bg-white/5 rounded-xl px-4 py-3 flex justify-between items-center">
          <p className="text-white/40 text-xs">Claim Reference</p>
          <p className="text-white font-mono text-xs">{claimId}</p>
        </div>
      </div>

      {/* Sticky Accept Payout button */}
      {!report.fraudFlagged && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy/95 border-t border-white/10 backdrop-blur-sm">
          {accepted ? (
            <div className="bg-teal/20 border border-teal rounded-xl py-4 text-center">
              <p className="text-teal font-bold text-lg">🎉 Payout Accepted!</p>
              <p className="text-white/60 text-sm mt-1">Heirs Insurance will process your payment shortly.</p>
            </div>
          ) : (
            <>
              {error && <p className="text-red-400 text-sm text-center mb-2">{error}</p>}
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full py-4 bg-teal text-white font-bold text-lg rounded-xl disabled:opacity-50 hover:bg-tealL transition-colors"
              >
                {accepting ? 'Processing...' : `Accept Payout — ${formatNgn(report.totalPayoutNgn)}`}
              </button>
              <p className="text-white/30 text-xs text-center mt-2">
                By accepting you agree to the Heirs Insurance claim terms
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

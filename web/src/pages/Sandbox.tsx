import { useEffect, useMemo, useState } from 'react';
import TopNav from '../components/layout/TopNav';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Markdown from '../components/ui/Markdown';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import { claimApi } from '../api/client';

const CAR_MODELS = ['Toyota Camry', 'Honda Accord', 'Lexus RX'] as const;

type Step = 'idle' | 'uploading' | 'analysing' | 'done';

export default function Sandbox() {
  const [carModel, setCarModel] = useState<(typeof CAR_MODELS)[number]>('Toyota Camry');
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    claimId: string;
    totalPayoutNgn: number;
    fraudFlagged: boolean;
    summary: string;
    predictions: Array<{
      zone: string;
      damageType: string;
      severity: string;
      dentDepthCm: number;
      payoutParts: string;
    }>;
  } | null>(null);

  const { uploadFrames, progress } = useCloudinaryUpload();

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function handleSubmit() {
    setError('');
    setResult(null);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;
    if (!cloudName || !preset) {
      setError('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
      return;
    }

    if (!file) {
      setError('Upload a single image.');
      return;
    }

    try {
      setStep('uploading');
      const [frameUrl] = await uploadFrames([file]);
      setStep('analysing');

      const res = await claimApi.sandboxAnalyse({ carModel, frameUrl });
      setResult({
        claimId: res.claimId,
        totalPayoutNgn: res.totalPayoutNgn,
        fraudFlagged: res.fraudFlagged,
        summary: res.summary,
        predictions: res.predictions || [],
      });
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sandbox failed. Please try again.');
      setStep('idle');
    }
  }

  return (
    <div className="min-h-screen bg-offwhite text-ink">
      <TopNav active="support" />

      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sandbox</h1>
            <p className="text-ink/55 text-sm mt-2">
              Upload a single damaged-car image and get a payout estimate.
            </p>
          </div>
          <div className="hs-chip">Does not affect live claims</div>
        </div>

        {error && (
          <div className="mt-6 hs-card px-5 py-4 border border-gold/40 bg-surface2/40">
            <p className="text-gold font-semibold text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="text-[11px] tracking-widest uppercase text-ink/45">Inputs</div>

            <div className="mt-4 flex flex-col gap-4">
              <label className="text-sm font-semibold">
                Car model
                <select
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value as (typeof CAR_MODELS)[number])}
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ink/10"
                >
                  {CAR_MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold">
                Damage image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-2 block w-full text-sm"
                />
              </label>

              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={step === 'uploading' || step === 'analysing'}
                className="w-full rounded-xl py-3"
              >
                {step === 'uploading' ? `Uploading… ${progress}%` : step === 'analysing' ? 'Analysing…' : 'Run sandbox analysis'}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-[11px] tracking-widest uppercase text-ink/45">Preview & Result</div>

            <div className="mt-4">
              <div className="rounded-2xl border border-border bg-surface2/50 overflow-hidden aspect-[4/3] flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-sm text-ink/50">No image selected</div>
                )}
              </div>

              {result && (
                <div className="mt-5 flex flex-col gap-2">
                  <div className="hs-chip w-fit">
                    Status: {result.fraudFlagged ? 'FLAGGED' : 'COMPLETE'}
                  </div>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(result.totalPayoutNgn)}
                  </div>
                  <div className="text-sm text-ink/55">
                    Claim ID: <span className="font-mono text-xs text-ink/80">{result.claimId}</span>
                  </div>

                  <div className="mt-3">
                    <div className="text-[11px] tracking-widest uppercase text-ink/45 mb-2">Summary</div>
                    <div className="rounded-xl border border-border bg-surface px-4 py-3">
                      <Markdown content={result.summary} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GhostFrame from '../components/GhostFrame';
import ClaimShell from '../components/layout/ClaimShell';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Icon from '../components/ui/Icon';
import { claimApi } from '../api/client';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';

const CAR_MODELS = ['Toyota Camry', 'Honda Accord', 'Lexus RX'] as const;
const FRAME_TARGET = 6;
const ANGLES = ['Front Bumper', 'Left Quarter Panel', 'Rear Bumper'] as const;

type Step = 'scanning' | 'uploading';

function toUpperSlug(s: string) {
  return s.toUpperCase().replace(/\s+/g, '_');
}

export default function Scan() {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<Step>('scanning');
  const [carModel, setCarModel] = useState<(typeof CAR_MODELS)[number]>('Toyota Camry');
  const [frames, setFrames] = useState<Blob[]>([]);
  const [aligned, setAligned] = useState(false);
  const [error, setError] = useState('');

  const { uploadFrames, progress } = useCloudinaryUpload();

  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setAligned(true);
      } catch {
        setError('Camera access denied. Please allow camera permission and refresh.');
      }
    })();

    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  async function captureFrame(): Promise<Blob | null> {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85);
    });
  }

  async function handleCapture() {
    if (step !== 'scanning') return;
    if (frames.length >= FRAME_TARGET) return;
    const blob = await captureFrame();
    if (!blob) return;
    setFrames((prev) => [...prev, blob]);
  }

  function handleRetake() {
    if (step !== 'scanning') return;
    setFrames([]);
  }

  async function handleSubmit() {
    if (!claimId) return;
    if (frames.length < FRAME_TARGET) return;
    setStep('uploading');

    try {
      const frameUrls = await uploadFrames(frames);
      await claimApi.analyse(claimId, { frameUrls, carModel });
      navigate(`/claim/${claimId}/processing`);
    } catch {
      setError('Upload failed. Please check your connection and try again.');
      setStep('scanning');
    }
  }

  return (
    <ClaimShell claimId={claimId} active="scan">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Scan Vehicle Damage</h1>
              <span className="hs-chip">{claimId ? toUpperSlug(claimId.slice(0, 7)) : '—'}</span>
              <button className="text-white/50 text-sm hover:text-white/70 transition-colors">Need help?</button>
            </div>
            <p className="text-white/50 text-sm mt-2">
              Capture 6 frames to enable submission. Keep the vehicle centered in the guide.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface/40 border border-border/60 rounded-xl p-1">
            {CAR_MODELS.map((m) => (
              <button
                key={m}
                onClick={() => setCarModel(m)}
                className={[
                  'px-4 py-2 text-xs font-bold tracking-widest rounded-lg transition-colors uppercase',
                  carModel === m ? 'bg-surface2 border border-teal/40 text-tealL' : 'text-white/60 hover:text-white/80',
                ].join(' ')}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="hs-card px-5 py-4 border border-gold/40 bg-surface2/40">
            <p className="text-gold font-semibold text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <Card className="lg:col-span-2 p-5">
            <div className="rounded-2xl border border-border/60 bg-black/40 overflow-hidden relative aspect-[16/9]">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover opacity-90" />
              <GhostFrame aligned={aligned} />
              <div className="absolute left-4 top-4 hs-chip">
                <span className="w-2 h-2 rounded-full bg-teal" />
                Align damage with center guide
              </div>
              <div className="absolute right-4 top-4 hs-chip">
                <span className="text-white/70">Scanning progress</span>
                <span className="text-white">{frames.length}/{FRAME_TARGET}</span>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs tracking-widest text-white/50 uppercase">Scanning progress</div>
                <div className="text-2xl font-bold">{frames.length}/{FRAME_TARGET}</div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-2 bg-teal rounded-full" style={{ width: `${(frames.length / FRAME_TARGET) * 100}%` }} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button
                  variant="solid"
                  onClick={handleCapture}
                  disabled={step !== 'scanning' || frames.length >= FRAME_TARGET}
                  className="py-5 rounded-2xl flex-col"
                >
                  <Icon name="camera" className="w-6 h-6" />
                  <span className="text-sm font-bold">Capture</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleRetake}
                  disabled={step !== 'scanning' || frames.length === 0}
                  className="py-5 rounded-2xl flex-col"
                >
                  <Icon name="refresh" className="w-6 h-6" />
                  <span className="text-sm font-bold">Retake</span>
                </Button>
              </div>
            </Card>

            <Card className="p-5">
              <div className="text-xs tracking-widest text-white/50 uppercase">Required angles</div>
              <div className="mt-4 flex flex-col gap-2">
                {ANGLES.map((a, i) => {
                  const complete = frames.length >= (i + 1) * 2;
                  return (
                    <div
                      key={a}
                      className={[
                        'flex items-center gap-3 rounded-xl border px-3 py-3',
                        complete ? 'border-teal/40 bg-surface2/40' : 'border-border/50 bg-surface/30',
                      ].join(' ')}
                    >
                      <div
                        className={[
                          'w-9 h-9 rounded-xl flex items-center justify-center border',
                          complete ? 'border-teal/40 bg-teal/10 text-tealL' : 'border-border/50 text-white/40',
                        ].join(' ')}
                      >
                        {complete ? (
                          <Icon name="check" className="w-5 h-5" />
                        ) : (
                          <Icon name="circle" className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-white/90">{a}</div>
                        <div className="text-xs text-white/45">{complete ? 'Captured' : 'Pending'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        <Card className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-semibold">Ready for Analysis</div>
            <div className="text-sm text-white/50">Scan 6 frames to enable submission</div>
            {step === 'uploading' && (
              <div className="text-xs text-white/50 mt-2">Uploading… {progress}%</div>
            )}
          </div>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={step !== 'scanning' || frames.length < FRAME_TARGET}
            className="px-7 py-3 rounded-xl w-full sm:w-auto"
          >
            Submit for analysis
          </Button>
        </Card>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ClaimShell>
  );
}

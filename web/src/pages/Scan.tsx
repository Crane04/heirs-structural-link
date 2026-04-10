import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GhostFrame from '../components/GhostFrame';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import { claimApi } from '../api/client';

const CAR_MODELS = ['Toyota Camry', 'Honda Accord', 'Lexus RX'];
const FRAME_TARGET = 5;

type Step = 'select-car' | 'scanning' | 'uploading';

export default function Scan() {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate     = useNavigate();

  const videoRef     = useRef<HTMLVideoElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const streamRef    = useRef<MediaStream | null>(null);

  const [step, setStep]           = useState<Step>('select-car');
  const [carModel, setCarModel]   = useState('Toyota Camry');
  const [frames, setFrames]       = useState<Blob[]>([]);
  const [aligned, setAligned]     = useState(false);
  const [prompt, setPrompt]       = useState('Position your car inside the frame');
  const [error, setError]         = useState('');

  const { uploadFrames, uploading, progress } = useCloudinaryUpload();

  // Start camera
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStep('scanning');
      simulateAlignmentPrompts();
    } catch {
      setError('Camera access denied. Please allow camera permission and try again.');
    }
  }

  // Simulate AR guidance prompts
  function simulateAlignmentPrompts() {
    const prompts = [
      'Position your car inside the frame',
      'Move left slightly...',
      'Hold steady...',
      'Tilt up a little...',
      'Perfect — capturing frame 1',
    ];
    let i = 0;
    const interval = setInterval(() => {
      setPrompt(prompts[i]);
      if (i === prompts.length - 1) {
        setAligned(true);
        clearInterval(interval);
      }
      i++;
    }, 1500);
  }

  // Capture a single frame from the video feed
  const captureFrame = useCallback((): Blob | null => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);

    let blob: Blob | null = null;
    canvas.toBlob((b) => { blob = b; }, 'image/jpeg', 0.85);
    return blob;
  }, []);

  // Auto-capture once aligned
  useEffect(() => {
    if (!aligned || step !== 'scanning') return;

    const captured: Blob[] = [];
    let count = 0;

    const interval = setInterval(() => {
      const frame = captureFrame();
      if (frame) {
        captured.push(frame);
        count++;
        setFrames([...captured]);
        setPrompt(`Capturing frame ${count} of ${FRAME_TARGET}...`);

        if (count >= FRAME_TARGET) {
          clearInterval(interval);
          handleUpload(captured);
        }
      }
    }, 800);

    return () => clearInterval(interval);
  }, [aligned, step, captureFrame]);

  async function handleUpload(blobs: Blob[]) {
    setStep('uploading');
    streamRef.current?.getTracks().forEach((t) => t.stop());

    try {
      const frameUrls = await uploadFrames(blobs);
      await claimApi.analyse(claimId!, { frameUrls, carModel });
      navigate(`/claim/${claimId}/processing`);
    } catch {
      setError('Upload failed. Please check your connection and try again.');
    }
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-teal/20">
        <div>
          <p className="text-xs text-teal font-bold tracking-widest uppercase">Heirs Insurance</p>
          <p className="text-white font-bold text-lg">Structural-Link AI</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/50">Claim</p>
          <p className="text-xs text-teal font-mono">{claimId?.slice(0, 8)}...</p>
        </div>
      </div>

      {/* Car selection */}
      {step === 'select-car' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="text-center">
            <p className="text-white/60 text-sm mb-1">Step 1 of 3</p>
            <h1 className="text-2xl font-bold text-white">What's your car model?</h1>
            <p className="text-white/50 text-sm mt-2">This helps us load the correct structural model</p>
          </div>

          <div className="w-full max-w-sm flex flex-col gap-3">
            {CAR_MODELS.map((model) => (
              <button
                key={model}
                onClick={() => setCarModel(model)}
                className={`w-full py-4 px-6 rounded-xl border-2 text-left font-semibold transition-all ${
                  carModel === model
                    ? 'border-teal bg-teal/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/60'
                }`}
              >
                {model}
              </button>
            ))}
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            onClick={startCamera}
            className="w-full max-w-sm py-4 bg-teal text-white font-bold text-lg rounded-xl hover:bg-tealL transition-colors"
          >
            Start Scan →
          </button>

          <p className="text-white/30 text-xs text-center max-w-xs">
            Make sure you have good lighting and can walk around your vehicle
          </p>
        </div>
      )}

      {/* Camera scanning */}
      {step === 'scanning' && (
        <div className="flex-1 flex flex-col">
          <div className="relative flex-1 bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <GhostFrame aligned={aligned} />

            {/* Frame counter */}
            <div className="absolute top-4 right-4 bg-black/60 rounded-full px-3 py-1">
              <p className="text-white text-sm font-bold">{frames.length}/{FRAME_TARGET}</p>
            </div>
          </div>

          {/* Prompt bar */}
          <div className={`px-6 py-5 text-center transition-colors ${aligned ? 'bg-teal/20' : 'bg-navy'}`}>
            <p className={`font-semibold text-lg ${aligned ? 'text-teal' : 'text-white/80'}`}>
              {prompt}
            </p>
          </div>
        </div>
      )}

      {/* Uploading */}
      {step === 'uploading' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="w-20 h-20 rounded-full border-4 border-teal/20 border-t-teal animate-spin" />
          <div className="text-center">
            <p className="text-white font-bold text-xl">Uploading frames...</p>
            <p className="text-white/50 text-sm mt-1">{progress}% complete</p>
          </div>
          <div className="w-full max-w-xs bg-white/10 rounded-full h-2">
            <div
              className="bg-teal h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

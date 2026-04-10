import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { claimApi } from '../api/client';

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

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6">
      {/* Animated ring */}
      <div className="relative w-32 h-32 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1C3A52" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="#028090"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - (currentStep + 1) / totalSteps)}`}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-teal font-bold text-xl">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</p>
        </div>
      </div>

      <h1 className="text-white font-bold text-2xl text-center mb-2">
        Analysing your vehicle
      </h1>
      <p className="text-white/40 text-sm text-center mb-10">
        Von Mises stress simulation running...
      </p>

      {/* Step list */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {STEPS.map((step, i) => {
          const isDone    = i < currentStep;
          const isActive  = i === currentStep;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                isActive ? 'bg-teal/20 border border-teal/40' :
                isDone   ? 'bg-white/5' : 'opacity-30'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDone   ? 'bg-teal' :
                isActive ? 'bg-teal/30 border-2 border-teal animate-pulse' :
                           'bg-white/10'
              }`}>
                {isDone && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className={`text-sm font-medium ${isActive ? 'text-white' : isDone ? 'text-white/60' : 'text-white/30'}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-white/30 text-xs mt-8">
        {done ? 'Finalising report...' : `Elapsed: ${elapsed}s`}
      </p>
    </div>
  );
}

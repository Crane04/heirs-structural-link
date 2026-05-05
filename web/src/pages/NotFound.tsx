export default function NotFound() {
  return (
    <div className="min-h-screen bg-offwhite text-ink">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="hs-card p-10 md:p-14 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl border border-ink/20 bg-surface2/40 flex items-center justify-center text-ink text-2xl">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" aria-hidden="true">
              <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 7l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="mt-8 text-6xl sm:text-7xl font-bold tracking-tight">
            404 <span className="text-ink">Page Not Found</span>
          </div>
          <p className="mt-5 text-ink/55 max-w-2xl mx-auto">
            The claim link you followed might have expired or is incorrect. Our structural engine cannot locate this
            specific record.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/" className="hs-btn-solid px-7 py-3 rounded-xl">
              Back to Home
            </a>
            <button className="hs-btn-secondary px-7 py-3 rounded-xl">Search Archive</button>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { k: 'STATUS', t: 'Lost Connection' },
              { k: 'DIAGNOSIS', t: 'Structural Link Broken' },
              { k: 'SECURITY', t: 'Token Expired' },
            ].map((x) => (
              <div key={x.k} className="hs-card p-5">
                <div className="text-[11px] tracking-widest uppercase text-ink/40">{x.k}</div>
                <div className="mt-2 font-semibold text-ink/80">{x.t}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-xs text-ink/35 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-semibold text-ink/60">Heirs Structural‑Link AI</div>
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

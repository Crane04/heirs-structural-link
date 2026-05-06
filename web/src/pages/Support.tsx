import TopNav from '../components/layout/TopNav';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Support() {
  const haildeskApiKey = import.meta.env.VITE_HAILDESK_API_KEY as string | undefined;

  return (
    <div className="min-h-screen bg-offwhite text-ink">
      <TopNav active="support" />

      <div className="mx-auto w-full max-w-3xl px-4 py-14">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Support</h1>
        <p className="mt-3 text-ink/60">
          Need help with a claim, upload, or report? Reach the team here.
        </p>

        <Card className="mt-8 p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-ink">Haildesk</div>
              <div className="mt-1 text-sm text-ink/60">Chat with the team.</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="solid"
                disabled={!haildeskApiKey}
                className="w-full sm:w-auto px-6 py-3 rounded-xl"
                onClick={() => window.Haildesk?.open()}
              >
                Chat now
              </Button>
            </div>
          </div>

          {!haildeskApiKey && (
            <p className="mt-4 text-xs text-ink/45">
              Haildesk not configured. Set <code className="text-ink/70">VITE_HAILDESK_API_KEY</code> in{' '}
              <code className="text-ink/70">web/.env</code>.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

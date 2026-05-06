import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { cn } from '../../lib/cn';

type Props = {
  claimId?: string;
  active?: 'claims' | 'analytics' | 'history' | 'support';
  compact?: boolean;
};

const navItems: Array<{ key: Props['active']; label: string; to: string }> = [
  { key: 'claims', label: 'Claims', to: '/' },
  { key: 'analytics', label: 'Analytics', to: '/' },
  { key: 'history', label: 'History', to: '/' },
  { key: 'support', label: 'Support', to: '/support' },
];

export default function TopNav({ claimId, active, compact }: Props) {
  const whatsappUrl = import.meta.env.VITE_WHATSAPP_START_URL as string | undefined;

  return (
    <div className="sticky top-0 z-20 bg-offwhite/90 backdrop-blur border-b border-border">
      <div className={cn('mx-auto w-full max-w-6xl px-4 py-4 flex items-center gap-4', compact && 'max-w-none')}>
        <div className="flex items-center gap-3 min-w-[140px]">
          <div className="w-2 h-2 rounded-full bg-ink" />
          <Link to="/" className="text-ink font-bold text-lg tracking-tight">
            HeirsAI
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-ink/70">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                'hover:text-ink transition-colors',
                active === item.key && 'text-ink border-b-2 border-ink pb-1'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {claimId && (
            <div className="hidden sm:flex items-center gap-2 hs-chip">
              <span className="text-ink/60">Claim ID:</span>
              <span className="text-ink">{claimId.slice(0, 8).toUpperCase()}</span>
            </div>
          )}
          <a href={whatsappUrl || '#'} target="_blank" rel="noreferrer">
            <Button variant="whatsapp" disabled={!whatsappUrl} className="px-4 py-2 text-sm rounded-lg">
              Start on WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

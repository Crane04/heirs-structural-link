import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import Icon, { type IconName } from '../ui/Icon';

type Props = {
  claimId?: string;
  active?: 'dashboard' | 'scan' | 'report' | 'settings';
};

const items: Array<{
  key: NonNullable<Props['active']>;
  label: string;
  icon: IconName;
  to: (claimId: string) => string;
}> =
  [
    { key: 'dashboard', label: 'Dashboard', icon: 'grid', to: (id) => `/claim/${id}/scan` },
    { key: 'scan', label: 'Scan Vehicle', icon: 'scan', to: (id) => `/claim/${id}/scan` },
    { key: 'report', label: 'AI Report', icon: 'report', to: (id) => `/claim/${id}/report` },
    { key: 'settings', label: 'Settings', icon: 'settings', to: (id) => `/claim/${id}/scan` },
  ];

export default function Sidebar({ claimId, active = 'scan' }: Props) {
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface2/60">
      <div className="px-6 py-6">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-ink/70 uppercase">
          <span className="w-2 h-2 rounded-full bg-ink" />
          Structural-Link
        </div>
        <div className="text-[11px] text-ink/50 mt-1">AI engine active</div>
      </div>

      <nav className="px-3 flex flex-col gap-1">
        {items.map((item) => {
          const disabled = !claimId;
          return (
            <Link
              key={item.key}
              to={disabled ? '#' : item.to(claimId!)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                disabled && 'opacity-40 pointer-events-none',
                active === item.key ? 'bg-ink/5 border border-ink/20 text-ink' : 'text-ink/70 hover:bg-ink/5'
              )}
            >
              <Icon
                name={item.icon}
                className={cn('w-5 h-5 text-ink/70', active === item.key && 'text-ink')}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-6 py-6 text-xs text-ink/40">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-ink/60" />
          AI engine active
        </div>
      </div>
    </aside>
  );
}

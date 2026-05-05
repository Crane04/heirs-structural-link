import type { PropsWithChildren } from 'react';
import TopNav from './TopNav';
import Sidebar from './Sidebar';

type Props = PropsWithChildren<{
  claimId?: string;
  active?: 'dashboard' | 'scan' | 'report' | 'settings';
  navActive?: 'claims' | 'analytics' | 'history' | 'support';
}>;

export default function ClaimShell({ claimId, active = 'scan', navActive = 'claims', children }: Props) {
  return (
    <div className="min-h-screen bg-navy text-white">
      <TopNav claimId={claimId} active={navActive} compact />
      <div className="flex">
        <Sidebar claimId={claimId} active={active} />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}


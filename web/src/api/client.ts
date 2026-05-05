const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

export interface AnalysePayload {
  frameUrls: string[];
  carModel: string;
}

export interface AnalyseResponse {
  reportId: string;
  fraudFlagged: boolean;
}

export interface SandboxAnalysePayload {
  frameUrl: string;
  carModel: string;
}

export interface SandboxAnalyseResponse {
  claimId: string;
  reportId: string;
  fraudFlagged: boolean;
  totalPayoutNgn: number;
  predictions: Prediction[];
}

export interface Claim {
  _id: string;
  phoneNumber: string;
  status: 'initiated' | 'scanning' | 'processing' | 'complete' | 'flagged';
  carMake?: string;
  carModel?: string;
  claimUrl: string;
  createdAt: string;
}

export interface Prediction {
  zone: string;
  damageType: string;
  confidence: number;
  dentDepthCm: number;
  severity: string;
  hiddenDamage: string;
  componentsAtRisk: string;
  severityScore: number;
  payoutParts: string;
  fraudFlagged: boolean;
}

export interface DamageReport {
  _id: string;
  claimId: string;
  predictions: Prediction[];
  totalPayoutNgn: number;
  fraudFlagged: boolean;
  acceptedAt?: string;
  createdAt: string;
}

export const claimApi = {
  getClaim: (claimId: string): Promise<Claim> =>
    request<Claim>(`/claim/${claimId}`),

  analyse: (claimId: string, payload: AnalysePayload): Promise<AnalyseResponse> =>
    request(`/claim/${claimId}/analyse`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getReport: (claimId: string): Promise<DamageReport> =>
    request(`/report/${claimId}`),

  acceptPayout: (claimId: string) =>
    request(`/report/${claimId}/accept`, { method: 'POST' }),

  sandboxAnalyse: (payload: SandboxAnalysePayload): Promise<SandboxAnalyseResponse> =>
    request(`/sandbox/analyse`, { method: 'POST', body: JSON.stringify(payload) }),
};

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HaildeskWidget } from '@haildesk/widget';
import Landing from './pages/Landing';
import Scan from './pages/Scan';
import Processing from './pages/Processing';
import Report from './pages/Report';
import NotFound from './pages/NotFound';
import Sandbox from './pages/Sandbox';
import Support from './pages/Support';

export default function App() {
  useEffect(() => {
    const apiKey = import.meta.env.VITE_HAILDESK_API_KEY as string | undefined;
    if (!apiKey) return;
    HaildeskWidget.init({ apiKey });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                        element={<Landing />} />
        <Route path="/sandbox"                  element={<Sandbox />} />
        <Route path="/support"                  element={<Support />} />
        <Route path="/claim/:claimId/scan"       element={<Scan />} />
        <Route path="/claim/:claimId/processing" element={<Processing />} />
        <Route path="/claim/:claimId/report"     element={<Report />} />
        <Route path="*"                          element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

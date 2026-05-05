import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Scan from './pages/Scan';
import Processing from './pages/Processing';
import Report from './pages/Report';
import NotFound from './pages/NotFound';
import Sandbox from './pages/Sandbox';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                        element={<Landing />} />
        <Route path="/sandbox"                  element={<Sandbox />} />
        <Route path="/claim/:claimId/scan"       element={<Scan />} />
        <Route path="/claim/:claimId/processing" element={<Processing />} />
        <Route path="/claim/:claimId/report"     element={<Report />} />
        <Route path="*"                          element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

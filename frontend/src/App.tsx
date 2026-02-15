import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import PreApplicationsPage from './pages/PreApplicationsPage';
import FormalApplicationsPage from './pages/FormalApplicationsPage';
import BoardPage from './pages/BoardPage';
import CommissionerPage from './pages/CommissionerPage';
import InspectionsPage from './pages/InspectionsPage';
import BusinessesPage from './pages/BusinessesPage';
import EventsPage from './pages/EventsPage';
import PDRequestsPage from './pages/PDRequestsPage';
import DelinquencyPage from './pages/DelinquencyPage';
import LogsPage from './pages/LogsPage';
import { useAuthStore } from './stores/auth';

export default function App() {
  const { user, setGrade } = useAuthStore();

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Chamber of Commerce</h1>
        <div className="top-actions">
          <label>Role</label>
          <select
            value={user.grade}
            onChange={(e) => setGrade(Number(e.target.value))}
          >
            <option value={0}>Junior Clerk (0)</option>
            <option value={1}>Senior Clerk (1)</option>
            <option value={2}>Board Member (2)</option>
            <option value={3}>Commissioner (3)</option>
          </select>
        </div>
      </header>

      <nav className="sidebar">
        <Link to="/">Pre-Applications</Link>
        <Link to="/formal">Formal Applications</Link>
        <Link to="/board">Board Review</Link>
        <Link to="/commissioner">Commissioner</Link>
        <Link to="/inspections">Inspections</Link>
        <Link to="/businesses">Businesses</Link>
        <Link to="/events">Events</Link>
        <Link to="/pd">PD Requests</Link>
        <Link to="/delinquency">Delinquency</Link>
        <Link to="/logs">Logs</Link>
      </nav>

      <main className="content">
        <Routes>
          <Route path="/" element={<PreApplicationsPage />} />
          <Route path="/formal" element={<FormalApplicationsPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/commissioner" element={<CommissionerPage />} />
          <Route path="/inspections" element={<InspectionsPage />} />
          <Route path="/businesses" element={<BusinessesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/pd" element={<PDRequestsPage />} />
          <Route path="/delinquency" element={<DelinquencyPage />} />
          <Route path="/logs" element={<LogsPage />} />
        </Routes>
      </main>
    </div>
  );
}

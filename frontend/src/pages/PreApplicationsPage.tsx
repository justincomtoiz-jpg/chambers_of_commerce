import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { PreAppForm } from '../components/PreAppForm';
import { PreAppCard } from '../components/PreAppCard';
import { useAuthStore } from '../stores/auth';
import { postMessageToUI } from '../utils/nui';
import { connectSocket } from '../socket';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

type PreApp = {
  id: string;
  businessName: string;
  requestorName: string;
  type: string;
  budget: number;
  status: string;
  createdAt: string;
  description?: string;
};

export default function PreApplicationsPage() {
  const [list, setList] = useState<PreApp[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState<PreApp | null>(null);
  const [filter, setFilter] = useState({ status: '', q: '' });
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchList();
    const socket = connectSocket();
    socket.on('preApplications:created', (payload: any) => {
      toast.info(`New Pre-Application: ${payload.pre.businessName}`);
      setList(prev => [payload.pre, ...prev]);
    });
    socket.on('preApplications:updated', (payload: any) => {
      toast.info(`Pre-Application updated: ${payload.id}`);
      fetchList();
    });
    socket.on('logs:created', (payload: any) => {
      // optional: show important logs
    });
    return () => {
      socket.off('preApplications:created');
      socket.off('preApplications:updated');
      socket.off('logs:created');
    };
  }, []);

  async function fetchList(filters = filter) {
    const params: any = {};
    if (filters.status) params.status = filters.status;
    if (filters.q) params.q = filters.q;
    const res = await api.get('/api/pre-applications', { params });
    setList(res.data);
  }

  async function create(data: any) {
    try {
      await api.post('/api/pre-applications', data);
      setOpenForm(false);
      fetchList();
      postMessageToUI('preAppCreated', {});
      toast.success('Pre-Application created');
    } catch (err) {
      toast.error('Failed to create Pre-Application');
    }
  }

  async function openCard(id: string) {
    const res = await api.get(`/api/pre-applications`);
    const found = res.data.find((p: any) => p.id === id);
    setSelected(found);
  }

  async function sendForFormal(id: string) {
    // optimistic UI
    setList(prev => prev.map(p => p.id === id ? { ...p, status: 'FormalReview' } : p));
    try {
      await api.post(`/api/pre-applications/${id}/send-for-formal`);
      toast.success('Sent for formal review');
    } catch (err) {
      toast.error('Failed to send for formal review');
      fetchList();
    }
  }

  async function quarantine(id: string) {
    if (!confirm('Quarantine this application?')) return;
    await api.post(`/api/pre-applications/${id}/quarantine`);
    toast.info('Application quarantined');
    fetchList();
    setSelected(null);
  }

  async function reject(id: string) {
    if (!confirm('Reject this application?')) return;
    await api.post(`/api/pre-applications/${id}/reject`);
    toast.warn('Application rejected');
    fetchList();
    setSelected(null);
  }

  return (
    <div>
      <div className="page-header">
        <h2>Pre-Application Interview</h2>
        <div>
          <button onClick={() => setOpenForm(true)}>New Pre-Application</button>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <input placeholder="Search requestor or business" value={filter.q} onChange={e => setFilter({ ...filter, q: e.target.value })} />
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All</option>
          <option value="PendingReview">Pending</option>
          <option value="FormalReview">Formal</option>
          <option value="Quarantined">Quarantined</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button onClick={() => fetchList()}>Apply</button>
      </div>

      {openForm && (
        <Modal isOpen={openForm} onRequestClose={() => setOpenForm(false)} title="New Pre-Application">
          <PreAppForm onSubmit={create} onCancel={() => setOpenForm(false)} />
        </Modal>
      )}

      <div className="cards-grid">
        {list.map(app => (
          <PreAppCard
            key={app.id}
            app={app}
            onOpen={() => openCard(app.id)}
            onSendForFormal={() => sendForFormal(app.id)}
            userGrade={user.grade}
          />
        ))}
      </div>

      {selected && (
        <Modal isOpen={!!selected} onRequestClose={() => setSelected(null)} title={selected.businessName}>
          <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
            <h4>Requestor</h4>
            <p>{selected.requestorName}</p>
            <h4>Description</h4>
            <p>{selected.description}</p>
            <h4>Details</h4>
            <pre>{JSON.stringify(selected, null, 2)}</pre>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => quarantine(selected.id)}>Quarantine</button>
              <button onClick={() => reject(selected.id)}>Reject</button>
              <button onClick={() => { setSelected(null); }}>Close</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { PreAppForm } from '../components/PreAppForm';
import { PreAppCard } from '../components/PreAppCard';
import { useAuthStore } from '../stores/auth';
import { postMessageToUI } from '../utils/nui';

type PreApp = {
  id: string;
  businessName: string;
  requestorName: string;
  type: string;
  budget: number;
  status: string;
  createdAt: string;
};

export default function PreApplicationsPage() {
  const [list, setList] = useState<PreApp[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState<PreApp | null>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchList();
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'refreshPreApps') fetchList();
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  async function fetchList() {
    const res = await api.get('/api/pre-applications');
    setList(res.data);
  }

  async function create(data: any) {
    await api.post('/api/pre-applications', data);
    setOpenForm(false);
    fetchList();
    postMessageToUI('preAppCreated', {});
  }

  async function openCard(id: string) {
    const res = await api.get(`/api/pre-applications`);
    const found = res.data.find((p: any) => p.id === id);
    setSelected(found);
  }

  async function sendForFormal(id: string) {
    await api.post(`/api/pre-applications/${id}/send-for-formal`);
    fetchList();
  }

  return (
    <div>
      <div className="page-header">
        <h2>Pre-Application Interview</h2>
        <div>
          <button onClick={() => setOpenForm(true)}>New Pre-Application</button>
        </div>
      </div>

      {openForm && (
        <div className="modal">
          <PreAppForm onSubmit={create} onCancel={() => setOpenForm(false)} />
        </div>
      )}

      <div className="cards-grid">
        {list.map((app) => (
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
        <div className="modal">
          <div className="modal-content">
            <h3>{selected.businessName}</h3>
            <pre>{JSON.stringify(selected, null, 2)}</pre>
            <div className="modal-actions">
              <button
                onClick={() => {
                  api.post(`/api/pre-applications/${selected.id}/quarantine`);
                  fetchList();
                  setSelected(null);
                }}
              >
                Quarantine
              </button>
              <button
                onClick={() => {
                  api.post(`/api/pre-applications/${selected.id}/reject`);
                  fetchList();
                  setSelected(null);
                }}
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setSelected(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

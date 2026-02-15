import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function PDRequestsPage() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    fetchList();
  }, []);
  async function fetchList() {
    const res = await api.get('/api/pd-requests');
    setList(res.data);
  }

  async function create() {
    const targetId = prompt('Target ID') || '';
    const targetType = prompt('Target Type (Business/Event)') || 'Business';
    const reason = prompt('Reason') || '';
    await api.post('/api/pd-requests', { targetId, targetType, reason });
    fetchList();
  }

  async function decide(id: string) {
    const decision = prompt('Decision (Approve/Deny/Quarantine)') || 'Approve';
    await api.post(`/api/pd-requests/${id}/decision`, { decision });
    fetchList();
  }

  return (
    <div>
      <h2>PD Requests</h2>
      <button onClick={create}>Create PD Request</button>
      {list.map((p) => (
        <div key={p.id} className="card">
          <p>
            {p.targetType} {p.targetId}
          </p>
          <p>{p.status}</p>
          <div className="card-actions">
            <button onClick={() => decide(p.id)}>Decide</button>
          </div>
        </div>
      ))}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function CommissionerPage() {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    const res = await api.get('/api/commissioner/queue');
    setQueue(res.data);
  }

  async function decide(id: string, decision: string) {
    if (decision === 'Approve') {
      const taxRate = Number(prompt('Tax rate (e.g., 5.00)') || 0);
      const expiry = prompt('Expiry ISO (optional)');
      await api.post(`/api/commissioner/${id}/decision`, {
        decision,
        taxRate,
        expiry,
      });
    } else {
      await api.post(`/api/commissioner/${id}/decision`, { decision });
    }
    fetchQueue();
  }

  return (
    <div>
      <h2>Commissioner Review</h2>
      {queue.map((q) => (
        <div key={q.id} className="card">
          <h3>{q.businessName}</h3>
          <div className="card-actions">
            <button onClick={() => decide(q.id, 'Approve')}>Approve</button>
            <button onClick={() => decide(q.id, 'PreApplication')}>
              Back to Pre-Application
            </button>
            <button onClick={() => decide(q.id, 'Quarantine')}>
              Quarantine
            </button>
            <button onClick={() => decide(q.id, 'Reject')}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}

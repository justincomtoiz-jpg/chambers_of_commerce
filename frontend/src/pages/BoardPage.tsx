import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function BoardPage() {
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    const res = await api.get('/api/board/queue');
    setQueue(res.data);
  }

  async function decide(id: string, decision: string) {
    await api.post(`/api/board/${id}/decision`, { decision });
    fetchQueue();
  }

  return (
    <div>
      <h2>Board Review</h2>
      {queue.map((q) => (
        <div key={q.id} className="card">
          <h3>{q.businessName}</h3>
          <p>{q.description}</p>
          <div className="card-actions">
            <button onClick={() => decide(q.id, 'ToCommissioner')}>
              To Commissioner
            </button>
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

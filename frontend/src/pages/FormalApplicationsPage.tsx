import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuthStore } from '../stores/auth';

export default function FormalApplicationsPage() {
  const [list, setList] = useState<any[]>([]);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    const res = await api.get('/api/formal-reviews');
    setList(res.data);
  }

  async function upsert(review: any) {
    await api.post('/api/formal-reviews', review);
    fetchList();
  }

  async function sendToBoard(id: string) {
    await api.post(`/api/formal-reviews/${id}/send-to-board`);
    fetchList();
  }

  return (
    <div>
      <h2>Formal Applications</h2>
      <div>
        {list.map((r) => (
          <div key={r.id} className="card">
            <h3>{r.preApplicationId}</h3>
            <p>Meets City Goals: {String(r.meetsCityGoals)}</p>
            <p>Location Valid: {r.locationValid}</p>
            <div className="card-actions">
              {user.grade >= 1 && (
                <button onClick={() => sendToBoard(r.id)}>Send to Board</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

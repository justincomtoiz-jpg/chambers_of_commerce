import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function EventsPage() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    fetchList();
  }, []);
  async function fetchList() {
    const res = await api.get('/api/events');
    setList(res.data);
  }

  async function cleanup() {
    await api.post('/api/events/cleanup-expired');
    fetchList();
  }

  return (
    <div>
      <h2>Events</h2>
      <button onClick={cleanup}>Cleanup Expired</button>
      {list.map((e) => (
        <div key={e.id} className="card">
          <h3>{e.name}</h3>
          <p>Expiry: {e.expiry}</p>
        </div>
      ))}
    </div>
  );
}

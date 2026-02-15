import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function DelinquencyPage() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    fetchList();
  }, []);
  async function fetchList() {
    const res = await api.get('/api/delinquency');
    setList(res.data);
  }

  async function resolve(id: string) {
    await api.post(`/api/delinquency/${id}/resolve`);
    fetchList();
  }

  return (
    <div>
      <h2>Delinquency</h2>
      {list.map((b) => (
        <div key={b.id} className="card">
          <h3>{b.name}</h3>
          <p>Last Paid: {b.data?.lastTaxPaidAt}</p>
          <div className="card-actions">
            <button onClick={() => resolve(b.id)}>Resolve</button>
          </div>
        </div>
      ))}
    </div>
  );
}

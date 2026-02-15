import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function BusinessesPage() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    fetchList();
  }, []);
  async function fetchList() {
    const res = await api.get('/api/businesses');
    setList(res.data);
  }

  async function changeTax(id: string) {
    const tax = Number(prompt('New tax rate (e.g., 5.00)') || 0);
    await api.post(`/api/businesses/${id}/tax`, { taxRate: tax });
    fetchList();
  }

  return (
    <div>
      <h2>Businesses</h2>
      {list.map((b) => (
        <div key={b.id} className="card">
          <h3>{b.name}</h3>
          <p>Type: {b.type}</p>
          <p>Tax Rate: {b.taxRate}</p>
          <div className="card-actions">
            <button onClick={() => changeTax(b.id)}>Change Tax</button>
          </div>
        </div>
      ))}
    </div>
  );
}

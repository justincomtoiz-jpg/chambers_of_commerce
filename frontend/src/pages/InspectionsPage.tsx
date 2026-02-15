import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuthStore } from '../stores/auth';

export default function InspectionsPage() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({
    targetId: '',
    targetType: 'Business',
    justification: 'Random',
    notes: '',
  });
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    const res = await api.get('/api/inspections');
    setList(res.data);
  }

  async function create() {
    await api.post('/api/inspections', form);
    setForm({
      targetId: '',
      targetType: 'Business',
      justification: 'Random',
      notes: '',
    });
    fetchList();
  }

  async function release(id: string) {
    await api.post(`/api/inspections/${id}/release`);
    fetchList();
  }

  return (
    <div>
      <h2>Inspections</h2>
      <div className="card">
        <h3>Create Inspection</h3>
        <input
          placeholder="Target ID"
          value={form.targetId}
          onChange={(e) => setForm({ ...form, targetId: e.target.value })}
        />
        <select
          value={form.targetType}
          onChange={(e) => setForm({ ...form, targetType: e.target.value })}
        >
          <option value="Business">Business</option>
          <option value="Event">Event</option>
        </select>
        <select
          value={form.justification}
          onChange={(e) => setForm({ ...form, justification: e.target.value })}
        >
          <option>For Cause</option>
          <option>Random</option>
          <option>Scheduled</option>
          <option>PD Requested</option>
        </select>
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button onClick={create}>Create</button>
      </div>

      <h3>Queue</h3>
      {list.map((i) => (
        <div key={i.id} className="card">
          <p>
            {i.targetType} {i.targetId}
          </p>
          <p>{i.justification}</p>
          <p>{i.status}</p>
          <div className="card-actions">
            {user.grade >= 2 && i.status === 'Quarantined' && (
              <button onClick={() => release(i.id)}>Release</button>
            )}
            {i.status === 'Pending' && (
              <button
                onClick={() =>
                  api.post(`/api/inspections/${i.id}/complete`).then(fetchList)
                }
              >
                Complete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

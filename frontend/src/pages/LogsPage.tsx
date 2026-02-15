import React, { useEffect, useState } from 'react';
import api from '../api/client';

export default function LogsPage() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    fetch();
  }, []);
  async function fetch() {
    const res = await api.get('/api/logs');
    setList(res.data);
  }

  return (
    <div>
      <h2>Logs</h2>
      <div className="logs">
        {list.map((l) => (
          <div key={l.id} className="log-row">
            <div>
              <strong>{l.action}</strong> — {l.entityType} {l.entityId}
            </div>
            <div>
              <small>
                {new Date(l.timestamp).toLocaleString()} by {l.performedBy}{' '}
                (grade {l.performedByGrade})
              </small>
            </div>
            <pre>{JSON.stringify(l.details, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

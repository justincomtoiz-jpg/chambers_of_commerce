import React, { useEffect, useState } from 'react';
import api from '../api/client';
import DiffViewer from '../components/DiffViewer';

export default function LogsPage() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { fetch(); }, []);
  async function fetch() {
    const res = await api.get('/api/logs');
    setList(res.data);
  }

  return (
    <div>
      <h2>Logs</h2>
      <div className="logs">
        {list.map(l => (
          <div key={l.id} className="log-row">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><strong>{l.action}</strong> — {l.entityType} {l.entityId}</div>
              <div><small>{new Date(l.timestamp).toLocaleString()} by {l.performedBy} (grade {l.performedByGrade})</small></div>
            </div>

            {l.details?.before && l.details?.after ? (
              <div style={{ marginTop: 8 }}>
                <h4>Changes</h4>
                <DiffViewer before={l.details.before} after={l.details.after} />
              </div>
            ) : (
              <pre style={{ marginTop: 8 }}>{JSON.stringify(l.details, null, 2)}</pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

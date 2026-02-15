import React from 'react';
import { diffJson } from 'diff';

export default function DiffViewer({ before, after }: any) {
  const beforeObj = typeof before === 'string' ? JSON.parse(before) : before || {};
  const afterObj = typeof after === 'string' ? JSON.parse(after) : after || {};
  const changes = diffJson(beforeObj, afterObj);
  return (
    <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
      {changes.map((part: any, i: number) => {
        const color = part.added ? 'rgba(40, 167, 69, 0.12)' : part.removed ? 'rgba(220, 53, 69, 0.12)' : 'transparent';
        const borderLeft = part.added ? '4px solid rgba(40,167,69,0.6)' : part.removed ? '4px solid rgba(220,53,69,0.6)' : '4px solid transparent';
        return (
          <div key={i} style={{ background: color, borderLeft, padding: '6px 8px', marginBottom: 4 }}>
            {part.value}
          </div>
        );
      })}
    </div>
  );
}

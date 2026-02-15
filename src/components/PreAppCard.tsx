// src/components/PreAppCard.tsx
import React from 'react';
import { PreApp } from '../types';

export function PreAppCard({
  app,
  onOpen,
}: {
  app: PreApp;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{app.businessName}</h3>
        <span className="chip">Pending Review</span>
      </div>
      <div className="card-body">
        <p>
          <strong>Requestor</strong> {app.requestorName}
        </p>
        <p>
          <strong>Type</strong> {app.type}
        </p>
        <p>
          <strong>Budget</strong> ${app.budget.toLocaleString()}
        </p>
      </div>
      <div className="card-actions">
        <button onClick={() => onOpen(app.id)}>Open</button>
      </div>
    </div>
  );
}

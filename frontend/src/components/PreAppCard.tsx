import React from 'react';
import { formatUSD } from '../utils/format';

export function PreAppCard({ app, onOpen, onSendForFormal, userGrade }: any) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{app.businessName}</h3>
        <span className="chip">{app.status}</span>
      </div>
      <div className="card-body">
        <p>
          <strong>Requestor:</strong> {app.requestorName}
        </p>
        <p>
          <strong>Type:</strong> {app.type}
        </p>
        <p>
          <strong>Budget:</strong> {formatUSD(app.budget)}
        </p>
        <p>
          <small>{new Date(app.createdAt).toLocaleString()}</small>
        </p>
      </div>
      <div className="card-actions">
        <button onClick={onOpen}>Open</button>
        {userGrade >= 0 && (
          <button onClick={onSendForFormal}>Send for Formal</button>
        )}
      </div>
    </div>
  );
}

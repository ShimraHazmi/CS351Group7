import React from 'react';
import { useRecentActivity } from '../context/RecentActivityContext';

export default function RecentActivity({ limit = 10 }) {
  const { items, clear } = useRecentActivity();

  return (
    <div className="recent-activity">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong>Recent Activity</strong>
        <button onClick={clear} style={{ fontSize: 12 }}>Clear</button>
      </div>

      {items.length === 0 ? (
        <div style={{ color: '#666', fontStyle: 'italic' }}>No recent activity</div>
      ) : (
        <ul style={{ paddingLeft: 12, margin: 0 }}>
          {items.slice(0, limit).map((it) => (
            <li key={it.id} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{new Date(it.timestamp).toLocaleString()}</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{it.description || it.label || it.action}</div>
              {it.meta && (
                <div style={{ fontSize: 12, color: '#666' }}>
                  {Object.entries(it.meta).map(([k, v], i) => (
                    <span key={k} style={{ marginRight: 10 }}>{k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '';

export default function HealthBadge() {
  const [health, setHealth] = useState(null); // null | 'ok' | 'error'

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        const json = await res.json();
        setHealth(json.status === 'ok' ? 'ok' : 'error');
      } catch {
        setHealth('error');
      }
    };
    check();
    const interval = setInterval(check, 30000); // re-check every 30s
    return () => clearInterval(interval);
  }, []);

  if (health === null) return null;

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
      health === 'ok'
        ? 'text-green-700 bg-green-50 border-green-200'
        : 'text-red-700 bg-red-50 border-red-200'
    }`}>
      <span className={`w-2 h-2 rounded-full ${health === 'ok' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      API {health === 'ok' ? 'Online' : 'Offline'}
    </div>
  );
}

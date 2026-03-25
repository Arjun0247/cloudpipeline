import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '';

export function useItems() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch all items ────────────────────────────────────────────────────────
  const fetchItems = useCallback(async (nameFilter = '') => {
    setLoading(true);
    setError(null);
    try {
      const query = nameFilter ? `?name=${encodeURIComponent(nameFilter)}` : '';
      const res = await fetch(`${API_BASE}/api/items${query}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      setItems(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ── Create a new item ──────────────────────────────────────────────────────
  const createItem = async ({ name, description }) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create item');
      setItems(prev => [json.data, ...prev]);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  };

  return { items, loading, error, submitting, fetchItems, createItem };
}

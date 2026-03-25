import { useState, useCallback } from 'react';
import { useItems } from './hooks/useItems';
import ItemCard from './components/ItemCard';
import AddItemForm from './components/AddItemForm';
import SearchBar from './components/SearchBar';
import HealthBadge from './components/HealthBadge';

export default function App() {
  const { items, loading, error, submitting, fetchItems, createItem } = useItems();
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search — triggers a new API call with filter
  const handleSearch = useCallback(
    (term) => {
      setSearchTerm(term);
      fetchItems(term);
    },
    [fetchItems]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Logo mark */}
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">CloudPipeline</span>
          </div>
          <HealthBadge />
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — Add form */}
          <div className="lg:col-span-1">
            <AddItemForm onSubmit={createItem} submitting={submitting} />

            {/* Error toast */}
            {error && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0V8.75a.75.75 0 00-1.5 0v4.5zm.75-6a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/>
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right column — Items list */}
          <div className="lg:col-span-2 space-y-4">

            {/* Header + search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">Items</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {loading ? 'Loading...' : `${items.length} item${items.length !== 1 ? 's' : ''}${searchTerm ? ` matching "${searchTerm}"` : ''}`}
                </p>
              </div>
              <div className="sm:w-64">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>

            {/* States */}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm font-medium">No items found</p>
                <p className="text-xs mt-1">Try a different search or add a new item.</p>
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <div className="space-y-3">
                {items.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

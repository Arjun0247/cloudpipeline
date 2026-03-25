export default function ItemCard({ item }) {
  const date = new Date(item.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base truncate">{item.name}</h3>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">{item.description}</p>
        </div>
        <span className="shrink-0 bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full border border-brand-100">
          Item
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <span className="font-mono truncate">{item.id}</span>
        <span>{date}</span>
      </div>
    </div>
  );
}

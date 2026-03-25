import { useState } from 'react';

export default function AddItemForm({ onSubmit, submitting }) {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim())        errs.name        = 'Name is required';
    if (!description.trim()) errs.description = 'Description is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});

    const result = await onSubmit({ name: name.trim(), description: description.trim() });
    if (result?.success) {
      setName('');
      setDescription('');
    }
  };

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
      fieldErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Add New Item</h2>

      <div className="space-y-3">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. My New Item"
            className={inputClass('name')}
          />
          {fieldErrors.name && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe this item..."
            rows={3}
            className={`${inputClass('description')} resize-none`}
          />
          {fieldErrors.description && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-colors duration-150"
        >
          {submitting ? 'Adding...' : 'Add Item'}
        </button>
      </div>
    </form>
  );
}

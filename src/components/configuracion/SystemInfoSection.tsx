import React, { useState, useEffect } from 'react';

const LOADER_KEY = 'aminflowers_loader_type';

const options = [
  { value: 'flor', label: 'Flor' },
  { value: 'girasol', label: 'Girasol' },
];

export default function SystemInfoSection() {
  const [loaderType, setLoaderType] = useState('flor');

  useEffect(() => {
    const saved = localStorage.getItem(LOADER_KEY);
    if (saved && options.some(opt => opt.value === saved)) {
      setLoaderType(saved);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoaderType(e.target.value);
    localStorage.setItem(LOADER_KEY, e.target.value);
  };

  return (
    <section className="mb-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold text-primary-700 mb-2">Info de sistema</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Loader de sistema</label>
        <div className="flex gap-6">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="loaderType"
                value={opt.value}
                checked={loaderType === opt.value}
                onChange={handleChange}
                className="accent-primary-600"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-500">Elige el loader que prefieres ver en el sistema.</p>
    </section>
  );
}

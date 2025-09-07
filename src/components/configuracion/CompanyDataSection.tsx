import React, { useState, useEffect } from 'react';
import { getCompanyData, updateCompanyData } from '../../services/companyService';
import type { CompanyData } from '../../services/companyService';
import { useAlert } from '../../contexts/AlertContext';
import SystemLoader from '../../components/ui/SystemLoader';

const CompanyDataSection: React.FC = () => {
  const [data, setData] = useState<CompanyData>({
    app_name: '',
    app_description: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showError, showSuccess } = useAlert();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await getCompanyData();
        setData(d);
      } catch (e) {
        setError('No se pudieron cargar los datos');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateCompanyData(data);
      showSuccess('Datos guardados correctamente');
      localStorage.setItem('companyData', JSON.stringify(data));
      window.location.reload();
    } catch (e) {
      showError('No se pudo guardar');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-gray-100 relative">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary-700">
        <span>🖥️</span> Info de sistema
      </h2>
      {loading ? (
        <SystemLoader />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la aplicación *</label>
            <input
              name="app_name"
              value={data.app_name ?? ''}
              onChange={handleChange}
              placeholder="Ejemplo: Amin Flowers"
              className="border border-primary-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm shadow-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Este nombre se muestra en el menú lateral y en los bauchers</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción de la aplicación *</label>
            <input
              name="app_description"
              value={data.app_description ?? ''}
              onChange={handleChange}
              placeholder="Breve descripción de la empresa"
              className="border border-primary-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm shadow-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Esta descripción se muestra en los bauchers.</p>
          </div>
          <div className="flex gap-2 items-center mt-2">
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg shadow transition disabled:opacity-60"
              disabled={saving}
            >
              {saving ? <span className="flex items-center gap-2">Guardando...</span> : 'Guardar'}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          {saving && (
            <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10">
              <SystemLoader />
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default CompanyDataSection;

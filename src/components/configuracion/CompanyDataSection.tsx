import React, { useState, useEffect } from 'react';
import { getCompanyData, updateCompanyData } from '../../services/companyService';
import type { CompanyData } from '../../services/companyService';
import { useAlert } from '../../contexts/AlertContext';

const CompanyDataSection: React.FC = () => {
  const [data, setData] = useState<CompanyData>({
    app_name: '',
    app_description: '',
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_document: '',
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateCompanyData(data);
      showSuccess('Datos guardados correctamente');
    } catch (e) {
      showError('No se pudo guardar');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-gray-100">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary-700">
        <span>🏢</span> Datos de la compañía
      </h2>
      {loading ? (
        <div className="text-primary-600">Cargando...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nombre de la empresa *</label>
            <input name="company_name" value={data.company_name ?? ''} onChange={handleChange} className="border border-gray-300 rounded-lg px-3 py-2 w-full" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Dirección *</label>
            <input name="company_address" value={data.company_address ?? ''} onChange={handleChange} className="border border-gray-300 rounded-lg px-3 py-2 w-full" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Teléfono</label>
            <input name="company_phone" value={data.company_phone ?? ''} onChange={handleChange} className="border border-gray-300 rounded-lg px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Correo electrónico</label>
            <input name="company_email" value={data.company_email ?? ''} onChange={handleChange} className="border border-gray-300 rounded-lg px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">RUC</label>
            <input name="company_document" value={data.company_document ?? ''} onChange={handleChange} className="border border-gray-300 rounded-lg px-3 py-2 w-full" />
          </div>
          <div className="flex gap-2 items-center">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg shadow transition disabled:opacity-60" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CompanyDataSection;

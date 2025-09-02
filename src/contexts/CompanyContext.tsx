import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCompanyData, updateCompanyData, type CompanyData } from '../services/companyService';
import { useAuth } from './AuthContext';

interface CompanyContextProps {
  data: CompanyData | null;
  loading: boolean;
  refresh: () => Promise<void>;
  update: (data: CompanyData) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextProps | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth(); 
  const [data, setData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {

    // No intentamos cargar datos si no hay usuario autenticado
    if (!currentUser) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const d = await getCompanyData();
      setData(d);
    } finally {
      setLoading(false);
    }
  };

  const update = async (newData: CompanyData) => {
    await updateCompanyData(newData);
    await refresh();
  };

  useEffect(() => {
    if (currentUser) {
      refresh();
    } else {
      // Si no hay usuario, limpiamos los datos
      setData(null);
      setLoading(false);
    }
  }, [currentUser]); 
  return (
    <CompanyContext.Provider value={{ data, loading, refresh, update }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany debe usarse dentro de CompanyProvider');
  return ctx;
};

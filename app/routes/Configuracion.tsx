import React, { useState } from 'react';
import PageLayout from 'src/components/layout/PageLayout';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import CompanyDataSection from '../../src/components/configuracion/CompanyDataSection';
import PaymentMethodsSection from '../../src/components/configuracion/PaymentMethodsSection';


export default function Configuracion() {
  const [selected, setSelected] = useState<'company' | 'payment'>('company');
  return (
    <DashboardLayout>
      <PageLayout
        title="Configuración"
        description="Configuración general del sistema"
      >
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-stretch min-h-[500px]">
          <aside id='sidebarConfig' className="w-full md:w-56 min-w-[140px] md:h-full pt-2">
            <nav className="flex md:flex-col flex-row gap-1">
              <button
                className={`flex items-center gap-2 px-3 py-2 text-base font-medium rounded transition text-left ${selected === 'company'
                  ? 'md:border-l-4 border-b-4 md:border-b-0 border-primary-600 bg-primary-50 text-primary-800'
                  : 'md:border-l-4 border-b-4 md:border-b-0 border-transparent text-gray-700 hover:bg-gray-100'}
                `}
                onClick={() => setSelected('company')}
                style={{ minWidth: 0, flex: 1 }}
              >
                <span>🏢</span> <span className="hidden sm:inline">Datos de la compañía</span>
              </button>
              <button
                className={`flex items-center gap-2 px-3 py-2 text-base font-medium rounded transition text-left ${selected === 'payment'
                  ? 'md:border-l-4 border-b-4 md:border-b-0 border-primary-600 bg-primary-50 text-primary-800'
                  : 'md:border-l-4 border-b-4 md:border-b-0 border-transparent text-gray-700 hover:bg-gray-100'}
                `}
                onClick={() => setSelected('payment')}
                style={{ minWidth: 0, flex: 1 }}
              >
                <span>💳</span> <span className="hidden sm:inline">Métodos de pago</span>
              </button>
            </nav>
          </aside>
          <main className="flex-1 flex flex-col justify-start min-h-[500px]">
            {selected === 'company' && <CompanyDataSection />}
            {selected === 'payment' && <PaymentMethodsSection />}
          </main>
        </div>
      </PageLayout>
    </DashboardLayout>
  );
}

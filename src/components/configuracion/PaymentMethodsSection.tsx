import React, { useEffect, useState } from "react";
import { CheckIcon, PencilIcon, TrashIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import Table, { TableContainer } from '../../components/ui/Table';
import { getPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } from '../../services/PaymentMethodService';
import type { PaymentMethod } from '../../services/PaymentMethodService';
import { useAlert } from '../../contexts/AlertContext';

const PaymentMethodsSection: React.FC = () => {
  const [items, setItems] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const { showSuccess, showError } = useAlert();

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await getPaymentMethods();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await addPaymentMethod({ name: newName, is_active: 1 });
      showSuccess('Método de pago creado correctamente');
      setNewName("");
      fetchList();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.messagea || 'Error al crear el método de pago';
      const errors = error?.response?.data?.errors;
      showError(errorMessage, 7000, errors);
    }
  };

  const handleEdit = (item: PaymentMethod) => {
    setEditingId(item.id!);
    setEditName(item.name);
  };

  const handleUpdate = async (id: number) => {
    try {
      await updatePaymentMethod(id, { name: editName });
      setEditingId(null);
      setEditName("");
      fetchList();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error al actualizar el método de pago';
      const errors = error?.response?.data?.errors;
      showError(errorMessage, 7000, errors);
    }
  };

  const handleDelete = async (id: number) => {
    await deletePaymentMethod(id);
    fetchList();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 space-y-6 border border-gray-100">
      <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-primary-700">
        <span>💳</span> Métodos de pago
      </h2>
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 mb-4 w-full">
        <input
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-primary-200 transition text-sm sm:text-base"
          placeholder="Nuevo método de pago"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button type="submit" className="flex items-center justify-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg shadow transition text-sm sm:text-base w-full sm:w-auto">
          <PlusIcon className="h-5 w-5" />
          <span className="hidden xs:inline">Agregar</span>
        </button>
      </form>
      {loading ? (
        <div className="text-center text-primary-600 font-semibold">Cargando...</div>
      ) : (
        <TableContainer>
          <Table
            columns={[ 
              {
                key: 'name',
                header: 'Nombre',
                render: (item) =>
                  editingId === item.id ? (
                    <input
                      className="border border-primary-300 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-primary-200 text-sm sm:text-base"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  ) : (
                    <span className={item.is_active ? "font-medium" : "text-gray-500 font-medium"}>{item.name}</span>
                  ),
              },
              {
                key: 'actions',
                header: '',
                className: 'w-24 text-right',
                render: (item) =>
                  editingId === item.id ? (
                    <div className="flex gap-1 justify-end">
                      <button title="Guardar" className="text-green-600 hover:bg-green-50 rounded p-1" onClick={() => handleUpdate(item.id!)}>
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button title="Cancelar" className="text-gray-500 hover:bg-gray-100 rounded p-1" onClick={() => setEditingId(null)}>
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1 justify-end">
                      <button title="Editar" className="text-blue-600 hover:bg-blue-50 rounded p-1" onClick={() => handleEdit(item)}>
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button title="Eliminar" className="text-red-600 hover:bg-red-50 rounded p-1" onClick={() => handleDelete(item.id!)}>
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ),
              },
            ]}
            data={items}
            keyExtractor={item => item.id!}
            emptyMessage="No hay métodos de pago registrados."
          />
        </TableContainer>
      )}
    </div>
  );
};

export default PaymentMethodsSection;

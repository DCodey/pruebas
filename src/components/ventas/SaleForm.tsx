import React, { useState, useEffect } from 'react';
import type { NewSaleData, SaleItem } from '../../services/saleService';
import { getClients, type Client } from '../../services/clientService';
import { getProducts, type Product } from '../../services/productService';
import Input from '../ui/Input';

interface SaleFormProps {
  onSubmit: (formData: NewSaleData) => void;
  onClose: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSubmit, onClose }) => {
  // Estados del formulario
  const [clientType, setClientType] = useState<'registered' | 'anonymous'>('registered');
  const [productType, setProductType] = useState<'registered' | 'custom'>('registered');
  
  // Datos de la BD
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Estado de la venta actual
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [anonymousClientName, setAnonymousClientName] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [total, setTotal] = useState(0);

  // Campos para producto personalizado
  const [customProductName, setCustomProductName] = useState('');
  const [customProductPrice, setCustomProductPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsData = await getClients();
        setClients(clientsData);
        if (clientsData.length > 0) setSelectedClientId(clientsData[0].id);
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error cargando datos para la venta: ", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const newTotal = saleItems.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0);
    setTotal(newTotal);
  }, [saleItems]);

  const handleAddRegisteredProduct = (productId: string) => {
    if (!productId) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItemIndex = saleItems.findIndex(item => item.productId === productId);
    if (existingItemIndex > -1) {
      updateItemQuantity(existingItemIndex, saleItems[existingItemIndex].cantidad + 1);
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        nombre: product.nombre,
        cantidad: 1,
        precioUnitario: product.precioVenta,
      };
      setSaleItems([...saleItems, newItem]);
    }
  };

  const handleAddCustomProduct = () => {
    if (!customProductName.trim() || customProductPrice <= 0) {
      alert('Por favor, ingresa un nombre y un precio válido para el producto personalizado.');
      return;
    }
    const newItem: SaleItem = {
      productId: null,
      nombre: customProductName,
      cantidad: 1,
      precioUnitario: customProductPrice,
    };
    setSaleItems([...saleItems, newItem]);
    // Limpiar campos
    setCustomProductName('');
    setCustomProductPrice(0);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const item = saleItems[index];
    // Si es un producto registrado, verificar stock
    if (item.productId) {
      const product = products.find(p => p.id === item.productId);
      if (product && quantity > product.stock) {
        alert(`Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}`);
        return;
      }
    }

    const newItems = [...saleItems];
    if (quantity <= 0) {
      newItems.splice(index, 1); // Eliminar el item
    } else {
      newItems[index] = { ...item, cantidad: quantity };
    }
    setSaleItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saleData: NewSaleData = {
      clienteId: clientType === 'registered' ? selectedClientId : null,
      nombreCliente: clientType === 'registered' 
        ? clients.find(c => c.id === selectedClientId)?.nombre || 'Error'
        : anonymousClientName.trim() || 'Anónimo',
      items: saleItems,
      total,
    };
    onSubmit(saleData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      {/* ... (sección de cliente sin cambios) ... */}
      <fieldset>
        <legend className="text-base font-medium text-gray-900">Cliente</legend>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-x-4">
            <label><input type="radio" name="clientType" value="registered" checked={clientType === 'registered'} onChange={() => setClientType('registered')} className="mr-2"/>Cliente Registrado</label>
            <label><input type="radio" name="clientType" value="anonymous" checked={clientType === 'anonymous'} onChange={() => setClientType('anonymous')} className="mr-2"/>Cliente Nuevo</label>
          </div>
          {clientType === 'registered' ? (
            <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
              {clients.map(client => <option key={client.id} value={client.id}>{client.nombre}</option>)}
            </select>
          ) : (
            <Input id="anonymousName" name="anonymousName" label="Nombre del Cliente" value={anonymousClientName} onChange={e => setAnonymousClientName(e.target.value)} />
          )}
        </div>
      </fieldset>

      {/* Sección de Productos */}
      <fieldset>
        <legend className="text-base font-medium text-gray-900">Productos</legend>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-x-4">
            <label><input type="radio" name="productType" value="registered" checked={productType === 'registered'} onChange={() => setProductType('registered')} className="mr-2"/>Producto Registrado</label>
            <label><input type="radio" name="productType" value="custom" checked={productType === 'custom'} onChange={() => setProductType('custom')} className="mr-2"/>Producto Personalizado</label>
          </div>
          {productType === 'registered' ? (
            <select onChange={e => handleAddRegisteredProduct(e.target.value)} value="" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
              <option value="">Selecciona un producto para añadir...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.nombre} - Stock: {p.stock}</option>)}
            </select>
          ) : (
            <div className="flex items-end gap-x-4">
              <Input id="customName" name="customName" label="Nombre" value={customProductName} onChange={e => setCustomProductName(e.target.value)} />
              <Input type="number" id="customPrice" name="customPrice" label="Precio" value={customProductPrice.toString()} onChange={e => setCustomProductPrice(parseFloat(e.target.value) || 0)} />
              <button type="button" onClick={handleAddCustomProduct} className="rounded-md bg-secondary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-secondary-500">Añadir</button>
            </div>
          )}
        </div>
      </fieldset>

      {/* Lista de Productos en la Venta */}
      <div className="space-y-2">
        {saleItems.map((item, index) => (
          <div key={item.productId || `${item.nombre}-${index}`} className="flex items-center justify-between gap-x-4 p-2 border rounded-md">
            <span className="flex-1">{item.nombre}{!item.productId && ' (Personalizado)'}</span>
            <div className="flex items-center gap-x-2">
              <input type="number" value={item.cantidad} onChange={e => updateItemQuantity(index, parseInt(e.target.value, 10))} className="w-16 rounded-md border-gray-300 text-center" />
              <span>x S/{item.precioUnitario.toFixed(2)}</span>
            </div>
            <span>= S/{(item.cantidad * item.precioUnitario).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Total y Acciones ... */}
       <div className="text-right text-xl font-bold">
        Total: S/{total.toFixed(2)}
      </div>
      <div className="mt-8 flex justify-end gap-x-4">
        <button type="button" onClick={onClose} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancelar</button>
        <button type="submit" disabled={saleItems.length === 0} className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:opacity-50">Registrar Venta</button>
      </div>
    </form>
  );
};

export default SaleForm;

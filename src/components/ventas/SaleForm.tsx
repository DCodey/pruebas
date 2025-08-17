import React, { useState, useEffect } from 'react';
import type { NewSaleData, SaleItem, PaymentMethod } from '../../services/firebase/saleService';
import { getClients, type Client } from '../../services/firebase/clientService';
import { getProducts, type Product } from '../../services/firebase/productService';
import { 
  getCurrentDateUTC, 
  formatForDateInput,
  updateDateKeepingTime,
} from '../../utils/dateUtils';
import Input from '../ui/Input';
import { TrashIcon } from '@heroicons/react/24/outline';

interface SaleFormProps {
  onSubmit: (formData: NewSaleData) => void;
  onClose: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSubmit, onClose }) => {
  // Estados del formulario
  const [clientType, setClientType] = useState<'registered' | 'anonymous'>('anonymous');
  const [productType, setProductType] = useState<'registered' | 'custom'>('custom');
  
  // Datos de la BD
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fechaDeVenta, setFechaDeVenta] = useState<Date>(getCurrentDateUTC());
  
  // Estado de la venta actual
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [anonymousClientName, setAnonymousClientName] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');

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
      if (product) {
        // Verificar stock solo si no es un producto con stock ilimitado (null) y no está agotado (stock > 0)
        if (product.stock !== null && product.stock > 0 && quantity > product.stock) {
          alert(`Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}`);
          return;
        }
        // Mostrar advertencia si el producto está agotado
        if (product.stock === 0) {
          const confirmar = window.confirm(`Advertencia: ${product.nombre} está marcado como agotado. ¿Desea continuar de todos modos?`);
          if (!confirmar) return;
        }
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
      paymentMethod,
      fechaDeVenta: fechaDeVenta,
    };
    onSubmit(saleData);
  };

  return (
    <form id="sale-form" onSubmit={handleSubmit} className="space-y-6 sm:p-4 max-w-4xl mx-auto">
      {/* Sección de Cliente */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Datos del Cliente</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="clientType"
                value="anonymous"
                checked={clientType === 'anonymous'}
                onChange={() => setClientType('anonymous')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Cliente Nuevo</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="clientType"
                value="registered"
                checked={clientType === 'registered'}
                onChange={() => setClientType('registered')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Cliente Registrado</span>
            </label>
          </div>
          
          {clientType === 'registered' ? (
            <div className="mt-2">
              <label htmlFor="client-select" className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Cliente
              </label>
              <select
                id="client-select"
                value={selectedClientId}
                onChange={e => setSelectedClientId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
              >
                <option value="">Selecciona un cliente...</option>
                {clients.length === 0 && <option value="">No hay clientes registrados</option>}
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.nombre}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mt-2">
              <Input
                id="anonymousName"
                name="anonymousName"
                label="Nombre del Cliente (opcional)"
                placeholder="Ej: Juan Perez"
                value={anonymousClientName}
                onChange={e => setAnonymousClientName(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

       {/* Método de Pago */}
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Método de Pago</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['Efectivo', 'Tarjeta','Yape', 'Plin', 'Lemon'] as PaymentMethod[]).map((method) => (
              <label key={method} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                  {method}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Sección de Productos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Agregar Productos</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="productType"
                value="registered"
                checked={productType === 'registered'}
                onChange={() => setProductType('registered')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Producto Registrado</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="productType"
                value="custom"
                checked={productType === 'custom'}
                onChange={() => setProductType('custom')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Producto Personalizado</span>
            </label>
          </div>

          {productType === 'registered' ? (
            <div className="mt-2">
              <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Producto
              </label>
              <select
                id="product-select"
                onChange={e => handleAddRegisteredProduct(e.target.value)}
                value=""
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
              >
                <option value="">Selecciona un producto para añadir...</option>
                {products.map(p => {
                  let stockText = '';
                  if (p.stock === null) {
                    stockText = 'Stock: Ilimitado';
                  } else if (p.stock <= 0) {
                    stockText = 'AGOTADO';
                  } else {
                    stockText = `Stock: ${p.stock}`;
                  }
                  
                  return (
                    <option 
                      key={p.id} 
                      value={p.id}
                      disabled={p.stock === 0}
                      className={p.stock === 0 ? 'text-red-500' : ''}
                    >
                      {p.nombre} - {stockText} - S/{p.precioVenta.toFixed(2)}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-2">
                <Input
                  id="customName"
                  name="customName"
                  label="Nombre del Producto"
                  value={customProductName}
                  onChange={e => setCustomProductName(e.target.value)}
                  placeholder="Ej: Arreglo de Rosas"
                />
              </div>
              <div>
                <Input
                  type="number"
                  id="customPrice"
                  name="customPrice"
                  label="Precio (S/)"
                  value={customProductPrice.toString()}
                  onChange={e => setCustomProductPrice(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex items-end h-[70px]">
                <button
                  type="button"
                  onClick={handleAddCustomProduct}
                  disabled={!customProductName.trim() || customProductPrice <= 0}
                  className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Añadir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>    

      {/* Resumen de la Venta */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg text-sm font-medium md:text-xl text-gray-900">Resumen de la Venta</h3>
          <div className="flex items-center text-sm">
              <input 
                type="date" 
                value={formatForDateInput(fechaDeVenta)} 
                onChange={(e) => {
                  // Actualizar solo la fecha, manteniendo la hora actual
                  const newDate = updateDateKeepingTime(fechaDeVenta, e.target.value);
                  setFechaDeVenta(newDate);
                }} 
                className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
              />
            </div>
        </div>
        <div className="p-4">
          {saleItems.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No hay productos en la venta</p>
              <p className="text-sm mt-1">Agrega productos usando el formulario superior</p>
            </div>
          ) : (
            <>            
              <div className="divide-y divide-gray-200">
                {saleItems.map((item, index) => (
                  <div key={item.productId || `${item.nombre}-${index}`} className="py-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.nombre}</p>
                      {item.productId && (() => {
                        const product = products.find(p => p.id === item.productId);
                        if (!product) return null;
                        
                        let stockText = '';
                        let textClass = 'text-gray-500';
                        
                        if (product.stock === null) {
                          stockText = 'Stock: Ilimitado';
                          textClass = 'text-green-600';
                        } else if (product.stock <= 0) {
                          stockText = 'AGOTADO';
                          textClass = 'text-red-500 font-medium';
                        } else {
                          stockText = `${product.stock} en stock`;
                          // Show warning if stock is low (less than 5 items)
                          if (product.stock < 5) {
                            textClass = 'text-yellow-600 font-medium';
                          }
                        }
                        
                        return (
                          <p className={`text-xs ${textClass}`}>
                            {stockText}
                          </p>
                        );
                      })()}
                    </div>
                    <div className="ml-4 flex items-center space-x-2 sm:space-x-4">
                      <div className="flex items-center border rounded-md">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(index, Math.max(1, item.cantidad - 1))}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.cantidad}
                          min="1"
                          onChange={e => updateItemQuantity(index, parseInt(e.target.value, 10) || 1)}
                          className="sm:w-12 w-8 text-center border-0 focus:ring-0"
                        />
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(index, item.cantidad + 1)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md"
                        >
                          +
                        </button>
                      </div>
                      <div className="w-auto text-right">
                        <p className="text-sm font-medium">S/{(item.cantidad * item.precioUnitario).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">S/{item.precioUnitario.toFixed(2)} c/u</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(index, 0)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-gray-900">S/{total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </form>
  );
};

export default SaleForm;

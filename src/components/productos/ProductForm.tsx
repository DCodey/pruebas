import React, { useState, useEffect } from 'react';
import type { Product } from '../../services/productService';
import Input from '../ui/Input';

interface ProductFormProps {
  product: Omit<Product, 'id'> | Product | null;
  onSubmit: (formData: Omit<Product, 'id'>) => void;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precioCosto: 0,
    precioVenta: 0,
    stock: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precioCosto: product.precioCosto,
        precioVenta: product.precioVenta,
        stock: product.stock,
      });
    } else {
      // Reset form for new product
      setFormData({
        nombre: '',
        descripcion: '',
        precioCosto: 0,
        precioVenta: 0,
        stock: 0,
      });
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6 pt-4">
        <Input
          id="nombre"
          name="nombre"
          label="Nombre del Producto"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <Input
          as="textarea"
          id="descripcion"
          name="descripcion"
          label="Descripción"
          value={formData.descripcion}
          onChange={handleChange}
          rows={3}
          required
        />
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <Input
            type="number"
            id="precioCosto"
            name="precioCosto"
            label="Precio de Costo"
            value={formData.precioCosto.toString()}
            onChange={handleChange}
            step="0.01"
            required
          />
          <Input
            type="number"
            id="precioVenta"
            name="precioVenta"
            label="Precio de Venta"
            value={formData.precioVenta.toString()}
            onChange={handleChange}
            step="0.01"
            required
          />
        </div>
        <Input
          type="number"
          id="stock"
          name="stock"
          label="Stock Disponible"
          value={formData.stock.toString()}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mt-8 flex justify-end gap-x-4 fixed bottom-0 left-0 right-0">
        <button type="button" onClick={onClose} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">Guardar</button>
      </div>
    </form>
  );
};

export default ProductForm;

import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../../services/firebase/productService';
import Input from '../ui/Input';
import Checkbox from '../ui/Checkbox';

interface ProductFormProps {
  product: Omit<Product, 'id'> | Product | null;
  onSubmit: (formData: Omit<Product, 'id'>) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

interface FormData {
  nombre: string;
  descripcion: string;
  precioCosto: number;
  precioVenta: number;
  stock: number | null;
  hasUnlimitedStock: boolean;
}

interface FormErrors {
  nombre?: string;
  descripcion?: string;
  precioCosto?: string;
  precioVenta?: string;
  stock?: string;
}

const MAX_DESCRIPTION_LENGTH = 500;

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onClose, isSubmitting = false }) => {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    precioCosto: 0,
    precioVenta: 0,
    stock: 0,
    hasUnlimitedStock: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      const hasUnlimitedStock = product.stock === null;
      setFormData(prev => ({
        ...prev,
        nombre: product.nombre,
        descripcion: product.descripcion,
        precioCosto: product.precioCosto,
        precioVenta: product.precioVenta,
        stock: hasUnlimitedStock ? 0 : product.stock,
        hasUnlimitedStock,
      }));
    }
  }, [product]);


  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es requerido';
    }

    if (formData.precioCosto <= 0) {
      newErrors.precioCosto = 'El precio de costo debe ser mayor a 0';
    }

    if (formData.precioVenta <= 0) {
      newErrors.precioVenta = 'El precio de venta debe ser mayor a 0';
    } else if (formData.precioVenta < formData.precioCosto) {
      newErrors.precioVenta = 'El precio de venta no puede ser menor al costo';
    }

    if (formData.stock !== null && formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'hasUnlimitedStock') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        hasUnlimitedStock: isChecked,
        stock: isChecked ? null : (prev.stock || 0),
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: name.includes('precio') || name === 'stock'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  return (
    <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {/* Product Name */}
        <div>
          <Input
            id="nombre"
            name="nombre"
            label="Nombre del Producto *"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Ramo de Rosas Rojas"
            error={errors.nombre}
            required
          />
        </div>

        {/* Description */}
        <div>
          <Input
            as="textarea"
            id="descripcion"
            name="descripcion"
            label="Descripción"
            placeholder="Describe el producto en detalle..."
            value={formData.descripcion}
            onChange={handleChange}
            rows={4}
          />
          {errors.descripcion && (
            <p className="mt-2 text-sm text-red-600">{errors.descripcion}</p>
          )}
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <Input
              type="number"
              id="precioCosto"
              name="precioCosto"
              label="Precio de Costo *"
              value={formData.precioCosto || ''}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              error={errors.precioCosto}
              required
            />
          </div>
          <div>
            <Input
              type="number"
              id="precioVenta"
              name="precioVenta"
              label="Precio de Venta *"
              value={formData.precioVenta || ''}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              error={errors.precioVenta}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 justify-between w-full">          
          {(
            <Input
              type="number"
              id="stock"
              name="stock"
              label="Stock Inicial *"
              value={formData.stock || ''}
              onChange={handleChange}
              min="0"
              step="1"
              error={errors.stock}
              required
              disabled={formData.hasUnlimitedStock}
            />
          )}
          <div className="flex md:items-center sm:pt-4">
              <Checkbox
                id="hasUnlimitedStock"
                name="hasUnlimitedStock"
                checked={formData.hasUnlimitedStock}
                onChange={handleChange}
                label="Stock Ilimitado (no se agota)"
                labelClassName="text-sm text-gray-700"
                containerClassName="flex items-center"
              />
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;

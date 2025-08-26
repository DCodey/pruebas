import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../../services/productService';
import Input from '../ui/Input';
import Checkbox from '../ui/Checkbox';

interface ProductFormProps {
  product: Omit<Product, 'id'> | Product | null;
  onSubmit: (formData: Omit<Product, 'id'>) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

interface FormData {
  name: string;
  description: string;
  price_cost: number;
  sale_price: number;
  stock: number | null;
  sku: string;
  has_un_limited_stock: 1 | 0;
  is_active: boolean;
}

interface FormErrors {
  name?: string;
  description?: string;
  price_cost?: string;
  sale_price?: string;
  stock?: string;
}

const MAX_DESCRIPTION_LENGTH = 500;

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onClose, isSubmitting = false }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price_cost: 0,
    sale_price: 0,
    stock: 0,
    sku: '',
    has_un_limited_stock: 0,
    is_active: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {      
      const hasUnlimitedStock = Number(product.has_un_limited_stock) === 1;
      setFormData(prev => ({
        ...prev,
        name: product.name,
        description: product.description,
        price_cost: product.price_cost,
        sale_price: product.sale_price,
        stock: hasUnlimitedStock ? null : product.stock,
        has_un_limited_stock: hasUnlimitedStock ? 1 : 0,
      }));
    }
  }, [product]);


  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    }

    if (Number(formData.price_cost) <= 0) {
      newErrors.price_cost = 'El precio de costo debe ser mayor a 0';
    }

    if (Number(formData.sale_price) <= 0) {
      newErrors.sale_price = 'El precio de venta debe ser mayor a 0';
    } else if (Number(formData.sale_price) < Number(formData.price_cost)) {
      console.log(formData.sale_price, formData.price_cost);
      newErrors.sale_price = 'El precio de venta no puede ser menor al costo';
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
      onSubmit(formData as unknown as Omit<Product, 'id'>);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'has_un_limited_stock') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        has_un_limited_stock: isChecked ? 1 : 0,
        stock: isChecked ? null : (prev.stock || 0),
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: name.includes('precio')
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
            id="name"
            name="name"
            label="Nombre del Producto *"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Ramo de Rosas Rojas"
            error={errors.name}
            required
          />
        </div>

        {/* Description */}
        <div>
          <Input
            as="textarea"
            id="description"
            name="description"
            label="Descripción"
            placeholder="Describe el producto en detalle..."
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
          {errors.description && (
            <p className="mt-2 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <Input
              type="number"
              id="price_cost"
              name="price_cost"
              label="Precio de Costo *"
              value={formData.price_cost || 0}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              error={errors.price_cost}
              required
            />
          </div>
          <div>
            <Input
              type="number"
              id="sale_price"
              name="sale_price"
              label="Precio de Venta *"
              value={formData.sale_price || 0}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              error={errors.sale_price}
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
              label="Stock Inicial"
              value={formData.stock || 0}
              onChange={handleChange}
              min="0"
              step="1"
              error={errors.stock}
              required
              disabled={formData.has_un_limited_stock === 1}
            />
          )}
          <div className="flex md:items-center sm:pt-4">
            <Checkbox
              id="has_un_limited_stock"
              name="has_un_limited_stock"
              checked={formData.has_un_limited_stock === 1}
              onChange={handleChange}
              label="Stock ilimitado (no se agota)"
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

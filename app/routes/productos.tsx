import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import PageLayout from '../../src/components/layout/PageLayout';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getProducts, addProduct, updateProduct, deleteProduct, type Product } from '../../src/services/productService';
import Modal from '../../src/components/ui/Modal';
import ProductForm from '../../src/components/productos/ProductForm';
import { Table, TableContainer } from '../../src/components/ui/Table';
import { useAlert } from '../../src/contexts/AlertContext';
import Loader from '../../src/components/ui/Loader';

function ProductosContent() {
  const { showError } = useAlert();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error: any) {
        console.error("Error al cargar productos: ", error);
        const errorMessage = error.response?.data?.message || 'Error al cargar los productos';
        const errors = error.response?.data?.errors;
        showError(errorMessage, 10000, errors);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleOpenModal = (product: Product | null = null) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleSubmit = async (productData: Omit<Product, 'id'>) => {
    setIsLoading(true);
    try {
      if (currentProduct) {
        await updateProduct(currentProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      const productsData = await getProducts();
      setProducts(productsData);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error al guardar el producto:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar el producto';
      const errors = error.response?.data?.errors;
      showError(errorMessage, 10000, errors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      setIsLoading(true);
      try {
        await deleteProduct(id);
        setProducts(products.filter(product => product.id !== id));
      } catch (error: any) {
        console.error('Error al eliminar el producto:', error);
        const errorMessage = error.response?.data?.message || 'Error al eliminar el producto';
        const errors = error.response?.data?.errors;
        showError(errorMessage, 10000, errors);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const modalFooter = (
    <div className="flex justify-end gap-x-3">
      <button
        type="button"
        onClick={handleCloseModal}
        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        disabled={isLoading}
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="product-form"
        className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 flex items-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader />
        ) : (
          currentProduct ? (
            'Actualizar Producto'
          ) : (
            'Guardar Producto'
          )
        )}
      </button>
    </div>
  );

  return (
    <PageLayout 
      title="Productos" 
      description="Administra los productos de tu inventario"
      headerAction={
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Nuevo Producto
        </button>
      }
    >
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
            <Loader />
          </div>
        )}
        <TableContainer>
          <Table
            columns={[
              {
                key: 'name',
                header: 'Nombre',
                className: 'font-medium text-gray-900'
              },
              {
                key: 'description',
                header: 'Descripción',
                className: 'text-gray-500 max-w-[200px] overflow-hidden text-ellipsis'
              },
              {
                key: 'price_cost',
                header: 'Precio Costo',
                className: 'text-gray-500',
                render: (product) => `${product.price_cost || '0.00'}`
              },
              {
                key: 'sale_price',
                header: 'Precio Venta',
                className: 'text-gray-500',
                render: (product) => `${product.sale_price || '0.00'}`
              },
              {
                key: 'stock',
                header: 'Stock',
                className: 'text-gray-500',
                render: (product) => (
                  <span className={`px-2 py-1 text-xs rounded-full ${product.stock !== null && product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock !== null ? product.stock + ' unidades' : 'Ilimitado'}
                  </span>
                )
              },
              {
                key: 'actions',
                header: 'Acciones',
                className: 'text-right',
                render: (product) => (
                  <div className="space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(product);
                      }} 
                      className="text-primary-600 hover:text-primary-900"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5"/>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }} 
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-5 w-5"/>
                    </button>
                  </div>
                )
              }
            ]}
            data={products}
            keyExtractor={(product) => product.id}
            onRowClick={handleOpenModal}
            emptyMessage="No hay productos registrados"
            rowClassName="hover:bg-gray-50 cursor-pointer"
          />
        </TableContainer>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={currentProduct ? 'Editar Producto' : 'Nuevo Producto'}
        footer={modalFooter}
      >
        <ProductForm 
          product={currentProduct} 
          onSubmit={handleSubmit} 
          onClose={handleCloseModal}
          isSubmitting={isLoading}
        />
      </Modal>
    </PageLayout>
  );
}

export default function Productos() {
  return (
    <DashboardLayout>
      <ProductosContent />
    </DashboardLayout>
  );
}

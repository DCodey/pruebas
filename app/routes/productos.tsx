import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import PageLayout from '../../src/components/layout/PageLayout';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getProducts, addProduct, updateProduct, deleteProduct, type Product } from '../../src/services/productService';
import Loader from '../../src/components/ui/Loader';
import Modal from '../../src/components/ui/Modal';
import ProductForm from '../../src/components/productos/ProductForm';

function ProductosContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error al cargar productos: ", error);
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

  const handleSaveProduct = async (formData: Omit<Product, 'id'>) => {
    setIsLoading(true);
    try {
      if (currentProduct) {
        await updateProduct(currentProduct.id, formData);
        setProducts(products.map(p => p.id === currentProduct.id ? { ...p, ...formData } : p));
      } else {
        const newId = await addProduct(formData);
        setProducts([...products, { id: newId, ...formData }]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar el producto: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      setIsLoading(true);
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error al eliminar el producto: ", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <PageLayout
        title="Productos"
        description="Una lista de todos los productos y su información relevante."
        headerAction={(
          <button
            type="button"
            onClick={() => handleOpenModal(null)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Registrar Producto
          </button>
        )}
      >
        {isLoading && <Loader />}
        <div className="flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Costo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.nombre}</td>
                        <td className="px-6 py-4 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-500">
                          {product.descripcion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.precioCosto.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.precioVenta.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button onClick={() => handleOpenModal(product)} className="text-primary-600 hover:text-primary-900"><PencilIcon className="h-5 w-5"/></button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentProduct ? 'Editar Producto' : 'Registrar Producto'}>
        <ProductForm 
          product={currentProduct}
          onSubmit={handleSaveProduct}
          onClose={handleCloseModal}
        />
      </Modal>
    </>
  );
}

export default function Productos() {
  return (
    <DashboardLayout>
      <ProductosContent />
    </DashboardLayout>
  );
}

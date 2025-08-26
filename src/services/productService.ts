import api from './axiosConfig';

export interface Product {
    id: number;
    name: string;
    description: string;
    price_cost: number;
    sale_price: number;
    stock: number;
    sku: string;
    has_un_limited_stock: boolean;
    is_active: boolean;
}

// ✅ Obtener todos los productos
export const getProducts = async (): Promise<Product[]> => {
    const response = await api.get<{ success: boolean; data: Product[] }>('/products');
    return response.data.data;
};

// ✅ Añadir un nuevo producto
export const addProduct = async (productData: Omit<Product, 'id'>): Promise<number> => {
    const response = await api.post<{ success: boolean; data: Product }>('/products', {
        name: productData.name,
        description: productData.description,
        price_cost: productData.price_cost,
        sale_price: productData.sale_price,
        stock: productData.stock,
        sku: productData.sku,
        has_un_limited_stock: productData.has_un_limited_stock,
        is_active: productData.is_active
    });

    return response.data.data.id;
};

// ✅ Actualizar un producto existente
export const updateProduct = async (
    id: number,
    productData: Partial<Omit<Product, 'id'>>
): Promise<void> => {
    const updateData: Partial<Product> = {};
    if (productData.name !== undefined) updateData.name = productData.name;
    if (productData.description !== undefined) updateData.description = productData.description;
    if (productData.price_cost !== undefined) updateData.price_cost = productData.price_cost;
    if (productData.sale_price !== undefined) updateData.sale_price = productData.sale_price;
    if (productData.stock !== undefined) updateData.stock = productData.stock;
    if (productData.sku !== undefined) updateData.sku = productData.sku;
    if (productData.has_un_limited_stock !== undefined) updateData.has_un_limited_stock = productData.has_un_limited_stock;
    if (productData.is_active !== undefined) updateData.is_active = productData.is_active;

    await api.put(`/products/${id}`, updateData);
};

// ✅ Eliminar un producto
export const deleteProduct = async (id: number): Promise<{ message?: string }> => {
    const response = await api.delete(`/products/${id}`);
    return { message: response.data?.message };
};
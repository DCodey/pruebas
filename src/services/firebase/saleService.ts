import { db } from '../../firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  runTransaction,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';

// Interfaz para cada item dentro de una venta
export interface SaleItem {
  productId: string | null; // null para productos personalizados
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

// Interfaz para el objeto Venta
export interface Sale {
  id: string;
  clienteId: string | null; // null para clientes anónimos
  nombreCliente: string;
  items: SaleItem[];
  total: number;
  fechaDeVenta: Timestamp;
  paymentMethod: PaymentMethod;
}

// Datos necesarios para crear una nueva venta
export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Yape' | 'Lemon';

export interface NewSaleData {
  clienteId: string | null;
  nombreCliente: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  fechaDeVenta: Date;
}

// Mapeo de un documento de Firestore a un objeto Sale
const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Sale => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    clienteId: data.clienteId,
    nombreCliente: data.nombreCliente,
    items: data.items,
    total: data.total,
    fechaDeVenta: data.fechaDeVenta,
    paymentMethod: data.paymentMethod || 'Efectivo', // Default to 'efectivo' for backward compatibility
  };
};

const salesCollection = collection(db, 'sales');

// Obtener todas las ventas
export const getSales = async (): Promise<Sale[]> => {
  const q = query(salesCollection, orderBy('fechaDeVenta', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(fromFirestore);
};

// Obtener ventas por rango de fechas
export const getSalesByDateRange = async (startDate: Date, endDate: Date): Promise<Sale[]> => {
  const q = query(
    salesCollection,
    where('fechaDeVenta', '>=', startDate),
    where('fechaDeVenta', '<=', endDate),
    orderBy('fechaDeVenta', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(fromFirestore);
};

// Añadir una nueva venta y actualizar el stock de productos en una transacción
export const addSale = async (saleData: NewSaleData): Promise<string> => {
  try {
    const newSaleId = await runTransaction(db, async (transaction) => {
      const productRefsAndData = saleData.items
        .filter(item => item.productId) // Filtrar solo los productos con ID
        .map(item => ({
          ref: doc(db, 'products', item.productId!),
          item: item,
        }));

      // 1. LEER todos los productos primero
      const productDocs = await Promise.all(
        productRefsAndData.map(p => transaction.get(p.ref))
      );

      // 2. VALIDAR el stock y preparar las actualizaciones
      const updates: { ref: any, newStock: number | null }[] = [];
      for (let i = 0; i < productDocs.length; i++) {
        const productDoc = productDocs[i];
        const item = saleData.items[i];

        if (!productDoc.exists()) {
          throw new Error(`Producto con ID ${item.productId} no encontrado.`);
        }

        const productData = productDoc.data();
        const currentStock = productData.stock;
        
        // Si el stock es null, es un producto con stock ilimitado
        if (currentStock === null) {
          // No se actualiza el stock para productos con stock ilimitado
          continue;
        }
        
        // Para productos con stock limitado, validar y actualizar
        const newStock = currentStock - item.cantidad;

        if (newStock < 0) {
          throw new Error(`Stock insuficiente para el producto ${item.nombre}.`);
        }
        updates.push({ ref: productRefsAndData[i].ref, newStock });
      }

      // 3. ESCRIBIR todos los datos
      // Crear la nueva venta
      const saleRef = doc(collection(db, 'sales'));
      transaction.set(saleRef, { ...saleData});

      // Actualizar el stock de cada producto
      updates.forEach(update => {
        transaction.update(update.ref, { stock: update.newStock });
      });

      return saleRef.id;
    });
    return newSaleId;
  } catch (error) {
    console.error("Error en la transacción de la venta: ", error);
    throw error; // Re-lanzar el error para manejarlo en la UI
  }
};

// Eliminar una venta (potencialmente para anularla y restaurar stock)
export const deleteSale = async (id: string): Promise<void> => {
  // Nota: Para una anulación real, se debería implementar una lógica transaccional
  // que devuelva el stock a los productos correspondientes.
  const saleDoc = doc(db, 'sales', id);
  await deleteDoc(saleDoc);
};

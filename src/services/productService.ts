import { db } from '../firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

// Definición de la interfaz para un Producto
export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precioCosto: number;
  precioVenta: number;
  stock: number;
}

// Mapeo de un documento de Firestore a un objeto Product
const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Product => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    precioCosto: data.precioCosto,
    precioVenta: data.precioVenta,
    stock: data.stock,
  };
};

const productsCollection = collection(db, 'products');

// Obtener todos los productos
export const getProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map(fromFirestore);
};

// Añadir un nuevo producto
export const addProduct = async (productData: Omit<Product, 'id'>): Promise<string> => {
  const docRef = await addDoc(productsCollection, productData);
  return docRef.id;
};

// Actualizar un producto existente
export const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id'>>): Promise<void> => {
  const productDoc = doc(db, 'products', id);
  await updateDoc(productDoc, productData);
};

// Eliminar un producto
export const deleteProduct = async (id: string): Promise<void> => {
  const productDoc = doc(db, 'products', id);
  await deleteDoc(productDoc);
};

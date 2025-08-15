import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore';

// Definimos la interfaz del Cliente para tipado estricto
export interface Client {
  id: string;
  nombre: string;
  descripcion: string;
  celular: number;
  numeroDocumento?: string;
}

// Referencia a la colección 'clientes' en Firestore
const clientesCollection = collection(db, 'clientes');

// Helper para convertir un snapshot de documento a nuestro tipo Client
const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Client => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    celular: data.celular,
    numeroDocumento: data.numeroDocumento || '',
  };
};

// OBTENER todos los clientes
export const getClients = async (): Promise<Client[]> => {
  const querySnapshot = await getDocs(clientesCollection);
  return querySnapshot.docs.map(fromFirestore);
};

// AÑADIR un nuevo cliente
export const addClient = async (clientData: Omit<Client, 'id'>): Promise<string> => {
  const docRef = await addDoc(clientesCollection, clientData);
  return docRef.id;
};

// ACTUALIZAR un cliente existente
export const updateClient = async (id: string, clientData: Partial<Omit<Client, 'id'>>): Promise<void> => {
  const clientDoc = doc(db, 'clientes', id);
  await updateDoc(clientDoc, clientData);
};

// ELIMINAR un cliente
export const deleteClient = async (id: string): Promise<void> => {
  const clientDoc = doc(db, 'clientes', id);
  await deleteDoc(clientDoc);
};

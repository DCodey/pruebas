import { db } from '../firebase/config';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  type DocumentData,
  type QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';

export interface SpecialService {
  id: string;
  clientId: string; // ID del cliente asociado
  clientName: string; // Nombre del cliente (para mostrar sin necesidad de join)
  startDate: Date; // Fecha de inicio del servicio
  deceasedName: string; // Nombre del difunto
  sector: string; // Sector del cementerio
  description: string; // Descripción adicional
  price: number; // Precio del servicio
  isActive: boolean;
  validUntil?: Date; // Fecha hasta cuando es válido el pago
  isPaid: boolean; // Si el pago está marcado como realizado
  paymentDate?: Date; // Fecha en que se realizó el pago
  paymentFrequency?: 'weekly' | 'monthly' | 'yearly'; // Frecuencia de pago
  createdAt: Date;
  updatedAt: Date;
}

// Mapeo de un documento de Firestore a un objeto SpecialService
const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): SpecialService => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    clientId: data.clientId || '',
    clientName: data.clientName || 'Cliente no especificado',
    startDate: data.startDate?.toDate(),
    deceasedName: data.deceasedName,
    sector: data.sector,
    description: data.description || '',
    price: Number(data.price) || 0, // Default to 0 if not provided
    isActive: data.isActive !== false, // Por defecto true
    isPaid: data.isPaid !== false, // Por defecto false
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

const specialServicesCollection = collection(db, 'specialServices');

// Obtener todos los servicios especiales
// Si includeInactive es true, incluye servicios inactivos
export const getSpecialServices = async (includeInactive = false): Promise<SpecialService[]> => {
  let q = query(specialServicesCollection, orderBy('startDate', 'desc'));
  
  if (!includeInactive) {
    q = query(q, where('isActive', '==', true));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(fromFirestore);
};

// Obtener un servicio por ID
export const getSpecialService = async (id: string): Promise<SpecialService | null> => {
  const docRef = doc(db, 'specialServices', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? fromFirestore(docSnap as QueryDocumentSnapshot<DocumentData>) : null;
};

// Crear un nuevo servicio especial
export const createSpecialService = async (serviceData: Omit<SpecialService, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(specialServicesCollection, {
    ...serviceData,
    startDate: Timestamp.fromDate(new Date(serviceData.startDate)),
    isActive: serviceData.isActive !== false,
    isPaid: serviceData.isPaid !== false,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

// Actualizar un servicio existente
export const updateSpecialService = async (id: string, serviceData: Partial<Omit<SpecialService, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const serviceRef = doc(db, 'specialServices', id);
  await updateDoc(serviceRef, {
    ...serviceData,
    startDate: serviceData.startDate ? Timestamp.fromDate(new Date(serviceData.startDate)) : undefined,
    updatedAt: Timestamp.now(),
  });
};

// Eliminar definitivamente un servicio
export const deleteDefinitiveSpecialService = async (id: string): Promise<void> => {
  const serviceRef = doc(db, 'specialServices', id);
  await deleteDoc(serviceRef);
};


// Eliminar un servicio (marcar como inactivo)
export const deleteSpecialService = async (id: string): Promise<void> => {
  await updateSpecialService(id, { isActive: false });
};

// Reactivar un servicio
export const activateSpecialService = async (id: string): Promise<void> => {
  await updateSpecialService(id, { isActive: true });
};

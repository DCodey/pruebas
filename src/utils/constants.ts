export const PAYMENT_METHODS = [
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Tarjeta', label: 'Tarjeta' },
  { value: 'Yape', label: 'Yape' },
  { value: 'Plin', label: 'Plin' },
  { value: 'Lemon', label: 'Lemon' },
];
export const COMPANY = {
    name: 'Florería la fontana',
    description: 'Arreglos, ramos y plantas',
    address: 'Av. Flora Tristan 1335, La Molina 15024',
    phone: '975 300 895',
    email: 'info@floreriafontana.com',
    website: 'https://floreriafontana.com',
    logo: 'https://floreriafontana.com/logo.png',
    footer: 'Florería la fontana. Todos los derechos reservados.',
};

// Los permisos han sido movidos a src/utils/permissions.ts

const recurrenceLabelMap: Record<string, string> = {
  weekly: 'semanal',
  monthly: 'mensual',
};

export const getRecurrenceLabel = (key: string): string =>
  recurrenceLabelMap[key] || key;
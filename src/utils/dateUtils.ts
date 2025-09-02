/**
 * Si la fecha cambia, actualiza la hora a la hora actual del sistema, si no, mantiene la hora original.
 * @param {Date} originalDate - Fecha original (con hora original)
 * @param {string} newDateString - Nueva fecha en formato YYYY-MM-DD
 * @returns {Date} Nueva fecha con la hora correspondiente
 */
export function setDateWithCurrentTimeIfChanged(originalDate: Date, newDateString: string): Date {
  const updatedDate = updateDateKeepingTime(originalDate, newDateString);
  const originalYMD = originalDate.toISOString().slice(0, 10);
  if (newDateString !== originalYMD) {
    const now = new Date();
    updatedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  }
  return updatedDate;
}
/**
 * Utilidades para el manejo de fechas en UTC y conversión a UTC-5 (hora de Perú)
 */

/**
 * Obtiene la fecha actual en UTC
 * @returns {Date} Fecha actual en UTC
 */
export const getCurrentDateUTC = (): Date => {
  return new Date();
};

/**
 * Convierte una fecha UTC a UTC-5 (hora de Perú)
 * @param {Date} date - Fecha en UTC a convertir
 * @returns {Date} Fecha en UTC-5
 */
export const toUTC5 = (date: Date): Date => {
  const utc5Date = new Date(date);
  // Ajustar a UTC-5 (5 horas menos que UTC)
  utc5Date.setHours(utc5Date.getHours() - 5);
  return utc5Date;
};

/**
 * Convierte una fecha UTC-5 a UTC
 * @param {Date} date - Fecha en UTC-5 a convertir
 * @returns {Date} Fecha en UTC
 */
export const toUTC = (date: Date): Date => {
  const utcDate = new Date(date);
  // Ajustar a UTC (5 horas más que UTC-5)
  utcDate.setHours(utcDate.getHours() + 5);
  return utcDate;
};

/**
 * Formatea una fecha UTC a string en formato local de Perú (es-PE) UTC-5
 * @param {Date} date - Fecha en UTC a formatear
 * @returns {string} Fecha formateada en UTC-5
 */
export const formatToLocalString = (date: Date): string => {
  // Convertir a UTC-5 para mostrar
  const localDate = toUTC5(date);
  return localDate.toLocaleString('es-PE', {
    timeZone: 'UTC', // Usamos UTC ya que ya convertimos manualmente
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Formatea una fecha para input date (solo la parte de fecha)
 * @param {Date} date - Fecha en UTC
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatForDateInput = (date: Date): string => {
  const localDate = toUTC5(date);
  return localDate.toISOString().split('T')[0];
};

/**
 * Actualiza solo la parte de la fecha (día, mes, año) manteniendo la hora actual
 * @param {Date} currentDate - Fecha actual con la hora que queremos mantener
 * @param {string} dateString - Nueva fecha en formato YYYY-MM-DD
 * @returns {Date} Nueva fecha con la misma hora pero con la fecha actualizada
 */
export const updateDateKeepingTime = (currentDate: Date, dateString: string): Date => {
  // Crear una nueva fecha con la fecha seleccionada y la hora actual
  const [year, month, day] = dateString.split('-').map(Number);
  const newDate = new Date(currentDate);
  
  // Establecer la nueva fecha manteniendo la hora local
  newDate.setFullYear(year, month - 1, day);
  
  // Asegurarse de que la hora no cambie
  newDate.setHours(
    currentDate.getHours(),
    currentDate.getMinutes(),
    currentDate.getSeconds(),
    currentDate.getMilliseconds()
  );
  
  return newDate;
};

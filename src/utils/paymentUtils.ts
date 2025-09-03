// Calcula la cantidad de periodos y el monto total a pagar para servicios recurrentes
// recurrenceInterval: 'weekly' | 'monthly'
// Retorna: { periods: number, amount: number }
export function calculatePaymentPeriodsAndAmount({
  startDate,
  endDate,
  recurrenceInterval,
  price
}: {
  startDate: string;
  endDate: string;
  recurrenceInterval: 'weekly' | 'monthly';
  price: number;
}) {
  if (!startDate || !endDate) {
    return { periods: 0, amount: 0 };
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  let periods = 0;
  if (recurrenceInterval === 'weekly') {
    // Calcular semanas completas entre las fechas (incluyendo la semana inicial)
    const msInWeek = 7 * 24 * 60 * 60 * 1000;
    periods = Math.floor((end.getTime() - start.getTime()) / msInWeek) + 1;
    if (periods < 1) periods = 1;
  } else if (recurrenceInterval === 'monthly') {
    // Calcular meses completos entre las fechas (incluyendo el mes inicial)
    periods = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    if (periods < 1) periods = 1;
  }
  return { periods, amount: periods * price };
}

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Sale } from '../../services/saleService';
import { autoTable } from 'jspdf-autotable';

interface SalesReportPdfProps {
  sales: Sale[];
  startDate: Date;
  endDate: Date;
  totalSales: number;
  totalAmount: number;
  paymentMethod?: string;
}

export const generateSalesReportPdf = ({
  sales,
  startDate,
  endDate,
  totalSales,
  totalAmount,
  paymentMethod
}: SalesReportPdfProps) => {
  // Crear un nuevo documento PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado con color corporativo
  doc.setFillColor(16, 185, 129); // primary-500
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setFontSize(20);
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Ventas', pageWidth / 2, 20, { align: 'center' });

  // Información del rango de fechas
  doc.setFontSize(12);
  doc.setTextColor(255);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}`,
    pageWidth / 2,
    28,
    { align: 'center' }
  );

  // Resumen destacado
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // primary-500
  doc.setFont('helvetica', 'bold');
  doc.roundedRect(12, 38, pageWidth - 24, 18, 4, 4);
  doc.text(`Total de ventas: ${totalSales}   |   Monto total: S/ ${Number(totalAmount).toFixed(2)}`, pageWidth / 2, 50, { align: 'center' });

  // Configuración de la tabla
  const tableColumn = ["Fecha", "Cliente", "Productos", "Método de Pago", "Total"];
  const tableRows: any[] = [];

  // Filtrar ventas por método de pago si se especifica
  const filteredSales = paymentMethod
    ? sales.filter(sale => sale?.payment_method?.name === paymentMethod)
    : sales;

  // Procesar datos para la tabla
  filteredSales.forEach(sale => {
    const saleData = [
      sale.sale_date,
      sale.client_name || 'Cliente no registrado',
      sale.items.map(item => `${item.quantity}x ${item.product_name}`).join(', '),
      sale?.payment_method?.name || '-',
      `S/ ${Number(sale.total).toFixed(2)}`,
    ];
    tableRows.push(saleData);
  });
  
  // Generar la tabla
  autoTable(doc,{
    head: [tableColumn],
    body: tableRows,
    startY: 60,
    styles: {
      fontSize: 10,
      cellPadding: 2.5,
      valign: 'middle',
      overflow: 'linebreak',
      lineWidth: 0.2,
      font: 'helvetica',
      textColor: [55, 65, 81], // neutral-700
    },
    headStyles: {
      fillColor: [16, 185, 129], // primary-500
      textColor: 255,
      fontStyle: 'bold',
      lineWidth: 0.2,
      fontSize: 11,
    },
    alternateRowStyles: {
      fillColor: [236, 254, 245], // primary-50
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 40 },
      2: { cellWidth: 70 },
      3: { cellWidth: 32 },
      4: { cellWidth: 25, halign: 'right' },
    },
  margin: { top: 60, left: (pageWidth - 195) / 2, right: (pageWidth - 195) / 2 }
  });
  
  // Pie de página
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129); // primary-500
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - 28,
      doc.internal.pageSize.getHeight() - 10
    );
    // Información de empresa y fecha
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81); // neutral-700    
    doc.text('Reporte generado el: ' + new Date().toLocaleDateString(), 14, doc.internal.pageSize.getHeight() - 5);
  }
  
  // Guardar el PDF
  doc.save(`reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`);
};

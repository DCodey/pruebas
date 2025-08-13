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
}

export const generateSalesReportPdf = ({
  sales,
  startDate,
  endDate,
  totalSales,
  totalAmount
}: SalesReportPdfProps) => {
  // Crear un nuevo documento PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Configuración del encabezado
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Ventas', pageWidth / 2, 20, { align: 'center' });
  
  // Información del rango de fechas
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}`,
    pageWidth / 2,
    30,
    { align: 'center' }
  );
  
  // Resumen de ventas
  doc.setFontSize(11);
  doc.text(`Total de ventas: ${totalSales}`, 14, 45);
  doc.text(`Monto total: S/ ${totalAmount.toFixed(2)}`, 14, 55);
  
  // Configuración de la tabla
  const tableColumn = ["Fecha", "Cliente", "Productos", "Total"];
  const tableRows: any[] = [];
  
  // Procesar datos para la tabla
  sales.forEach(sale => {
    const saleData = [
      sale.fecha.toDate().toLocaleDateString(),
      sale.nombreCliente || 'Cliente no registrado',
      sale.items.map(item => `${item.cantidad}x ${item.nombre}`).join(', '),
      `S/ ${sale.total.toFixed(2)}`
    ];
    tableRows.push(saleData);
  });
  
  // Generar la tabla
  autoTable(doc,{
    head: [tableColumn],
    body: tableRows,
    startY: 65,
    styles: { 
      fontSize: 9,
      cellPadding: 2,
      valign: 'middle',
      overflow: 'linebreak',
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 25, cellPadding: 1 },
      1: { cellWidth: 40 },
      2: { cellWidth: 80 },
      3: { cellWidth: 25, halign: 'right' }
    },
    margin: { top: 65 }
  });
  
  // Pie de página
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - 20,
      doc.internal.pageSize.getHeight() - 10
    );
    
    // Logo o información de la empresa
    doc.setFontSize(8);
    doc.text('Florería La Fontana', 14, doc.internal.pageSize.getHeight() - 10);
    doc.text('Reporte generado el: ' + new Date().toLocaleDateString(), 14, doc.internal.pageSize.getHeight() - 5);
  }
  
  // Guardar el PDF
  doc.save(`reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`);
};

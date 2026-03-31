import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Repair, Customer } from '../types';

export const PDFService = {
  generateRepairOS: (repair: Repair, customer: Customer) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue 600
    doc.text('FixMaster Pro', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text('Sua Assistência Técnica de Confiança', 20, 26);
    
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(`ORDEM DE SERVIÇO #${repair.id.slice(-5)}`, pageWidth - 20, 20, { align: 'right' });
    
    doc.setFontSize(10);
    doc.text(`Data: ${new Date(repair.entryDate).toLocaleDateString()}`, pageWidth - 20, 26, { align: 'right' });

    // Customer Info Section
    doc.setDrawColor(241, 245, 249); // Slate 100
    doc.line(20, 35, pageWidth - 20, 35);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE', 20, 45);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nome: ${customer.name}`, 20, 52);
    doc.text(`Telefone: ${customer.phone}`, 20, 58);
    if (customer.email) doc.text(`E-mail: ${customer.email}`, 20, 64);

    // Device Info Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO APARELHO', 20, 75);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Modelo: ${repair.deviceModel}`, 20, 82);
    doc.text(`Defeito Relatado: ${repair.reportedDefect}`, 20, 88);
    doc.text(`Status Atual: ${repair.status.toUpperCase()}`, 20, 94);

    // Diagnosis Section
    if (repair.diagnosis) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DIAGNÓSTICO TÉCNICO', 20, 105);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const splitDiagnosis = doc.splitTextToSize(repair.diagnosis, pageWidth - 40);
      doc.text(splitDiagnosis, 20, 112);
    }

    // Budget Table
    const startY = repair.diagnosis ? 135 : 105;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ORÇAMENTO', 20, startY);

    autoTable(doc, {
      startY: startY + 5,
      head: [['Descrição', 'Valor']],
      body: [
        ['Mão de Obra', `R$ ${repair.budget.laborCost.toFixed(2)}`],
        ['Peças e Componentes', `R$ ${repair.budget.partsCost.toFixed(2)}`],
        [{ content: 'TOTAL', styles: { fontStyle: 'bold' } }, { content: `R$ ${repair.budget.total.toFixed(2)}`, styles: { fontStyle: 'bold' } }],
      ],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 20, right: 20 },
    });

    // Checklist Section
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CHECKLIST DE ENTRADA', 20, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let checkX = 20;
    let checkY = finalY + 8;
    
    const checklistItems = [
      { label: 'Liga', value: repair.checklist.powersOn },
      { label: 'Carrega', value: repair.checklist.charges },
      { label: 'Chip', value: repair.checklist.simRecognized },
      { label: 'Tela', value: repair.checklist.screenIntact },
      { label: 'Touch', value: repair.checklist.touchWorks },
    ];

    checklistItems.forEach((item, index) => {
      const status = item.value ? '[X] OK' : '[ ] Falha';
      doc.text(`${item.label}: ${status}`, checkX, checkY);
      checkX += 35;
      if (index === 2) {
        checkX = 20;
        checkY += 6;
      }
    });

    // Footer / Signature
    const footerY = doc.internal.pageSize.getHeight() - 40;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY, 90, footerY);
    doc.line(pageWidth - 90, footerY, pageWidth - 20, footerY);
    
    doc.setFontSize(8);
    doc.text('Assinatura do Técnico', 55, footerY + 5, { align: 'center' });
    doc.text('Assinatura do Cliente', pageWidth - 55, footerY + 5, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const disclaimer = 'Ao assinar, o cliente concorda com os termos de serviço e o orçamento acima descrito. A garantia é de 90 dias para as peças substituídas.';
    doc.text(disclaimer, pageWidth / 2, footerY + 20, { align: 'center' });

    // Save PDF
    doc.save(`OS_${repair.id.slice(-5)}_${customer.name.replace(/\s+/g, '_')}.pdf`);
  }
};

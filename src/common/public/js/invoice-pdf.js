import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

window.html2canvas = html2canvas;
window.jsPDF = jsPDF;

window.downloadInvoicePdf = async function (elementId, invoiceNo) {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Invoice element not found: ${elementId}`);
  }

  try {
    // 1. Pastikan semua font telah dimuat
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading warning:', e);
      }
    }

    // 2. Render elemen menggunakan html2canvas-pro (Mendukung OKLCH & warna modern)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      onclone: (clonedDocument) => {
        const clonedElement = clonedDocument.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.margin = '0';
          clonedElement.style.maxWidth = 'none';
          clonedElement.style.backgroundColor = '#ffffff';
        }
      },
    });

    // 3. Konversi Canvas ke Data URL Image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // 4. Buat dokumen PDF format A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;

    let imgWidth = maxWidth;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      imgWidth = (canvas.width * imgHeight) / canvas.height;
    }

    const posX = (pageWidth - imgWidth) / 2;
    const posY = margin;

    pdf.addImage(
      imgData,
      'JPEG',
      posX,
      posY,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );

    // 5. Simpan file PDF sesuai nama/nomor invoice
    const safeNo = String(invoiceNo || '')
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    const fileName = safeNo ? `${safeNo}.pdf` : 'Invoice.pdf';
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error('Download invoice PDF error:', error);
    throw error;
  }
};
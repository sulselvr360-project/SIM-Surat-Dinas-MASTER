import html2pdf from 'html2pdf.js';

/**
 * Triggers native browser print with fallback iframe focus
 */
export const printElement = (elementId?: string) => {
  window.focus();
  
  // If elementId provided, ensure it's in view
  if (elementId) {
    const el = document.getElementById(elementId) || document.querySelector('.printable-area');
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }

  setTimeout(() => {
    try {
      window.print();
    } catch (e) {
      console.error('Print trigger failed:', e);
      alert('Gagal membuka dialog cetak. Silakan gunakan tombol Export PDF.');
    }
  }, 150);
};

/**
 * Exports a DOM element directly to a downloadable PDF file using html2pdf.js
 */
export const exportToPdf = async (elementOrId: HTMLElement | string, filename: string) => {
  let element: HTMLElement | null = null;

  if (typeof elementOrId === 'string') {
    element = document.getElementById(elementOrId) || document.querySelector(`.${elementOrId}`);
  } else {
    element = elementOrId;
  }

  if (!element) {
    element = document.querySelector('.printable-area');
  }

  if (!element) {
    alert('Area dokumen tidak ditemukan untuk dicetak ke PDF.');
    return;
  }

  // Temporarily adjust padding for PDF export to prevent margin overflow onto page 2
  const originalPadding = element.style.padding;
  element.style.padding = '16px';

  const opt = {
    margin: [6, 8, 6, 8], // top, left, bottom, right in mm
    filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      windowWidth: 800,
      scrollY: 0,
      scrollX: 0,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
    },
    pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', 'img', 'table', '.no-break'] },
  };

  try {
    // @ts-ignore
    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error('PDF export error:', err);
    // Fallback to window.print if pdf generation fails
    printElement();
  } finally {
    element.style.padding = originalPadding;
  }
};

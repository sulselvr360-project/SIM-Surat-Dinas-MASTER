/**
 * Utility functions for date formatting in dd/mm/yyyy format
 */

export function formatDateDDMMYYYY(dateString?: string | null): string {
  if (!dateString) return '-';

  const trimmed = dateString.trim();

  // If already dd/mm/yyyy or dd-mm-yyyy format
  if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(trimmed)) {
    return trimmed.replace(/-/g, '/');
  }

  // Handle YYYY-MM-DD
  const parts = trimmed.split('T')[0].split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  // Fallback JavaScript Date parsing
  const dateObj = new Date(trimmed);
  if (!isNaN(dateObj.getTime())) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return dateString;
}

export function getTodayYYYYMMDD(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDDMMYYYY(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

const NAMA_BULAN_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatDateDDMMMMYYYY(dateString?: string | null): string {
  if (!dateString) return '-';
  const trimmed = dateString.trim();

  let d = '';
  let m = '';
  let y = '';

  const parts = trimmed.split('T')[0].split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    [y, m, d] = parts;
  } else if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(trimmed)) {
    const parts2 = trimmed.split(/[\/\-]/);
    [d, m, y] = parts2;
  } else {
    const dateObj = new Date(trimmed);
    if (!isNaN(dateObj.getTime())) {
      d = String(dateObj.getDate()).padStart(2, '0');
      m = String(dateObj.getMonth() + 1).padStart(2, '0');
      y = String(dateObj.getFullYear());
    }
  }

  if (d && m && y) {
    const mInt = parseInt(m, 10);
    const monthName = NAMA_BULAN_INDONESIA[mInt - 1] || m;
    return `${d.padStart(2, '0')} ${monthName} ${y}`;
  }

  return formatDateDDMMYYYY(dateString);
}

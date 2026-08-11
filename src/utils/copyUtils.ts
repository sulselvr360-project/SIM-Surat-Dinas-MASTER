import { SuratMasuk } from '../types';
import { formatDateDDMMMMYYYY } from './dateUtils';

/**
 * Formats a SuratMasuk object into standard text layout for easy sharing / copying.
 * 
 * Format:
 * *SURAT MASUK*
 * 
 * *_Asal Surat_* : _..._
 * *_Tanggal surat_* : _dd mmmm yyyy_
 * -------------------
 * *_Tanggal terima surat_* : _dd mmmm yyyy_
 * *_Perihal_* : _..._
 * ============
 * *_Uraian singkat_* : 
 * _..._
 * ============
 * *_Disposisi Kepada_* : _..._
 * =============
 * *_Petunjuk/Arahan_* : _..._
 * 
 * *_Catatan / Petunjuk Khusus Pimpinan_* : _..._
 * =============
 */
export function formatSuratMasukCopyText(surat: SuratMasuk): string {
  const tglSurat = formatDateDDMMMMYYYY(surat.tglSurat);
  const tglTerima = formatDateDDMMMMYYYY(surat.tglDiterima);

  // Extract Disposisi Kepada
  const disposisiKeList = (surat.disposisiList || []).flatMap((d) => d.kepada || []);
  const disposisiKeStr =
    disposisiKeList.length > 0
      ? Array.from(new Set(disposisiKeList)).join(', ')
      : '-';

  // Extract Petunjuk/Arahan (instruksi) & Catatan
  const instruksiList: string[] = [];
  const catatanList: string[] = [];

  (surat.disposisiList || []).forEach((d) => {
    if (d.instruksi && d.instruksi.length > 0) {
      instruksiList.push(...d.instruksi);
    }
    if (d.catatan && d.catatan.trim()) {
      catatanList.push(d.catatan.trim());
    }
  });

  const petunjukStr =
    instruksiList.length > 0
      ? Array.from(new Set(instruksiList)).join('; ')
      : '-';

  const catatanStr =
    catatanList.length > 0
      ? Array.from(new Set(catatanList)).join('; ')
      : '-';

  return `*SURAT MASUK*

*_Asal Surat_* : _${surat.pengirim || '-'}_
*_Tanggal surat_* : _${tglSurat}_
-------------------
*_Tanggal terima surat_* : _${tglTerima}_
*_Perihal_* : _${surat.perihal || '-'}_
============
*_Uraian singkat_* : 
${surat.isiRingkasan || '-'}
============
*_Disposisi Kepada_* : _${disposisiKeStr}_
=============
*_Petunjuk/Arahan_* : _${petunjukStr}_

*_Catatan / Petunjuk Khusus Pimpinan_* : _${catatanStr}_
=============

_Akses Dokumen :_ https://e-suratdisparpora-blk-2026.vercel.app/

_Username : user_
_Password : user_

_made by : E-Surat Pro 2026_`;
}

/**
 * Cross-browser copy function with fallback for legacy environments
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text to clipboard:', err);
    return false;
  }
}

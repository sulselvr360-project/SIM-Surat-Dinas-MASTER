import React, { useState } from 'react';
import { SuratKeluar, InstansiConfig } from '../types';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import { X, ShieldCheck, QrCode, Download, Loader2, FileText } from 'lucide-react';
import { exportToPdf } from '../utils/printPdfUtils';

interface OfficialLetterPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  suratKeluar: SuratKeluar | null;
  instansiConfig: InstansiConfig;
}

export const OfficialLetterPreview: React.FC<OfficialLetterPreviewProps> = ({
  isOpen,
  onClose,
  suratKeluar,
  instansiConfig,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !suratKeluar) return null;

  const handleExportPDF = async () => {
    setIsExporting(true);
    const safeName = (suratKeluar.noSurat || suratKeluar.noAgenda).replace(/[/\\?%*:|"<>]/g, '_');
    await exportToPdf('preview-surat-keluar', `Surat_Keluar_${safeName}.pdf`);
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Toolbar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm">Naskah Dinas Surat Keluar Resmi</h3>
              <p className="text-xs text-slate-300">Nomor: {suratKeluar.noSurat}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Unduh file dokumen dalam format PDF"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Proses PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-blue-200" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="preview-surat-keluar" className="p-6 sm:p-8 overflow-y-auto printable-area bg-white text-slate-900 font-serif text-xs sm:text-sm">
          
          {/* KOP SURAT INSTANSI */}
          <div className="border-b-4 border-double border-slate-900 pb-3 mb-4 text-center relative">
            <div className="flex items-center justify-center space-x-4">
              {instansiConfig.logoUrl ? (
                <img
                  src={instansiConfig.logoUrl}
                  alt="Logo Instansi"
                  className="w-16 h-16 object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'w-16 h-16 rounded-xl bg-emerald-700 text-yellow-400 flex items-center justify-center font-bold text-xs shadow-xs';
                      fallback.innerText = 'LOGO';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-emerald-700 text-yellow-400 flex items-center justify-center font-bold text-xs shadow-xs">
                  LOGO
                </div>
              )}
              <div className="font-sans">
                <h2 className="font-bold text-sm sm:text-base tracking-wide text-slate-900 uppercase">
                  {instansiConfig.namaInstansi}
                </h2>
                <h1 className="font-extrabold text-base sm:text-lg text-slate-950 uppercase tracking-tight">
                  {instansiConfig.subNama}
                </h1>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {instansiConfig.alamat} | Telp: {instansiConfig.telepon}
                </p>
                <p className="text-[10px] text-slate-600">
                  Email: {instansiConfig.email} | Web: {instansiConfig.website}
                </p>
              </div>
            </div>
          </div>

          {/* SURAT HEADER INFO */}
          <div className="flex justify-between items-start mb-4 font-sans text-xs">
            
            <div className="space-y-1">
              <div className="flex">
                <span className="w-20 font-bold">Nomor</span>
                <span className="w-4">:</span>
                <span className="font-mono font-bold text-slate-900">{suratKeluar.noSurat}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold">Sifat</span>
                <span className="w-4">:</span>
                <span>{suratKeluar.sifatSurat}</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold">Lampiran</span>
                <span className="w-4">:</span>
                <span>1 (satu) Berkas</span>
              </div>
              <div className="flex">
                <span className="w-20 font-bold">Hal</span>
                <span className="w-4">:</span>
                <span className="font-bold underline text-slate-900">{suratKeluar.perihal}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="font-medium">Makassar, {formatDateDDMMYYYY(suratKeluar.tglSurat)}</p>
            </div>

          </div>

          {/* RECIPIENT ADDRESS */}
          <div className="mb-4 font-sans text-xs leading-relaxed">
            <p>Kepada Yth.</p>
            <p className="font-bold text-slate-900">{suratKeluar.tujuan}</p>
            <p>di -</p>
            <p className="pl-4 italic">Tempat</p>
          </div>

          {/* LETTER BODY */}
          <div className="space-y-3 mb-6 leading-relaxed text-justify text-xs sm:text-sm font-serif">
            {suratKeluar.isiSurat.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="indent-8">
                {paragraph}
              </p>
            ))}
          </div>

          {/* SIGNATURE SECTION */}
          <div className="flex justify-end pt-2 font-sans text-xs no-break">
            <div className="text-center w-72">
              <p className="font-bold uppercase text-[11px] text-slate-900">{instansiConfig.jabatanKepala}</p>
              
              {/* TTD Digital Stamp */}
              {suratKeluar.status === 'Disetujui' || suratKeluar.status === 'Terkirim' ? (
                <div className="my-2 border-2 border-emerald-600 bg-emerald-50/70 p-2.5 rounded-xl text-center text-emerald-900 font-mono text-[10px] space-y-1 shadow-inner">
                  <ShieldCheck className="w-4 h-4 mx-auto text-emerald-700" />
                  <p className="font-bold">[ TANDAN TANGAN DIGITAL RESMI ]</p>
                  <p className="text-[9px] text-slate-500">BSrE / Sertifikat Elektronik Instansi</p>
                  <p className="text-[9px] text-emerald-800 font-mono font-bold">ID: TTD-2026-DIS-8832</p>
                </div>
              ) : (
                <div className="my-4 text-slate-400 italic text-xs border border-dashed border-slate-300 p-2.5 rounded">
                  [ Menunggu Persetujuan TTD Pimpinan ]
                </div>
              )}

              <p className="font-bold text-xs underline uppercase">{suratKeluar.penandatangan}</p>
              <p className="text-[11px] font-mono mt-0.5">NIP. {instansiConfig.nipKepala}</p>
            </div>
          </div>

          {/* FOOTER VERIFICATION QR CODE */}
          <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between font-sans text-[10px] text-slate-400 no-break">
            <div>
              <p className="font-semibold text-slate-600">SurDin v1.0 • Naskah Dinas Elektronik</p>
              <p>Dokumen ini ditandatangani secara elektronik & sah sesuai ketentuan undang-undang.</p>
            </div>
            <div className="flex items-center space-x-1 text-slate-600 font-mono">
              <QrCode className="w-6 h-6 text-slate-700" />
              <span>VERIFIED-PDF</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

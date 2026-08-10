import React, { useState } from 'react';
import { SuratMasuk, InstansiConfig } from '../types';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import { X, ShieldCheck, CheckSquare, Square, Download, Loader2, FileCheck } from 'lucide-react';
import { exportToPdf } from '../utils/printPdfUtils';
import { DEFAULT_TUJUAN_DISPOSISI } from '../data/initialData';

interface LembarDisposisiPrintProps {
  isOpen: boolean;
  onClose: () => void;
  suratMasuk: SuratMasuk | null;
  instansiConfig: InstansiConfig;
}

const DEFAULT_INSTRUKSI_LIST = [
  'Tindak Lanjuti & Selesaikan',
  'Pelajari & Beri Tanggapan',
  'Hadir & Dampingi Pimpinan',
  'Siapkan Bahan / Draf Surat',
  'Koordinasikan Dengan Terkait',
  'Agendakan & Jadwalkan',
  'Proses Sesuai Ketentuan',
  'Untuk Diketahui / Arsipkan',
];

export const LembarDisposisiPrint: React.FC<LembarDisposisiPrintProps> = ({
  isOpen,
  onClose,
  suratMasuk,
  instansiConfig,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !suratMasuk) return null;

  const disposisiTerakhir = suratMasuk.disposisiList[suratMasuk.disposisiList.length - 1];

  const configuredPejabatList =
    instansiConfig?.daftarTujuanDisposisi && instansiConfig.daftarTujuanDisposisi.length > 0
      ? instansiConfig.daftarTujuanDisposisi
      : DEFAULT_TUJUAN_DISPOSISI;

  const selectedKepadaList = Array.from(
    new Set((suratMasuk.disposisiList || []).flatMap((d) => d.kepada || []))
  );
  const selectedInstruksiList = Array.from(
    new Set((suratMasuk.disposisiList || []).flatMap((d) => d.instruksi || []))
  );

  // Build dynamic pejabat list combining configured list and any custom selected kepada items
  const displayPejabatList = [...configuredPejabatList];
  selectedKepadaList.forEach((selectedItem) => {
    if (selectedItem) {
      const exists = displayPejabatList.some(
        (p) =>
          p.trim().toLowerCase() === selectedItem.trim().toLowerCase() ||
          p.toLowerCase().includes(selectedItem.toLowerCase()) ||
          selectedItem.toLowerCase().includes(p.toLowerCase())
      );
      if (!exists) {
        displayPejabatList.push(selectedItem);
      }
    }
  });

  // Build dynamic instruksi list combining standard list and any custom selected instruksi items
  const displayInstruksiList = [...DEFAULT_INSTRUKSI_LIST];
  selectedInstruksiList.forEach((selectedItem) => {
    if (selectedItem) {
      const exists = displayInstruksiList.some(
        (ins) =>
          ins.trim().toLowerCase() === selectedItem.trim().toLowerCase() ||
          ins.toLowerCase().includes(selectedItem.toLowerCase()) ||
          selectedItem.toLowerCase().includes(ins.toLowerCase())
      );
      if (!exists) {
        displayInstruksiList.push(selectedItem);
      }
    }
  });

  const handleExportPDF = async () => {
    setIsExporting(true);
    const safeName = (suratMasuk.noAgenda || 'Disposisi').replace(/[/\\?%*:|"<>]/g, '_');
    await exportToPdf('preview-lembar-disposisi', `Lembar_Disposisi_${safeName}.pdf`);
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Toolbar (Hidden on Print) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="font-bold text-sm">Lembar Disposisi Resmi Instansi</h3>
              <p className="text-xs text-slate-300">No. Agenda: {suratMasuk.noAgenda}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Unduh file Lembar Disposisi dalam format PDF"
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
        <div id="preview-lembar-disposisi" className="p-6 overflow-y-auto printable-area bg-white text-slate-900 font-sans text-xs">
          
          {/* KOP SURAT INSTANSI */}
          <div className="border-b-4 border-double border-slate-900 pb-2 mb-3 text-center relative">
            <div className="flex items-center justify-center space-x-3">
              {instansiConfig.logoUrl ? (
                <img
                  src={instansiConfig.logoUrl}
                  alt="Logo Instansi"
                  className="w-14 h-14 object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'w-14 h-14 rounded-xl bg-emerald-700 text-yellow-400 flex items-center justify-center font-bold text-xs shadow-xs';
                      fallback.innerText = 'LOGO';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-emerald-700 text-yellow-400 flex items-center justify-center font-bold text-xs shadow-xs">
                  LOGO
                </div>
              )}
              <div>
                <h2 className="font-bold text-xs sm:text-sm tracking-wide text-slate-900 uppercase">
                  {instansiConfig.namaInstansi}
                </h2>
                <h1 className="font-extrabold text-sm sm:text-base text-slate-950 uppercase tracking-tight">
                  {instansiConfig.subNama}
                </h1>
                <p className="text-[9px] text-slate-600 mt-0.5">
                  {instansiConfig.alamat} | Telp: {instansiConfig.telepon}
                </p>
                <p className="text-[9px] text-slate-600">
                  Email: {instansiConfig.email} | Web: {instansiConfig.website}
                </p>
              </div>
            </div>
          </div>

          {/* TITLE */}
          <div className="text-center mb-3">
            <h3 className="text-xs font-extrabold uppercase underline tracking-wider text-slate-900">
              LEMBAR DISPOSISI
            </h3>
          </div>

          {/* TABEL PERIHAL SURAT MASUK */}
          <table className="w-full border-collapse border border-slate-900 text-[11px] mb-3">
            <tbody>
              <tr className="border-b border-slate-900">
                <td className="p-1.5 font-bold w-28 bg-slate-50 border-r border-slate-900">Surat Dari</td>
                <td className="p-1.5 font-medium border-r border-slate-900">{suratMasuk.pengirim}</td>
                <td className="p-1.5 font-bold w-28 bg-slate-50 border-r border-slate-900">Diterima Tgl</td>
                <td className="p-1.5 font-medium">{formatDateDDMMYYYY(suratMasuk.tglDiterima)}</td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-900">Tgl. Surat</td>
                <td className="p-1.5 font-medium border-r border-slate-900">{formatDateDDMMYYYY(suratMasuk.tglSurat)}</td>
                <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-900">No. Agenda</td>
                <td className="p-1.5 font-bold font-mono text-blue-900">{suratMasuk.noAgenda}</td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-900">Nomor Surat</td>
                <td className="p-1.5 font-semibold font-mono border-r border-slate-900">{suratMasuk.noSurat}</td>
                <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-900">Klasifikasi</td>
                <td className="p-1.5 font-mono font-bold">{suratMasuk.kodeKlasifikasi}</td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-900">Sifat Surat</td>
                <td className="p-1.5 border-r border-slate-900" colSpan={3}>
                  <span className="font-bold px-2 py-0.5 bg-slate-100 rounded border border-slate-300 text-[10px]">
                    [ {suratMasuk.sifatSurat} ]
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-1.5 font-bold bg-slate-50 border-r border-slate-900">Perihal</td>
                <td className="p-1.5 font-semibold text-slate-900" colSpan={3}>
                  {suratMasuk.perihal}
                </td>
              </tr>
            </tbody>
          </table>

          {/* GRID ROUTING DISPOSISI & INSTRUKSI */}
          <div className="grid grid-cols-2 border border-slate-900 mb-3">
            
            {/* Left: Diteruskan Kepada */}
            <div className="border-r border-slate-900 p-2.5">
              <h4 className="font-bold uppercase text-[10px] mb-1.5 border-b border-slate-900 pb-0.5">
                DISPOSISI KEPADA YTH:
              </h4>
              <div className="space-y-1">
                {displayPejabatList.map((pejabat) => {
                  const isChecked = selectedKepadaList.some((selected) => {
                    if (!selected || !pejabat) return false;
                    const sNorm = selected.trim().toLowerCase();
                    const pNorm = pejabat.trim().toLowerCase();
                    return sNorm === pNorm || sNorm.includes(pNorm) || pNorm.includes(sNorm);
                  });
                  return (
                    <div key={pejabat} className="flex items-center space-x-1.5 text-[10px]">
                      {isChecked ? (
                        <CheckSquare className="w-3 h-3 text-slate-900 shrink-0" />
                      ) : (
                        <Square className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                      <span className={isChecked ? 'font-bold text-slate-950' : 'text-slate-700'}>
                        {pejabat}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Petunjuk / Instruksi */}
            <div className="p-2.5">
              <h4 className="font-bold uppercase text-[10px] mb-1.5 border-b border-slate-900 pb-0.5">
                PETUNJUK / ARAHAN:
              </h4>
              <div className="space-y-1">
                {displayInstruksiList.map((instruksi) => {
                  const isChecked = selectedInstruksiList.some((selected) => {
                    if (!selected || !instruksi) return false;
                    const sNorm = selected.trim().toLowerCase();
                    const itemNorm = instruksi.trim().toLowerCase();
                    return sNorm === itemNorm || sNorm.includes(itemNorm) || itemNorm.includes(sNorm);
                  });
                  return (
                    <div key={instruksi} className="flex items-center space-x-1.5 text-[10px]">
                      {isChecked ? (
                        <CheckSquare className="w-3 h-3 text-slate-900 shrink-0" />
                      ) : (
                        <Square className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                      <span className={isChecked ? 'font-bold text-slate-950' : 'text-slate-700'}>
                        {instruksi}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* CATATAN PIMPINAN BOX */}
          <div className="border border-slate-900 p-2.5 mb-4 min-h-[60px]">
            <h4 className="font-bold uppercase text-[10px] mb-1">CATATAN / PETUNJUK KHUSUS PIMPINAN:</h4>
            <p className="italic font-serif text-slate-900 text-xs pl-2 border-l-2 border-slate-800 my-1">
              "{disposisiTerakhir?.catatan || 'Tindak lanjuti sesuai ketentuan yang berlaku.'}"
            </p>
            {disposisiTerakhir?.batasWaktu && (
              <p className="text-[10px] font-bold text-slate-700 mt-1">
                Batas Waktu Penyelesaian: {formatDateDDMMYYYY(disposisiTerakhir.batasWaktu)}
              </p>
            )}
          </div>

          {/* SIGNATURE AREA */}
          <div className="flex justify-end pt-1 no-break">
            <div className="text-center w-60">
              <p className="text-[10px]">Makassar, {formatDateDDMMYYYY(disposisiTerakhir?.tglDisposisi || suratMasuk.tglDiterima)}</p>
              <p className="font-bold text-[10px] mt-0.5">{instansiConfig.jabatanKepala}</p>
              
              {/* Digital Stamp Simulation */}
              <div className="my-2 border border-emerald-600/30 bg-emerald-50/50 p-1.5 rounded text-emerald-800 text-[9px] inline-block font-mono">
                <ShieldCheck className="w-3.5 h-3.5 mx-auto text-emerald-700 mb-0.5" />
                <span>[ TTD DIGITAL DISPOSISI ]</span>
              </div>

              <p className="font-bold underline text-[11px] mt-0.5">{instansiConfig.namaKepala}</p>
              <p className="text-[10px] font-mono">NIP. {instansiConfig.nipKepala}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

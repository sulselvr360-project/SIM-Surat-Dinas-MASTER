import React, { useState } from 'react';
import { SuratMasuk, UserRole } from '../types';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import { formatSuratMasukCopyText, copyTextToClipboard } from '../utils/copyUtils';
import { X, Inbox, GitFork, Printer, FileText, Calendar, Tag, ShieldCheck, Download, Copy, Check } from 'lucide-react';

interface SuratMasukDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratMasuk | null;
  userRole: UserRole;
  onOpenCreateDisposisi: (surat: SuratMasuk) => void;
  onPrintDisposisi: (surat: SuratMasuk) => void;
}

export const SuratMasukDetailModal: React.FC<SuratMasukDetailModalProps> = ({
  isOpen,
  onClose,
  surat,
  userRole,
  onOpenCreateDisposisi,
  onPrintDisposisi,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !surat) return null;

  const fileName = surat.lampiranName || 'Surat_Masuk_Scan.pdf';
  const copyFormattedText = formatSuratMasukCopyText(surat);

  const handleCopyText = async () => {
    const success = await copyTextToClipboard(copyFormattedText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadFile = () => {
    if (surat.fileUrl) {
      const link = document.createElement('a');
      link.href = surat.fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const content = `==================================================
BERKAS ARSIP LAMPIRAN SURAT MASUK
==================================================
Agenda No     : ${surat.noAgenda}
Nomor Surat   : ${surat.noSurat}
Pengirim      : ${surat.pengirim}
Tanggal Surat : ${formatDateDDMMYYYY(surat.tglSurat)}
Diterima Tgl  : ${formatDateDDMMYYYY(surat.tglDiterima)}
Sifat Surat   : ${surat.sifatSurat}
Perihal       : ${surat.perihal}
--------------------------------------------------
Ringkasan Isi :
${surat.isiRingkasan || '-'}
==================================================
`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const downloadName = fileName.toLowerCase().endsWith('.pdf') ? fileName.replace(/\.pdf$/i, '.txt') : fileName;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Inbox className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold">Detail Agenda Surat Masuk</h2>
              <p className="text-xs text-slate-300">Agenda: {surat.noAgenda}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          
          {/* Main Info Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono font-bold text-blue-900 text-sm bg-blue-100 px-2.5 py-0.5 rounded border border-blue-200">
                {surat.noSurat}
              </span>
              <div className="space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                  surat.sifatSurat === 'Penting' || surat.sifatSurat === 'Sangat Penting'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-slate-200 text-slate-800'
                }`}>
                  Sifat: {surat.sifatSurat}
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                  Status: {surat.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Perihal</p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{surat.perihal}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <p className="text-slate-500 font-bold">Instansi Pengirim:</p>
                <p className="font-bold text-slate-900">{surat.pengirim}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold">Tanggal Surat & Diterima:</p>
                <p className="font-semibold text-slate-800">
                  Surat: {formatDateDDMMYYYY(surat.tglSurat)} • Diterima: {formatDateDDMMYYYY(surat.tglDiterima)}
                </p>
              </div>
            </div>

            {surat.isiRingkasan && (
              <div className="pt-2 border-t border-slate-200">
                <p className="text-slate-500 font-bold">Ringkasan / Isi Singkat:</p>
                <p className="text-slate-700 mt-1 leading-relaxed">{surat.isiRingkasan}</p>
              </div>
            )}
          </div>

          {/* Copy Text Format Action Banner */}
          <div className="bg-emerald-50/80 px-4 py-3 rounded-xl border border-emerald-200/90 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Copy className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-emerald-950 text-xs block">Format Ringkasan WhatsApp / Pesan</span>
                <span className="text-[11px] text-emerald-700">Salin ringkasan surat masuk dengan format pesan standar</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyText}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                copied
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Teks Tersalin!' : 'Salin Teks Format'}</span>
            </button>
          </div>

          {/* Lampiran Box */}
          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-bold text-slate-900">Berkas Lampiran Scan Surat</p>
                  <p className="text-[11px] text-slate-500">{surat.lampiranName || 'Surat_Masuk_Scan.pdf'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadFile}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File</span>
              </button>
            </div>

            {/* Optional Image Preview if attached via camera or photo upload */}
            {surat.fileUrl && surat.fileUrl.startsWith('data:image/') && (
              <div className="mt-2 border border-blue-200 rounded-lg overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-2">
                <p className="text-[10px] text-slate-300 font-semibold mb-1 w-full text-left px-1">
                  Pratinjau Hasil Foto / Scan:
                </p>
                <img
                  src={surat.fileUrl}
                  alt="Hasil Foto / Scan Surat"
                  className="max-h-64 object-contain rounded border border-slate-700"
                />
              </div>
            )}
          </div>

          {/* Timeline Disposisi */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
              <GitFork className="w-4 h-4 text-amber-600" />
              <span>Riwayat Disposisi Pimpinan ({surat.disposisiList.length})</span>
            </h4>

            {surat.disposisiList.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-center">
                <p className="font-bold">Belum Ada Disposisi Pimpinan</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Kepala Instansi belum memberikan lembar instruksi disposisi untuk surat masuk ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {surat.disposisiList.map((d) => (
                  <div key={d.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-amber-900">Dari: {d.dari}</span>
                      <span className="text-[11px] text-slate-500 font-mono">Tgl: {formatDateDDMMYYYY(d.tglDisposisi)}</span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-700">Diteruskan Kepada:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {d.kepada.map((k) => (
                          <span key={k} className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-slate-700">Instruksi:</p>
                      <ul className="list-disc list-inside text-slate-800 space-y-0.5 mt-0.5">
                        {d.instruksi.map((i) => (
                          <li key={i}>{i}</li>
                        ))}
                      </ul>
                    </div>

                    {d.catatan && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic font-serif text-slate-800">
                        "{d.catatan}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {userRole !== 'user' ? (
            userRole === 'operator' && surat.disposisiList.length > 0 ? (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-200/80 text-slate-600 rounded-lg text-xs font-semibold border border-slate-300">
                <GitFork className="w-3.5 h-3.5 text-slate-500" />
                <span>Disposisi Telah Dibuat (Read-Only bagi Operator)</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateDisposisi(surat);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow transition-all flex items-center space-x-1.5 cursor-pointer text-xs"
              >
                <GitFork className="w-4 h-4" />
                <span>+ Buat Disposisi</span>
              </button>
            )
          ) : (
            <div></div>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onPrintDisposisi(surat);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-200" />
              <span>Export Lembar Disposisi (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

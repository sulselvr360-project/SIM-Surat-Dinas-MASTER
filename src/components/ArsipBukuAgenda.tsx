import React, { useState } from 'react';
import { SuratMasuk, SuratKeluar, InstansiConfig } from '../types';
import { formatDateDDMMYYYY, getTodayDDMMYYYY } from '../utils/dateUtils';
import { BookOpen, Download, Filter, Calendar, Inbox, Send, FileCode, Loader2 } from 'lucide-react';
import { exportToPdf } from '../utils/printPdfUtils';

interface ArsipBukuAgendaProps {
  suratMasukList: SuratMasuk[];
  suratKeluarList: SuratKeluar[];
  instansiConfig: InstansiConfig;
}

export const ArsipBukuAgenda: React.FC<ArsipBukuAgendaProps> = ({
  suratMasukList,
  suratKeluarList,
  instansiConfig,
}) => {
  const [activeType, setActiveType] = useState<'masuk' | 'keluar'>('masuk');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const getStatusSuratMasukDisplay = (s: SuratMasuk): string => {
    const tujuanList: string[] = [];
    (s.disposisiList || []).forEach((d) => {
      if (d.kepada && Array.isArray(d.kepada)) {
        d.kepada.forEach((k) => {
          if (k && !tujuanList.includes(k)) {
            tujuanList.push(k);
          }
        });
      }
    });

    if (tujuanList.length > 0) {
      return `Disposisi ke : ${tujuanList.join(', ')}`;
    }

    if (s.status === 'Didisposisi') {
      return 'Didisposisi';
    }

    return s.status || 'Menunggu';
  };

  const handleExportPDF = async () => {
    setIsExportingPdf(true);
    await exportToPdf('buku-agenda-printable', `Buku_Agenda_Surat_${activeType.toUpperCase()}_${selectedYear}.pdf`);
    setIsExportingPdf(false);
  };

  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeType === 'masuk') {
      csvContent += 'No Agenda,No Surat,Tgl Surat,Tgl Diterima,Pengirim,Perihal,Kode,Sifat,Status\n';
      suratMasukList.forEach((s) => {
        csvContent += `"${s.noAgenda}","${s.noSurat}","${formatDateDDMMYYYY(s.tglSurat)}","${formatDateDDMMYYYY(s.tglDiterima)}","${s.pengirim}","${s.perihal}","${s.kodeKlasifikasi}","${s.sifatSurat}","${getStatusSuratMasukDisplay(s)}"\n`;
      });
    } else {
      csvContent += 'No Agenda,No Surat,Tgl Surat,Tujuan,Perihal,Kode,Penandatangan,Status\n';
      suratKeluarList.forEach((s) => {
        csvContent += `"${s.noAgenda}","${s.noSurat}","${formatDateDDMMYYYY(s.tglSurat)}","${s.tujuan}","${s.perihal}","${s.kodeKlasifikasi}","${s.penandatangan}","${s.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Buku_Agenda_Surat_${activeType.toUpperCase()}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm no-print">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-slate-900 text-yellow-400 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Buku Agenda & Rekapitulasi Naskah Dinas</h1>
            <p className="text-xs text-slate-500">Laporan resmi rekapitulasi surat masuk dan keluar instansi</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
            title="Download file Excel / CSV"
          >
            <Download className="w-4 h-4" />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
            title="Download laporan Buku Agenda dalam format PDF"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Proses PDF...</span>
              </>
            ) : (
              <>
                <FileCode className="w-4 h-4 text-blue-200" />
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Switcher & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        
        {/* Type Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setActiveType('masuk')}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeType === 'masuk'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Buku Agenda Surat Masuk</span>
          </button>

          <button
            onClick={() => setActiveType('keluar')}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeType === 'keluar'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Buku Agenda Surat Keluar</span>
          </button>
        </div>

        {/* Year Filter */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-bold">Tahun Anggaran:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-bold text-slate-800"
          >
            <option value="2026">T.A. 2026</option>
            <option value="2025">T.A. 2025</option>
          </select>
        </div>

      </div>

      {/* Agenda Book Report View (Printable) */}
      <div id="buku-agenda-printable" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm printable-area">
        
        {/* Report Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-wide">
            {instansiConfig.namaInstansi}
          </h3>
          <h2 className="font-black text-slate-950 text-lg uppercase tracking-tight">
            {instansiConfig.subNama}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            BUKU AGENDA REGISTER REKAPITULASI {activeType === 'masuk' ? 'SURAT MASUK' : 'SURAT KELUAR'} - TAHUN {selectedYear}
          </p>
        </div>

        {/* Agenda Table */}
        {activeType === 'masuk' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-900">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-900 font-bold text-slate-900 text-center">
                  <th className="p-2 border border-slate-900 w-10">No</th>
                  <th className="p-2 border border-slate-900 w-28">No. Agenda</th>
                  <th className="p-2 border border-slate-900 w-24">Tgl Terima</th>
                  <th className="p-2 border border-slate-900">Nomor & Tgl Surat</th>
                  <th className="p-2 border border-slate-900">Pengirim</th>
                  <th className="p-2 border border-slate-900">Perihal</th>
                  <th className="p-2 border border-slate-900 w-16">Kode</th>
                  <th className="p-2 border border-slate-900 w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {suratMasukList.map((item, idx) => (
                  <tr key={item.id} className="text-slate-900 font-medium">
                    <td className="p-2 border border-slate-900 text-center">{idx + 1}</td>
                    <td className="p-2 border border-slate-900 font-mono font-bold">{item.noAgenda}</td>
                    <td className="p-2 border border-slate-900 text-center">{formatDateDDMMYYYY(item.tglDiterima)}</td>
                    <td className="p-2 border border-slate-900">
                      <div className="font-semibold">{item.noSurat}</div>
                      <div className="text-[10px] text-slate-500">Tgl: {formatDateDDMMYYYY(item.tglSurat)}</div>
                    </td>
                    <td className="p-2 border border-slate-900 font-semibold">{item.pengirim}</td>
                    <td className="p-2 border border-slate-900">{item.perihal}</td>
                    <td className="p-2 border border-slate-900 text-center font-mono font-bold">{item.kodeKlasifikasi}</td>
                    <td className="p-2 border border-slate-900 text-center font-bold text-[11px]">{getStatusSuratMasukDisplay(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-900">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-900 font-bold text-slate-900 text-center">
                  <th className="p-2 border border-slate-900 w-10">No</th>
                  <th className="p-2 border border-slate-900 w-28">No. Agenda</th>
                  <th className="p-2 border border-slate-900 w-24">Tgl Surat</th>
                  <th className="p-2 border border-slate-900">Nomor Surat</th>
                  <th className="p-2 border border-slate-900">Tujuan / Penerima</th>
                  <th className="p-2 border border-slate-900">Perihal</th>
                  <th className="p-2 border border-slate-900 w-16">Kode</th>
                  <th className="p-2 border border-slate-900 w-28">Penandatangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {suratKeluarList.map((item, idx) => (
                  <tr key={item.id} className="text-slate-900 font-medium">
                    <td className="p-2 border border-slate-900 text-center">{idx + 1}</td>
                    <td className="p-2 border border-slate-900 font-mono font-bold">{item.noAgenda}</td>
                    <td className="p-2 border border-slate-900 text-center">{formatDateDDMMYYYY(item.tglSurat)}</td>
                    <td className="p-2 border border-slate-900 font-mono font-bold">{item.noSurat}</td>
                    <td className="p-2 border border-slate-900 font-semibold">{item.tujuan}</td>
                    <td className="p-2 border border-slate-900">{item.perihal}</td>
                    <td className="p-2 border border-slate-900 text-center font-mono font-bold">{item.kodeKlasifikasi}</td>
                    <td className="p-2 border border-slate-900 font-semibold">{item.penandatangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Signature Block */}
        <div className="mt-8 pt-4 flex justify-between items-end text-xs">
          <div>
            <p className="text-slate-500">Dicetak melalui SurDin v1.0 (Sistem Surat Digital)</p>
            <p className="text-[10px] text-slate-400 font-mono">Tgl Cetak: {getTodayDDMMYYYY()}</p>
          </div>
          <div className="text-center w-60">
            <p>Makassar, {getTodayDDMMYYYY()}</p>
            <p className="font-bold mt-1">Petugas Agendaris / Pengelola Surat</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{instansiConfig.namaAgendaris || 'Hj. St. Rosdiana, S.Sos., M.AP.'}</p>
            <p className="text-[10px] font-mono">NIP. {instansiConfig.nipAgendaris || '19780415 200501 2 004'}</p>
          </div>
        </div>

      </div>

    </div>
  );
};

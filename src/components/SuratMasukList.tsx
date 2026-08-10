import React, { useState } from 'react';
import { SuratMasuk, UserRole, SifatSurat, StatusSuratMasuk } from '../types';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import { formatSuratMasukCopyText, copyTextToClipboard } from '../utils/copyUtils';
import { 
  Inbox, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  GitFork, 
  Trash2, 
  Printer, 
  FileText,
  Clock,
  CheckCircle,
  Tag,
  AlertTriangle,
  Copy,
  Check,
  Edit
} from 'lucide-react';

interface SuratMasukListProps {
  suratMasukList: SuratMasuk[];
  userRole: UserRole;
  onOpenDetail: (surat: SuratMasuk) => void;
  onOpenCreateDisposisi: (surat: SuratMasuk) => void;
  onPrintDisposisi: (surat: SuratMasuk) => void;
  onNewSuratMasuk: () => void;
  onEditSurat?: (surat: SuratMasuk) => void;
  onDeleteSurat: (id: string) => void;
  searchQuery: string;
}

export const SuratMasukList: React.FC<SuratMasukListProps> = ({
  suratMasukList,
  userRole,
  onOpenDetail,
  onOpenCreateDisposisi,
  onPrintDisposisi,
  onNewSuratMasuk,
  onEditSurat,
  onDeleteSurat,
  searchQuery,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [sifatFilter, setSifatFilter] = useState<string>('semua');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; noAgenda: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = async (surat: SuratMasuk) => {
    const text = formatSuratMasukCopyText(surat);
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedId(surat.id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2500);
    }
  };

  const canCreate = userRole !== 'user';
  const canEdit = userRole === 'admin' || userRole === 'superadmin';
  const canDelete = userRole === 'admin' || userRole === 'superadmin';
  const canDisposisi = userRole !== 'user';

  const effectiveSearch = localSearch || searchQuery;

  const filteredList = suratMasukList.filter((item) => {
    // Status Filter
    if (statusFilter !== 'semua' && item.status !== statusFilter) return false;
    // Sifat Filter
    if (sifatFilter !== 'semua' && item.sifatSurat !== sifatFilter) return false;
    // Search Query
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      const matchNoSurat = item.noSurat.toLowerCase().includes(q);
      const matchNoAgenda = item.noAgenda.toLowerCase().includes(q);
      const matchPengirim = item.pengirim.toLowerCase().includes(q);
      const matchPerihal = item.perihal.toLowerCase().includes(q);
      const matchKode = item.kodeKlasifikasi.toLowerCase().includes(q);
      return matchNoSurat || matchNoAgenda || matchPengirim || matchPerihal || matchKode;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Agenda Surat Masuk</h1>
              <p className="text-xs text-slate-500">Mencatat, mengarsipkan, dan mendisposisikan surat masuk instansi</p>
            </div>
          </div>
        </div>

        {canCreate && (
          <button
            onClick={onNewSuratMasuk}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agenda Surat Masuk Baru</span>
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Cari no. surat, perihal, pengirim..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto flex-wrap gap-y-2">
          
          <div className="flex items-center space-x-1 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="semua">Semua Status</option>
            <option value="Menunggu">Menunggu Disposisi</option>
            <option value="Didisposisi">Didisposisi</option>
            <option value="Selesai">Selesai / Diarsipkan</option>
          </select>

          {/* Sifat Dropdown */}
          <select
            value={sifatFilter}
            onChange={(e) => setSifatFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="semua">Semua Sifat Surat</option>
            <option value="Biasa">Biasa</option>
            <option value="Penting">Penting</option>
            <option value="Sangat Penting">Sangat Penting</option>
            <option value="Rahasia">Rahasia</option>
          </select>

        </div>

      </div>

      {/* Surat Masuk Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">No. Agenda / Kode</th>
                <th className="p-3.5">No. & Tgl Surat</th>
                <th className="p-3.5">Pengirim & Perihal</th>
                <th className="p-3.5">Sifat & Status</th>
                <th className="p-3.5 text-center">Disposisi</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada data surat masuk</p>
                    <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau filter status</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((surat, index) => (
                  <tr key={surat.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="p-3.5 text-center text-slate-400 font-mono">{index + 1}</td>
                    
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{surat.noAgenda}</div>
                      <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                        Kode: {surat.kodeKlasifikasi}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{surat.noSurat}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tgl: {formatDateDDMMYYYY(surat.tglSurat)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Terima: {formatDateDDMMYYYY(surat.tglDiterima)}
                      </div>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <div className="font-semibold text-blue-900 line-clamp-1">{surat.pengirim}</div>
                      <div className="text-slate-700 font-medium line-clamp-2 mt-0.5">{surat.perihal}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          surat.sifatSurat === 'Sangat Penting' || surat.sifatSurat === 'Rahasia'
                            ? 'bg-red-100 text-red-800'
                            : surat.sifatSurat === 'Penting'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {surat.sifatSurat}
                        </span>

                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            surat.status === 'Menunggu'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : surat.status === 'Didisposisi'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {surat.status}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      {surat.disposisiList.length > 0 ? (
                        <button
                          onClick={() => onPrintDisposisi(surat)}
                          className="inline-flex items-center space-x-1 text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold px-2 py-1 rounded border border-amber-200 transition-colors"
                          title="Cetak Lembar Disposisi Resmi"
                        >
                          <Printer className="w-3 h-3" />
                          <span>{surat.disposisiList.length} Lembar</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum Ada</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        
                        {/* Copy Text Format Button */}
                        <button
                          onClick={() => handleCopyText(surat)}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            copiedId === surat.id
                              ? 'bg-emerald-100 text-emerald-700 font-bold'
                              : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={copiedId === surat.id ? 'Teks Berhasil Disalin!' : 'Salin Teks Format Surat Masuk'}
                        >
                          {copiedId === surat.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Detail Button */}
                        <button
                          onClick={() => onOpenDetail(surat)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Lihat Detail & Lampiran"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button (Khusus Superadmin) */}
                        {canEdit && onEditSurat && (
                          <button
                            onClick={() => onEditSurat(surat)}
                            className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                            title="Edit Data Surat Masuk"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* Disposisi Button */}
                        {canDisposisi && (
                          <button
                            onClick={() => {
                              if (userRole === 'operator' && surat.disposisiList && surat.disposisiList.length > 0) {
                                alert('Akses Terbatas: Operator tidak dapat mengedit disposisi surat yang sudah di disposisi sebelumnya.');
                                return;
                              }
                              onOpenCreateDisposisi(surat);
                            }}
                            className={`p-1.5 rounded transition-colors ${
                              userRole === 'operator' && surat.disposisiList && surat.disposisiList.length > 0
                                ? 'text-slate-300 hover:bg-slate-50 cursor-not-allowed'
                                : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer'
                            }`}
                            title={
                              userRole === 'operator' && surat.disposisiList && surat.disposisiList.length > 0
                                ? 'Disposisi sudah ada (Operator tidak dapat mengedit disposisi)'
                                : 'Buat Disposisi'
                            }
                          >
                            <GitFork className="w-4 h-4" />
                          </button>
                        )}

                        {/* Lembar Disposisi PDF Button */}
                        <button
                          onClick={() => onPrintDisposisi(surat)}
                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Export / Download Lembar Disposisi (PDF)"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                        </button>

                        {/* Delete Button (Only Superadmin) */}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget({ id: surat.id, title: surat.perihal, noAgenda: surat.noAgenda })}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Hapus Agenda Surat Masuk (Superadmin Only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Agenda Surat Masuk</h3>
                <p className="text-xs text-slate-500">Konfirmasi penghapusan data arsip</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><span className="font-bold text-slate-900">No. Agenda:</span> {deleteTarget.noAgenda}</p>
              <p><span className="font-bold text-slate-900">Perihal:</span> {deleteTarget.title}</p>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus data surat masuk ini dari sistem agenda instansi? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteSurat(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

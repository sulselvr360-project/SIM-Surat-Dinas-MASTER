import React, { useState } from 'react';
import { SuratKeluar, UserRole, StatusSuratKeluar } from '../types';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import { 
  Send, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  CheckCircle, 
  FileText, 
  Printer, 
  Trash2, 
  FileCheck2,
  Clock,
  SendHorizontal,
  Edit
} from 'lucide-react';

interface SuratKeluarListProps {
  suratKeluarList: SuratKeluar[];
  userRole: UserRole;
  onOpenDetail: (surat: SuratKeluar) => void;
  onNewSuratKeluar: () => void;
  onEditSurat?: (surat: SuratKeluar) => void;
  onUpdateStatus: (id: string, newStatus: StatusSuratKeluar) => void;
  onDeleteSurat: (id: string) => void;
  searchQuery: string;
}

export const SuratKeluarList: React.FC<SuratKeluarListProps> = ({
  suratKeluarList,
  userRole,
  onOpenDetail,
  onNewSuratKeluar,
  onEditSurat,
  onUpdateStatus,
  onDeleteSurat,
  searchQuery,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; noAgenda: string } | null>(null);

  const canCreate = userRole !== 'user';
  const canEdit = userRole === 'admin' || userRole === 'superadmin';
  const canDelete = userRole === 'admin' || userRole === 'superadmin';

  const effectiveSearch = localSearch || searchQuery;

  const filteredList = suratKeluarList.filter((item) => {
    if (statusFilter !== 'semua' && item.status !== statusFilter) return false;
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      const matchNo = item.noSurat.toLowerCase().includes(q);
      const matchTujuan = item.tujuan.toLowerCase().includes(q);
      const matchPerihal = item.perihal.toLowerCase().includes(q);
      const matchPenandatangan = item.penandatangan.toLowerCase().includes(q);
      return matchNo || matchTujuan || matchPerihal || matchPenandatangan;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Agenda & Pembuatan Surat Keluar</h1>
              <p className="text-xs text-slate-500">Drafting naskah dinas keluar, pengajuan penandatanganan, dan pengiriman resmi</p>
            </div>
          </div>
        </div>

        {canCreate && (
          <button
            onClick={onNewSuratKeluar}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Surat Keluar Baru</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Cari no. surat, perihal, tujuan..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Status Workflow:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="semua">Semua Status Workflow</option>
            <option value="Draft">Draft Naskah</option>
            <option value="Pengajuan TTD">Pengajuan TTD Pimpinan</option>
            <option value="Disetujui">Disetujui & Ttd Digital</option>
            <option value="Terkirim">Terkirim / Diagendakan</option>
          </select>
        </div>

      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">No. Agenda & Klasifikasi</th>
                <th className="p-3.5">Nomor & Tanggal Surat</th>
                <th className="p-3.5">Tujuan & Perihal</th>
                <th className="p-3.5">Penandatangan</th>
                <th className="p-3.5 text-center">Status Naskah</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Send className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada surat keluar</p>
                    <p className="text-xs text-slate-400">Silakan buat draft surat keluar baru</p>
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
                      <div className="text-[11px] text-slate-500 mt-0.5">Tgl: {formatDateDDMMYYYY(surat.tglSurat)}</div>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1">{surat.tujuan}</div>
                      <div className="text-slate-600 line-clamp-2 mt-0.5">{surat.perihal}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-700 font-medium">{surat.penandatangan}</div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Penandatangan Resmi</span>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        surat.status === 'Draft'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : surat.status === 'Pengajuan TTD'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : surat.status === 'Disetujui'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {surat.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        
                        {/* Edit Button */}
                        {canEdit && onEditSurat && (
                          <button
                            onClick={() => onEditSurat(surat)}
                            className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Agenda & Naskah Surat Keluar"
                          >
                            <Edit className="w-4 h-4 text-amber-600" />
                          </button>
                        )}

                        {/* Preview & Download PDF Button */}
                        <button
                          onClick={() => onOpenDetail(surat)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all shadow-2xs cursor-pointer"
                          title="Pratinjau Naskah & Download PDF"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Preview PDF</span>
                        </button>

                        {/* Status Progression Workflow */}
                        {userRole !== 'user' && surat.status === 'Draft' && (
                          <button
                            onClick={() => onUpdateStatus(surat.id, 'Pengajuan TTD')}
                            className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors cursor-pointer"
                            title="Ajukan Penandatanganan ke Pimpinan"
                          >
                            Ajukan TTD
                          </button>
                        )}

                        {canEdit && surat.status === 'Pengajuan TTD' && (
                          <button
                            onClick={() => onUpdateStatus(surat.id, 'Disetujui')}
                            className="px-2 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors flex items-center space-x-1 cursor-pointer"
                            title="Setujui dan Beri TTD Digital"
                          >
                            <FileCheck2 className="w-3 h-3" />
                            <span>Setujui TTD</span>
                          </button>
                        )}

                        {canEdit && surat.status === 'Disetujui' && (
                          <button
                            onClick={() => onUpdateStatus(surat.id, 'Terkirim')}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors flex items-center space-x-1 cursor-pointer"
                            title="Tandai Sudah Terkirim ke Penerima"
                          >
                            <SendHorizontal className="w-3 h-3" />
                            <span>Kirim</span>
                          </button>
                        )}

                        {/* Delete Button (Only Superadmin) */}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget({ id: surat.id, title: surat.perihal, noAgenda: surat.noAgenda })}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Hapus Surat Keluar (Superadmin Only)"
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
                <h3 className="text-base font-bold text-slate-900">Hapus Agenda Surat Keluar</h3>
                <p className="text-xs text-slate-500">Konfirmasi penghapusan data draft/agenda</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><span className="font-bold text-slate-900">No. Agenda:</span> {deleteTarget.noAgenda}</p>
              <p><span className="font-bold text-slate-900">Perihal:</span> {deleteTarget.title}</p>
            </div>

            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus data surat keluar ini dari agenda instansi? Tindakan ini tidak dapat dibatalkan.
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

import React, { useState } from 'react';
import { KodeKlasifikasi } from '../types';
import { BookmarkCheck, Search, Plus, Tag, Info } from 'lucide-react';

interface KlasifikasiViewProps {
  kodeKlasifikasiList: KodeKlasifikasi[];
  onAddKodeKlasifikasi: (kode: KodeKlasifikasi) => void;
  userRole?: string;
}

export const KlasifikasiView: React.FC<KlasifikasiViewProps> = ({
  kodeKlasifikasiList,
  onAddKodeKlasifikasi,
  userRole = 'admin',
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('semua');
  
  // New Code Modal
  const [showModal, setShowModal] = useState(false);
  const [newKode, setNewKode] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newKategori, setNewKategori] = useState('Umum');
  const [newDeskripsi, setNewDeskripsi] = useState('');

  const categories = Array.from(new Set(kodeKlasifikasiList.map((k) => k.kategori)));

  const filteredList = kodeKlasifikasiList.filter((item) => {
    if (selectedCategory !== 'semua' && item.kategori !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.kode.toLowerCase().includes(q) ||
        item.nama.toLowerCase().includes(q) ||
        item.deskripsi.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKode.trim() || !newNama.trim()) {
      alert('Isi kode dan nama klasifikasi!');
      return;
    }
    onAddKodeKlasifikasi({
      kode: newKode,
      nama: newNama,
      kategori: newKategori,
      deskripsi: newDeskripsi || 'Klasifikasi naskah dinas instansi.',
    });
    setNewKode('');
    setNewNama('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kode Klasifikasi Surat (Permendagri / ANRI)</h1>
            <p className="text-xs text-slate-500">Pedoman pengodean naskah dinas & kearsipan instansi pemerintah</p>
          </div>
        </div>

        {userRole !== 'user' && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kode Klasifikasi</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode (contoh: 000, 800) atau nama..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'semua'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Classification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((item) => (
          <div
            key={item.kode}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold font-mono bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-200">
                {item.kode}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {item.kategori}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm">{item.nama}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                {item.deskripsi}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-indigo-800 text-white p-4 font-bold text-sm flex justify-between items-center">
              <span>Tambah Kode Klasifikasi Baru</span>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Kode *</label>
                <input
                  type="text"
                  value={newKode}
                  onChange={(e) => setNewKode(e.target.value)}
                  placeholder="Contoh: 005"
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Nama Klasifikasi *</label>
                <input
                  type="text"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Contoh: UNDANGAN"
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Kategori *</label>
                <select
                  value={newKategori}
                  onChange={(e) => setNewKategori(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                >
                  <option value="Umum">Umum</option>
                  <option value="Pemerintahan">Pemerintahan</option>
                  <option value="Kesra">Kesra</option>
                  <option value="Kepegawaian">Kepegawaian</option>
                  <option value="Keuangan">Keuangan</option>
                  <option value="Infrastruktur">Infrastruktur</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Deskripsi Penggunaan</label>
                <textarea
                  value={newDeskripsi}
                  onChange={(e) => setNewDeskripsi(e.target.value)}
                  rows={3}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded"
                />
              </div>
              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded font-bold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

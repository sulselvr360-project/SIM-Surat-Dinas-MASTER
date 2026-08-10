import React, { useState, useEffect } from 'react';
import { SuratMasuk, Disposisi, SifatSurat, InstansiConfig } from '../types';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import { X, GitFork, Save, AlertCircle, Calendar, UserCheck } from 'lucide-react';
import { DEFAULT_TUJUAN_DISPOSISI } from '../data/initialData';

interface DisposisiModalProps {
  isOpen: boolean;
  onClose: () => void;
  suratMasuk: SuratMasuk | null;
  onSubmitDisposisi: (disposisi: Omit<Disposisi, 'id'>) => void;
  instansiConfig?: InstansiConfig;
}

const INSTRUKSI_OPTIONS = [
  'Tindak Lanjuti & Selesaikan',
  'Pelajari & Beri Tanggapan',
  'Hadir & Dampingi Pimpinan',
  'Siapkan Bahan / Draf Surat',
  'Koordinasikan Dengan Terkait',
  'Agendakan & Jadwalkan',
  'Proses Sesuai Ketentuan',
  'Untuk Diketahui / Arsipkan',
];

export const DisposisiModal: React.FC<DisposisiModalProps> = ({
  isOpen,
  onClose,
  suratMasuk,
  onSubmitDisposisi,
  instansiConfig,
}) => {
  const pejabatList = instansiConfig?.daftarTujuanDisposisi && instansiConfig.daftarTujuanDisposisi.length > 0
    ? instansiConfig.daftarTujuanDisposisi
    : DEFAULT_TUJUAN_DISPOSISI;

  const today = new Date().toISOString().split('T')[0];

  const [kepada, setKepada] = useState<string[]>(pejabatList.slice(0, 1));
  const [instruksi, setInstruksi] = useState<string[]>(['Tindak Lanjuti & Selesaikan']);
  const [catatan, setCatatan] = useState('');
  const [batasWaktu, setBatasWaktu] = useState(today);
  const [sifat, setSifat] = useState<SifatSurat>(suratMasuk?.sifatSurat || 'Biasa');

  useEffect(() => {
    if (isOpen && suratMasuk) {
      const existing = suratMasuk.disposisiList && suratMasuk.disposisiList.length > 0
        ? suratMasuk.disposisiList[suratMasuk.disposisiList.length - 1]
        : null;

      if (existing) {
        setKepada(existing.kepada && existing.kepada.length > 0 ? existing.kepada : pejabatList.slice(0, 1));
        setInstruksi(existing.instruksi && existing.instruksi.length > 0 ? existing.instruksi : ['Tindak Lanjuti & Selesaikan']);
        setCatatan(existing.catatan || '');
        setBatasWaktu(existing.batasWaktu || today);
        setSifat(existing.sifat || suratMasuk.sifatSurat || 'Biasa');
      } else {
        setKepada(pejabatList.slice(0, 1));
        setInstruksi(['Tindak Lanjuti & Selesaikan']);
        setCatatan('');
        setBatasWaktu(today);
        setSifat(suratMasuk?.sifatSurat || 'Biasa');
      }
    }
  }, [isOpen, suratMasuk, instansiConfig]);

  if (!isOpen || !suratMasuk) return null;

  const toggleKepada = (pejabat: string) => {
    setKepada((prev) =>
      prev.includes(pejabat) ? prev.filter((p) => p !== pejabat) : [...prev, pejabat]
    );
  };

  const toggleInstruksi = (item: string) => {
    setInstruksi((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (kepada.length === 0) {
      alert('Pilih minimal 1 Pejabat/Penerima Disposisi!');
      return;
    }
    if (instruksi.length === 0) {
      alert('Pilih minimal 1 Instruksi Disposisi!');
      return;
    }

    onSubmitDisposisi({
      suratId: suratMasuk.id,
      noAgendaSurat: suratMasuk.noAgenda,
      tglDisposisi: today,
      dari: 'Kepala Dinas',
      kepada,
      instruksi,
      catatan,
      batasWaktu,
      sifat,
      status: 'Diproses',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-yellow-300" />
            <div>
              <h2 className="text-lg font-bold">Buat Lembar Disposisi Pimpinan</h2>
              <p className="text-xs text-amber-100">Intruksi resmi pimpinan untuk penanganan surat masuk</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-amber-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Surat Brief Summary Box */}
        <div className="bg-amber-50/70 border-b border-amber-200 p-4 text-xs space-y-1">
          <div className="flex items-center justify-between font-bold text-amber-950">
            <span>No. Agenda: {suratMasuk.noAgenda}</span>
            <span className="font-mono bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              No. Surat: {suratMasuk.noSurat}
            </span>
          </div>
          <p className="font-semibold text-slate-800">
            <span className="text-amber-900">Pengirim:</span> {suratMasuk.pengirim}
          </p>
          <p className="text-slate-700 line-clamp-2">
            <span className="font-semibold text-amber-900">Perihal:</span> {suratMasuk.perihal}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          
          {/* Target Penerima Disposisi */}
          <div>
            <label className="block font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-700" />
              <span>1. Disposisikan Kepada Yth. (Pilih Pejabat) *</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {pejabatList.map((pejabat) => {
                const isSelected = kepada.includes(pejabat);
                return (
                  <label
                    key={pejabat}
                    onClick={() => toggleKepada(pejabat)}
                    className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-100/80 border-amber-400 text-amber-950 font-bold'
                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="line-clamp-1">{pejabat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Petunjuk / Instruksi */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              2. Petunjuk / Instruksi Pimpinan *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {INSTRUKSI_OPTIONS.map((item) => {
                const isSelected = instruksi.includes(item);
                return (
                  <label
                    key={item}
                    onClick={() => toggleInstruksi(item)}
                    className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-100/80 border-amber-400 text-amber-950 font-bold'
                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>{item}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Catatan Tambahan Pimpinan */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              3. Catatan Khusus Pimpinan
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder="Tuliskan catatan khusus atau arahan penting untuk pelaksana..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Batas Waktu */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>Batas Waktu Penyelesaian *</span>
                </label>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                  {formatDateDDMMYYYY(batasWaktu)}
                </span>
              </div>
              <input
                type="date"
                value={batasWaktu}
                onChange={(e) => setBatasWaktu(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Sifat Disposisi */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Sifat Disposisi *
              </label>
              <select
                value={sifat}
                onChange={(e) => setSifat(e.target.value as SifatSurat)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Sangat Penting">Sangat Penting</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg font-bold text-white bg-amber-700 hover:bg-amber-800 shadow-md transition-all flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Terbitkan Disposisi</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

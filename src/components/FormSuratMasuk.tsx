import React, { useState, useRef, useEffect } from 'react';
import { SuratMasuk, KodeKlasifikasi, SifatSurat } from '../types';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import { compressImageFile, compressDataUrl } from '../utils/imageUtils';
import { X, Upload, Save, Inbox, AlertCircle, Camera, FileText, Image as ImageIcon, Trash2, RefreshCw, Check, CameraOff } from 'lucide-react';

interface FormSuratMasukProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SuratMasuk, 'id' | 'disposisiList' | 'createdAt'>) => void;
  onUpdate?: (id: string, data: Partial<SuratMasuk>) => void;
  kodeKlasifikasiList: KodeKlasifikasi[];
  nextAgendaNo: string;
  editData?: SuratMasuk | null;
}

export const FormSuratMasuk: React.FC<FormSuratMasukProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  kodeKlasifikasiList,
  nextAgendaNo,
  editData,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const isEdit = Boolean(editData);

  const [noAgenda, setNoAgenda] = useState(nextAgendaNo);
  const [noSurat, setNoSurat] = useState('');
  const [tglSurat, setTglSurat] = useState(today);
  const [tglDiterima, setTglDiterima] = useState(today);
  const [pengirim, setPengirim] = useState('');
  const [perihal, setPerihal] = useState('');
  const [isiRingkasan, setIsiRingkasan] = useState('');
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState(kodeKlasifikasiList[0]?.kode || '000');
  const [sifatSurat, setSifatSurat] = useState<SifatSurat>('Biasa');

  // Lampiran & Kamera State
  const [lampiranName, setLampiranName] = useState<string>('');
  const [lampiranType, setLampiranType] = useState<string>('');
  const [lampiranPreviewUrl, setLampiranPreviewUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Stop camera when component unmounts or modal closes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setNoAgenda(editData.noAgenda || nextAgendaNo);
        setNoSurat(editData.noSurat || '');
        setTglSurat(editData.tglSurat || today);
        setTglDiterima(editData.tglDiterima || today);
        setPengirim(editData.pengirim || '');
        setPerihal(editData.perihal || '');
        setIsiRingkasan(editData.isiRingkasan || '');
        setKodeKlasifikasi(editData.kodeKlasifikasi || kodeKlasifikasiList[0]?.kode || '000');
        setSifatSurat(editData.sifatSurat || 'Biasa');
        setLampiranName(editData.lampiranName || '');
        setLampiranPreviewUrl(editData.fileUrl || null);
      } else {
        setNoAgenda(nextAgendaNo);
        setNoSurat('');
        setTglSurat(today);
        setTglDiterima(today);
        setPengirim('');
        setPerihal('');
        setIsiRingkasan('');
        if (kodeKlasifikasiList.length > 0) {
          setKodeKlasifikasi(kodeKlasifikasiList[0].kode);
        }
        setSifatSurat('Biasa');
        setLampiranName('');
        setLampiranPreviewUrl(null);
      }
    }
  }, [isOpen, editData, nextAgendaNo, kodeKlasifikasiList, today]);

  const handleCloseModal = () => {
    stopCamera();
    onClose();
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Kamera tidak didukung pada peramban/perangkat ini.');
        return;
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (err1) {
        // Fallback to simple video constraints for devices/laptops without ideal environment camera
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = mediaStream;
      setIsCameraActive(true);

      // Attach stream immediately if video element is already available
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((err) => console.warn('Video play warning:', err));
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan pada perangkat/browser Anda.');
      stopCamera();
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch((err) => console.warn('Video play warning:', err));
      }
    }
  }, [isCameraActive]);

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) {
      alert('Kamera sedang memuat gambar, mohon tunggu 1 detik dan coba lagi.');
      return;
    }
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = Math.min(video.videoWidth || 800, 800);
    canvas.height = Math.round((canvas.width * (video.videoHeight || 600)) / (video.videoWidth || 800));
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      const compressed = await compressDataUrl(dataUrl, 800, 800, 0.75);
      const fileName = `Foto_Surat_Masuk_${noAgenda.replace(/[/\\?%*:|"<>]/g, '_')}_${Date.now()}.jpg`;
      setLampiranPreviewUrl(compressed);
      setLampiranName(fileName);
      setLampiranType('JPG');
      stopCamera();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      setLampiranName(file.name);
      setLampiranType(ext);

      if (file.type.startsWith('image/')) {
        try {
          const compressed = await compressImageFile(file, 800, 800, 0.75);
          setLampiranPreviewUrl(compressed);
        } catch (err) {
          console.error('Failed compressing uploaded file:', err);
          const reader = new FileReader();
          reader.onload = (event) => {
            setLampiranPreviewUrl(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      } else {
        setLampiranPreviewUrl(null);
      }
    }
  };

  const handleRemoveLampiran = () => {
    setLampiranName('');
    setLampiranType('');
    setLampiranPreviewUrl(null);
    stopCamera();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noSurat.trim() || !pengirim.trim() || !perihal.trim()) {
      alert('Mohon lengkapi Nomor Surat, Pengirim, dan Perihal!');
      return;
    }

    if (isEdit && editData && onUpdate) {
      onUpdate(editData.id, {
        noAgenda,
        noSurat,
        tglSurat,
        tglDiterima,
        pengirim,
        perihal,
        isiRingkasan,
        kodeKlasifikasi,
        sifatSurat,
        lampiranName: lampiranName || editData.lampiranName || 'Dokumen_Surat.pdf',
        fileUrl: lampiranPreviewUrl || editData.fileUrl || undefined,
      });
    } else {
      onSubmit({
        noAgenda,
        noSurat,
        tglSurat,
        tglDiterima,
        pengirim,
        perihal,
        isiRingkasan,
        kodeKlasifikasi,
        sifatSurat,
        status: 'Menunggu',
        lampiranName: lampiranName || 'Dokumen_Surat.pdf',
        fileUrl: lampiranPreviewUrl || undefined,
      });
    }

    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Inbox className="w-5 h-5 text-yellow-400" />
            <div>
              <h2 className="text-lg font-bold">{isEdit ? 'Edit Data Surat Masuk' : 'Catat Agenda Surat Masuk Baru'}</h2>
              <p className="text-xs text-blue-200">{isEdit ? 'Perbarui informasi agenda registrasi surat masuk' : 'Registrasi tata naskah dinas masuk ke instansi'}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleCloseModal}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* No Agenda */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Agenda Registrasi *</label>
              <input
                type="text"
                value={noAgenda}
                onChange={(e) => setNoAgenda(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-blue-900 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Format: 00X/SM/2026</span>
            </div>

            {/* Kode Klasifikasi */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Klasifikasi Surat *</label>
              <select
                value={kodeKlasifikasi}
                onChange={(e) => setKodeKlasifikasi(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {kodeKlasifikasiList.map((k) => (
                  <option key={k.kode} value={k.kode}>
                    {k.kode} - {k.nama} ({k.kategori})
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* No Surat Asli */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Surat Pengirim *</label>
              <input
                type="text"
                value={noSurat}
                onChange={(e) => setNoSurat(e.target.value)}
                placeholder="Contoh: 005/182/BAPPEDA-SS"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sifat Surat */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sifat Surat *</label>
              <select
                value={sifatSurat}
                onChange={(e) => setSifatSurat(e.target.value as SifatSurat)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Sangat Penting">Sangat Penting</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tanggal Surat */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-slate-700">Tanggal Pada Surat *</label>
                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-mono">
                  {formatDateDDMMYYYY(tglSurat)}
                </span>
              </div>
              <input
                type="date"
                value={tglSurat}
                onChange={(e) => setTglSurat(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tanggal Diterima */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-slate-700">Tanggal Masuk / Diterima *</label>
                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-mono">
                  {formatDateDDMMYYYY(tglDiterima)}
                </span>
              </div>
              <input
                type="date"
                value={tglDiterima}
                onChange={(e) => setTglDiterima(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Instansi Pengirim */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Instansi / Lembaga Pengirim *</label>
            <input
              type="text"
              value={pengirim}
              onChange={(e) => setPengirim(e.target.value)}
              placeholder="Contoh: Badan Perencanaan Pembangunan Daerah Prov. Sulsel"
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Perihal */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Perihal Surat *</label>
            <input
              type="text"
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              placeholder="Contoh: Undangan Rapat Koordinasi SPBE 2026"
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Isi Ringkasan */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Ringkasan / Isi Singkat Surat</label>
            <textarea
              value={isiRingkasan}
              onChange={(e) => setIsiRingkasan(e.target.value)}
              rows={3}
              placeholder="Jelaskan secara singkat isi atau maksud dari surat masuk..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lampiran / Foto Kamera Surat Masuk */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">
                Unggah Lampiran / Foto Scan Surat Masuk
              </label>
              <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Format: JPG, PNG, PDF
              </span>
            </div>

            {/* Error Camera Alert */}
            {cameraError && (
              <div className="mb-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="flex-1">{cameraError}</span>
                <button
                  type="button"
                  onClick={() => setCameraError(null)}
                  className="text-rose-500 font-bold underline text-[10px]"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* If Camera is Active */}
            {isCameraActive ? (
              <div className="bg-slate-900 rounded-xl p-3 border border-slate-700 space-y-3">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                  <video
                    ref={(el) => {
                      videoRef.current = el;
                      if (el && streamRef.current && el.srcObject !== streamRef.current) {
                        el.srcObject = streamRef.current;
                        el.play().catch((err) => console.warn('Video play warning:', err));
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span>KAMERA AKTIF</span>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md transition-all flex items-center space-x-1.5 text-xs cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Jepret / Ambil Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg transition-all text-xs cursor-pointer flex items-center space-x-1"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>Tutup Kamera</span>
                  </button>
                </div>
              </div>
            ) : lampiranName ? (
              /* If File or Photo is Selected */
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  {lampiranPreviewUrl ? (
                    <img
                      src={lampiranPreviewUrl}
                      alt="Pratinjau Lampiran"
                      className="w-14 h-14 object-cover rounded-lg border border-blue-200 shadow-2xs shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 border border-blue-200">
                      <FileText className="w-6 h-6 text-blue-700" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.5 bg-blue-700 text-white font-bold text-[9px] rounded uppercase tracking-wider">
                        {lampiranType || 'FILE'}
                      </span>
                      <p className="font-bold text-slate-900 text-xs truncate max-w-[200px]">
                        {lampiranName}
                      </p>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-600 inline" />
                      <span>Berkas lampiran siap disimpan</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <label
                    htmlFor="file-input-reselect"
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-300 shadow-2xs transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                    <span>Ganti File</span>
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input-reselect"
                  />

                  <button
                    type="button"
                    onClick={handleRemoveLampiran}
                    className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Lampiran"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Initial Selector Option (File Upload OR Kamera) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Upload File Input */}
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-3 text-center bg-slate-50 hover:bg-blue-50/50 transition-all cursor-pointer group flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input-sm"
                  />
                  <label htmlFor="file-input-sm" className="cursor-pointer w-full">
                    <Upload className="w-6 h-6 mx-auto text-blue-600 group-hover:scale-110 transition-transform mb-1" />
                    <span className="font-bold text-slate-800 text-xs block">
                      Unggah File (JPG, PNG, PDF)
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Pilih dari galeri / dokumen komputer
                    </span>
                  </label>
                </div>

                {/* Camera Mode Input */}
                <button
                  type="button"
                  onClick={startCamera}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 text-center bg-slate-50 hover:bg-emerald-50/50 transition-all cursor-pointer group flex flex-col items-center justify-center"
                >
                  <Camera className="w-6 h-6 mx-auto text-emerald-600 group-hover:scale-110 transition-transform mb-1" />
                  <span className="font-bold text-slate-800 text-xs block">
                    Aktifkan Kamera (Laptop / HP)
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Ambil foto fisik surat secara langsung
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Agenda Surat Masuk'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Vehicle, 
  ServiceLog, 
  VitalComponentKey 
} from '../types';
import { 
  calculateComponentWear, 
  formatDateId 
} from '../utils/calculations';
import { 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  FileText, 
  CheckCircle2, 
  Wrench, 
  AlertCircle 
} from 'lucide-react';

interface InServiceModalProps {
  initialVehicle?: Vehicle | null;
  vehicles: Vehicle[];
  allLogs: ServiceLog[];
  customApiKey?: string;
  onClose: () => void;
  onSubmit: (data: {
    vehicleId: string;
    workshop: string;
    date: string;
    km: number;
    notes: string;
  }) => void;
  onPrintSpk?: (spkData: {
    vehicle: Vehicle;
    workshop: string;
    date: string;
    km: number;
    notes: string;
    aiDiagnosis?: string;
  }) => void;
}

const QUICK_COMPLAINTS = [
  'Servis Berkala Berkala & Ganti Oli Mesin',
  'Cek Bunyi Berdecit pada Kampas Rem',
  'AC Kurang Dingin & Ganti Filter Kabin',
  'Pengecekan Voltase Aki & Sistem Starter',
  'Getaran Roda Depan (Butuh Spooring & Balancing)',
  'Kuras Oli Transmisi Matic & Filter',
  'Penggantian Ban Roda yang Aus'
];

export const InServiceModal: React.FC<InServiceModalProps> = ({
  initialVehicle,
  vehicles,
  allLogs,
  customApiKey,
  onClose,
  onSubmit,
  onPrintSpk
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialVehicle ? initialVehicle.id : vehicles[0]?.id || ''
  );

  const activeCar = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  const [workshop, setWorkshop] = useState<string>(activeCar?.targetWorkshop || 'Nasmoco');
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [km, setKm] = useState<number>(activeCar?.currentKm || 0);
  const [notes, setNotes] = useState<string>('');
  
  const [isAskingAi, setIsAskingAi] = useState<boolean>(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<string>('');
  const [aiSource, setAiSource] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleVehicleChange = (newId: string) => {
    setSelectedVehicleId(newId);
    const car = vehicles.find(v => v.id === newId);
    if (car) {
      setKm(car.currentKm || 0);
      if (car.targetWorkshop) setWorkshop(car.targetWorkshop);
    }
  };

  const handleDiagnoseWithAi = async () => {
    if (!activeCar) return;

    setIsAskingAi(true);
    setErrorMsg('');
    setAiDiagnosis('');

    try {
      const vitalKeys: VitalComponentKey[] = [
        'filterOli', 'aki', 'oliMatic', 'ban', 'oliGardan', 'ac', 'kampasRem', 'busi'
      ];
      const wearStatus = vitalKeys.map(k => {
        const wear = calculateComponentWear(activeCar, k, allLogs);
        return `- ${wear.label}: Keausan ${wear.percent}% (${wear.text}), Terakhir: ${wear.lastRecord}`;
      }).join('\n');

      const vLogs = allLogs
        .filter(l => l.vehicleId === activeCar.id || l.vehicleId === activeCar.plate)
        .slice(0, 3)
        .map(l => `* Tgl ${formatDateId(l.date)} (${l.km.toLocaleString('id-ID')} KM @ ${l.workshop}): ${(l.items || []).map(i => i.name).join(', ')}`)
        .join('\n');

      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: activeCar,
          currentKm: km,
          lastServiceKm: activeCar.lastServiceKm || activeCar.currentKm,
          wearStatus,
          complaints: notes,
          recentLogs: vLogs,
          customApiKey
        })
      });

      const data = await response.json();
      if (data.diagnosis) {
        setAiDiagnosis(data.diagnosis);
        setAiSource(data.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'SOP Otomotif UNS');
        
        // Append brief AI recommendations to notes if notes is short
        if (!notes.includes('DIAGNOSA') && !notes.includes('SOP')) {
          setNotes(prev => {
            const separator = prev.trim() ? '\n\n' : '';
            return `${prev.trim()}${separator}[Rekomendasi Diagnostik]:\n${data.diagnosis.split('\n\n')[1] || data.diagnosis.slice(0, 200)}`;
          });
        }
      } else {
        throw new Error('Gagal mendapatkan respons diagnosa');
      }
    } catch (err: any) {
      console.warn('AI diagnose fetch error:', err);
      setErrorMsg('Gagal terhubung dengan server diagnosa. Menggunakan format standar.');
    } finally {
      setIsAskingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !workshop || !date || !notes.trim()) {
      alert('Harap lengkapi semua kolom pengajuan servis!');
      return;
    }

    onSubmit({
      vehicleId: selectedVehicleId,
      workshop,
      date,
      km: Number(km) || 0,
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Pengajuan Servis Armada
              </h3>
              <p className="text-[11px] text-slate-400">
                Formulir Surat Perintah Kerja (SPK) & Booking Bengkel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Vehicle and Workshop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Pilih Armada Kendaraan *
              </label>
              <select
                value={selectedVehicleId}
                onChange={e => handleVehicleChange(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold uppercase focus:border-sky-500 focus:outline-none"
              >
                {vehicles.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.plate} - {car.model} ({car.driver || 'Sopir'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Bengkel Mitra Tujuan *
              </label>
              <select
                value={workshop}
                onChange={e => setWorkshop(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-sky-500 focus:outline-none"
              >
                <option value="Nasmoco">Nasmoco Solo (Toyota Resmi)</option>
                <option value="Montecarlo">Montecarlo Solo</option>
                <option value="Zaini Auto">Zaini Auto Service</option>
                <option value="Rekanan">Bengkel Rekanan UNS</option>
                <option value="Bengkel Luar">Bengkel Luar Kota / Darurat</option>
              </select>
            </div>
          </div>

          {/* Odometer & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Odometer Saat Ini (KM) *
              </label>
              <input
                type="number"
                value={km}
                onChange={e => setKm(Number(e.target.value))}
                required
                min={0}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold text-sky-400 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Tanggal Pengajuan *
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Complaints & Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300">
                Keluhan Pengemudi / Rincian Pengerjaan *
              </label>
              <button
                type="button"
                onClick={handleDiagnoseWithAi}
                disabled={isAskingAi}
                className="px-2.5 py-1 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition disabled:opacity-50"
                title="Gunakan AI untuk menganalisa keausan dan menyusun instruksi bengkel"
              >
                {isAskingAi ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                    <span>Menganalisa...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>✨ Diagnosa AI Gemini</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              required
              rows={4}
              placeholder="Contoh: Ganti oli mesin rutin, cek rem depan bunyi berdecit saat deselerasi..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-sky-500 focus:outline-none font-mono text-xs leading-relaxed"
            />

            {/* Quick symptom chip buttons */}
            <div className="flex flex-wrap gap-1 pt-1">
              <span className="text-[10px] text-slate-500 font-bold self-center mr-1">
                Cepat:
              </span>
              {QUICK_COMPLAINTS.map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setNotes(prev => (prev ? `${prev}\n• ${chip}` : `• ${chip}`));
                  }}
                  className="px-2 py-0.5 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded text-[10px] transition"
                >
                  + {chip.split(' ')[0]} {chip.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* AI Diagnosis Result Box */}
          {aiDiagnosis && (
            <div className="p-3.5 bg-sky-950/60 border border-sky-800/90 rounded-xl space-y-2 text-xs animate-in fade-in">
              <div className="flex items-center justify-between text-sky-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hasil Diagnostik ({aiSource}):</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-[10px] font-mono">
                  Teranalisa
                </span>
              </div>
              <div className="bg-slate-950/90 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-200 whitespace-pre-line max-h-48 overflow-y-auto select-all leading-relaxed">
                {aiDiagnosis}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
            {onPrintSpk && activeCar && (
              <button
                type="button"
                onClick={() => {
                  onPrintSpk({
                    vehicle: activeCar,
                    workshop,
                    date,
                    km,
                    notes,
                    aiDiagnosis
                  });
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
                title="Cetak Surat Perintah Kerja (SPK) untuk Pengemudi & Bengkel"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Cetak Form SPK</span>
                <span className="sm:hidden">SPK</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition"
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Pengajuan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

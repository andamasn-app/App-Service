import React from 'react';
import { 
  ProcessedVehicle, 
  ServiceLog, 
  VitalComponentKey 
} from '../types';
import { 
  calculateComponentWear, 
  formatCurrency, 
  formatDateId 
} from '../utils/calculations';
import { 
  X, 
  Car, 
  User, 
  Gauge, 
  CalendarCheck, 
  Cpu, 
  MessageSquare, 
  Wrench, 
  Receipt,
  FileCheck,
  Send
} from 'lucide-react';

interface VehicleDrawerProps {
  car: ProcessedVehicle | null;
  allLogs: ServiceLog[];
  isAdmin: boolean;
  onClose: () => void;
  onOpenInService: (car: ProcessedVehicle) => void;
  onOpenQuickService: (car: ProcessedVehicle) => void;
  onOpenInvoice: (log: ServiceLog) => void;
  onQuickReplaceComponent?: (car: ProcessedVehicle, compKey: VitalComponentKey) => void;
}

const VITAL_KEYS: VitalComponentKey[] = [
  'filterOli',
  'aki',
  'oliMatic',
  'ban',
  'oliGardan',
  'ac',
  'kampasRem',
  'busi'
];

export const VehicleDrawer: React.FC<VehicleDrawerProps> = ({
  car,
  allLogs,
  isAdmin,
  onClose,
  onOpenInService,
  onOpenQuickService,
  onOpenInvoice,
  onQuickReplaceComponent
}) => {
  if (!car) return null;

  const vehicleLogs = allLogs.filter(
    l => l.vehicleId === car.id || l.vehicleId === car.plate
  );

  const totalMaintenanceCost = vehicleLogs.reduce(
    (sum, l) => sum + (Number(l.totalCost) || 0),
    0
  );

  const handleSendWaReminder = () => {
    const text = encodeURIComponent(
      `Halo Pak ${car.driver || 'Sopir'},\n\n` +
      `Pengingat Perawatan Kendaraan Dinas UNS:\n` +
      `🚗 *Armada*: ${car.plate} - ${car.model}\n` +
      `📍 *Odometer Saat Ini*: ${(car.currentKm || 0).toLocaleString('id-ID')} KM\n` +
      `⏱️ *Servis Rutin Berikutnya*: ${car._nextServiceDateStr} (Target: ${car._nextServiceKm.toLocaleString('id-ID')} KM)\n` +
      `📌 *Status*: ${car._routineStatus.label}\n\n` +
      `Mohon laporkan jika ada kendala atau jadwal bengkel. Terima kasih!\n- Bagian Pemeliharaan Armada UNS`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full overflow-y-auto p-4 sm:p-6 space-y-5 shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-sky-400 font-mono font-bold text-sm sm:text-base rounded-xl">
                {car.plate}
              </span>
              <div className="min-w-0">
                <h3 className="font-extrabold text-white text-sm sm:text-base truncate max-w-[220px] sm:max-w-xs">
                  {car.model}
                </h3>
                <span className="text-[10px] sm:text-[11px] text-slate-400">
                  {car.category} • {car.fuelType || 'Operasional'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                <User className="w-3 h-3 text-slate-400" />
                Pengemudi / Sopir
              </span>
              <p className="font-bold text-slate-200 truncate">{car.driver || 'Sopir UNS'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                <Gauge className="w-3 h-3 text-sky-400" />
                Odometer Terkini
              </span>
              <p className="font-mono font-bold text-emerald-400">
                {(car.currentKm || 0).toLocaleString('id-ID')} KM
              </p>
            </div>

            <div className="space-y-1 border-t border-slate-900 pt-2">
              <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                <CalendarCheck className="w-3 h-3 text-amber-400" />
                Servis Berikutnya
              </span>
              <p className="font-mono font-bold text-amber-300">{car._nextServiceDateStr}</p>
            </div>

            <div className="space-y-1 border-t border-slate-900 pt-2">
              <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                <Receipt className="w-3 h-3 text-emerald-400" />
                Total Biaya Tercatat
              </span>
              <p className="font-mono font-bold text-sky-400">
                {formatCurrency(totalMaintenanceCost, isAdmin)}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSendWaReminder}
              className="flex-1 py-2 px-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kirim Pengingat WA</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenInService(car);
              }}
              className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ajukan Servis</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenQuickService(car);
                }}
                className="py-2 px-3 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Input Nota</span>
              </button>
            )}
          </div>

          {/* Matriks 8 Komponen Vital */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Matriks Keausan 8 Komponen Vital</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-semibold">Berdasarkan KM & Waktu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VITAL_KEYS.map(key => {
                const wear = calculateComponentWear(car, key, allLogs);
                return (
                  <div
                    key={key}
                    className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-300">{wear.label}</span>
                      <span
                        className={`font-mono font-bold ${
                          wear.status === 'danger'
                            ? 'text-rose-400'
                            : wear.status === 'warning'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {wear.percent}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          wear.status === 'danger'
                            ? 'bg-rose-500'
                            : wear.status === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${wear.percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span className="truncate max-w-[170px]" title={wear.lastRecord}>
                        {wear.lastRecord}
                      </span>
                      {isAdmin && onQuickReplaceComponent && (
                        <button
                          type="button"
                          onClick={() => onQuickReplaceComponent(car, key)}
                          className="text-sky-400 hover:text-sky-300 font-bold underline"
                          title="Tandai telah diganti baru"
                        >
                          Ganti
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Riwayat Servis Khusus Mobil Ini */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-sky-400" />
              <span>Riwayat Servis ({vehicleLogs.length} Transaksi)</span>
            </h4>

            {vehicleLogs.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {vehicleLogs.map(log => (
                  <div
                    key={log.id}
                    className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5 text-xs"
                  >
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-sky-400 font-bold text-[11px]">
                        {formatDateId(log.date)} • {log.workshop}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {formatCurrency(log.totalCost, isAdmin)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Odometer: {(Number(log.km) || 0).toLocaleString('id-ID')} KM</span>
                      <button
                        onClick={() => onOpenInvoice(log)}
                        className="text-sky-400 hover:text-sky-300 underline font-semibold"
                      >
                        Faktur #{log.invoiceNo || log.id}
                      </button>
                    </div>

                    {log.items && log.items.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {log.items.map((it, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-300"
                          >
                            {it.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs text-center py-4 bg-slate-950 rounded-xl border border-slate-800/60">
                Belum ada riwayat servis untuk armada ini.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
          >
            Tutup Rincian
          </button>
        </div>
      </div>
    </div>
  );
};

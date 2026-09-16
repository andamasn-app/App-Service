import React from 'react';
import { 
  ProcessedVehicle 
} from '../types';
import { 
  Wrench, 
  CalendarCheck, 
  Gauge, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Plus, 
  Send, 
  FileText
} from 'lucide-react';

interface VehicleCardProps {
  car: ProcessedVehicle;
  isAdmin: boolean;
  onOpenDrawer: (car: ProcessedVehicle) => void;
  onOpenUpdateKm: (car: ProcessedVehicle) => void;
  onOpenInService: (car: ProcessedVehicle) => void;
  onOpenQuickService: (car: ProcessedVehicle) => void;
  onToggleHide: (car: ProcessedVehicle) => void;
  onEditVehicle: (car: ProcessedVehicle) => void;
  onDeleteVehicle: (car: ProcessedVehicle) => void;
  onCompleteInService: (car: ProcessedVehicle) => void;
  onCancelInService: (car: ProcessedVehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  car,
  isAdmin,
  onOpenDrawer,
  onOpenUpdateKm,
  onOpenInService,
  onOpenQuickService,
  onToggleHide,
  onEditVehicle,
  onDeleteVehicle,
  onCompleteInService,
  onCancelInService
}) => {
  return (
    <div
      onClick={() => onOpenDrawer(car)}
      className={`border rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 relative overflow-hidden transition-all duration-200 cursor-pointer shadow-md group ${
        car.isHidden
          ? 'bg-slate-900/60 border-purple-900/50 hover:border-purple-500'
          : 'bg-slate-900 border-slate-800 hover:border-sky-500/50'
      }`}
    >
      <div className="space-y-3">
        {/* Card Header: Plate & Status Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-block px-2.5 py-0.5 sm:py-1 bg-slate-950 border border-slate-800 rounded-lg text-sky-400 font-mono font-bold text-xs sm:text-sm tracking-wider uppercase">
                {car.plate}
              </span>
              {car.isHidden && (
                <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded-lg text-[10px] font-bold font-mono flex items-center gap-1">
                  <EyeOff className="w-3 h-3 text-purple-400" />
                  <span>HIDDEN</span>
                </span>
              )}
            </div>

            <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-sky-400 transition leading-snug truncate">
              {car.model}
            </h3>

            <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 pt-0.5 truncate">
              <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-sky-400 rounded text-[10px] font-bold shrink-0">
                {car.category || 'Operasional'}
              </span>
              <span className="truncate flex items-center gap-1">
                <User className="w-3 h-3 text-slate-500" />
                {car.driver || 'Sopir UNS'}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {car.isUnderService ? (
              <span className="px-2 py-0.5 sm:py-1 bg-sky-950 text-sky-400 border border-sky-800 rounded-full text-[9px] sm:text-[10px] font-extrabold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>PENGAJUAN</span>
              </span>
            ) : car._routineStatus.type === 'danger' ? (
              <span className="px-2 py-0.5 sm:py-1 bg-rose-950 text-rose-400 border border-rose-800 rounded-full text-[9px] sm:text-[10px] font-extrabold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>JATUH TEMPO</span>
              </span>
            ) : car._routineStatus.type === 'warning' ? (
              <span className="px-2 py-0.5 sm:py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded-full text-[9px] sm:text-[10px] font-extrabold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>SEGERA SERVIS</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 sm:py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-[9px] sm:text-[10px] font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>AMAN</span>
              </span>
            )}

            {isAdmin && (
              <div className="flex items-center gap-1 pt-1" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onToggleHide(car)}
                  className={`p-1 border rounded text-[9px] font-bold transition flex items-center shadow ${
                    car.isHidden
                      ? 'bg-purple-950/80 border-purple-800 text-purple-300 hover:bg-purple-900'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                  title={car.isHidden ? 'Tampilkan di Dashboard' : 'Sembunyikan'}
                >
                  {car.isHidden ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => onEditVehicle(car)}
                  className="p-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded text-[9px] font-bold transition shadow"
                  title="Edit Data Armada"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteVehicle(car)}
                  className="p-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded text-[9px] font-bold transition shadow"
                  title="Hapus Armada"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Quick Specs Box */}
        <div className="bg-slate-950 p-2.5 sm:p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Servis Berikutnya</span>
            </span>
            <span className="font-mono font-extrabold text-amber-300 text-xs">
              {car._nextServiceDateStr}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 border-t border-slate-900 pt-1 font-mono">
            <span>Target Odometer:</span>
            <span className="text-sky-400 font-bold">{car._nextServiceKm.toLocaleString('id-ID')} KM</span>
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 border-t border-slate-900 pt-1">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              <span>Odometer Terkini:</span>
            </span>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onOpenUpdateKm(car);
              }}
              className="text-sky-400 hover:text-sky-300 font-mono font-extrabold text-xs flex items-center gap-1 px-2 py-0.5 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800/80 rounded-lg transition"
              title="Klik untuk memperbarui Odometer"
            >
              <span>{(car.currentKm || 0).toLocaleString('id-ID')} KM</span>
              <Edit3 className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 border-t border-slate-900 pt-1">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Wrench className="w-3.5 h-3.5 text-sky-400" />
              <span>Bengkel Terakhir:</span>
            </span>
            <span className="text-slate-200 font-bold font-mono text-[11px] truncate max-w-[140px] text-right">
              {car._lastWorkshop}
            </span>
          </div>
        </div>

        {/* In-Service Banner or Service Schedule Bar */}
        {car.isUnderService ? (
          <div
            onClick={e => e.stopPropagation()}
            className="bg-sky-950/60 border border-sky-800 p-2.5 rounded-xl text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between text-sky-300 font-semibold">
              <span>Bengkel: {car.targetWorkshop || 'Nasmoco'}</span>
              <span className="text-[10px] text-slate-400">{car.inServiceDate}</span>
            </div>
            <p className="text-[11px] text-slate-300 italic truncate">
              "{car.inServiceNotes || 'Servis & inspeksi'}"
            </p>
            <div className="flex items-center gap-2 pt-1">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => onCompleteInService(car)}
                  className="flex-1 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-[11px] transition shadow flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Input Invoice Selesai</span>
                </button>
              ) : (
                <span className="flex-1 text-center py-1 text-[11px] text-amber-300 font-semibold bg-amber-950/40 rounded border border-amber-900/60">
                  Sedang dalam pengerjaan
                </span>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onCancelInService(car)}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px]"
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold gap-2">
              <span className="text-slate-400 truncate">
                Servis Rutin ({car._serviceIntervalKm.toLocaleString('id-ID')} KM)
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] shrink-0">
                <span
                  className={
                    car._remainingKm <= 0
                      ? 'text-rose-400 font-bold'
                      : car._remainingKm <= 1500
                      ? 'text-amber-400 font-bold'
                      : 'text-emerald-400'
                  }
                >
                  <Gauge className="w-2.5 h-2.5 inline mr-1" />
                  {car._remainingKmStr}
                </span>
                <span className="text-slate-600">•</span>
                <span
                  className={
                    car._daysRemaining !== null && car._daysRemaining <= 0
                      ? 'text-rose-400 font-bold'
                      : car._daysRemaining !== null && car._daysRemaining <= 30
                      ? 'text-amber-400 font-bold'
                      : 'text-emerald-400'
                  }
                >
                  <Clock className="w-2.5 h-2.5 inline mr-1" />
                  {car._daysRemainingStr}
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  car._routineStatus.type === 'danger'
                    ? 'bg-rose-500'
                    : car._routineStatus.type === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(car._routineStatus.percent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div
        className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onOpenDrawer(car)}
          className="flex-1 py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 min-w-[100px]"
        >
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span>Rincian</span>
        </button>

        {!car.isUnderService && (
          <button
            type="button"
            onClick={() => onOpenInService(car)}
            className="py-2 px-3 bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            title="Ajukan Servis Armada"
          >
            <Send className="w-3 h-3 text-sky-400" />
            <span>Ajukan</span>
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={() => onOpenQuickService(car)}
            className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow"
            title="Catat Nota / Transaksi Servis"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

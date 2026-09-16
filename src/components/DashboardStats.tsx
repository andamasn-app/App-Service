import React from 'react';
import { 
  Car, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Wrench, 
  EyeOff 
} from 'lucide-react';

interface DashboardStatsProps {
  totalCount: number;
  routineCount: number;
  urgentCount: number;
  expiredCount: number;
  inServiceCount: number;
  hiddenCount: number;
  currentStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalCount,
  routineCount,
  urgentCount,
  expiredCount,
  inServiceCount,
  hiddenCount,
  currentStatusFilter,
  onSelectStatusFilter
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
      {/* Total Armada */}
      <button
        type="button"
        onClick={() => onSelectStatusFilter('ALL')}
        className={`p-3 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
          currentStatusFilter === 'ALL'
            ? 'bg-slate-850 border-sky-500 shadow-md ring-1 ring-sky-500'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 shrink-0">
            <Car className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">Total Tampil</p>
            <p className="text-base sm:text-lg font-black text-white font-mono">
              {totalCount} <span className="text-[10px] text-slate-500 font-normal">Unit</span>
            </p>
          </div>
        </div>
      </button>

      {/* Kondisi Aman */}
      <button
        type="button"
        onClick={() => onSelectStatusFilter('AMAN')}
        className={`p-3 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
          currentStatusFilter === 'AMAN'
            ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">Kondisi Aman</p>
            <p className="text-base sm:text-lg font-black text-emerald-400 font-mono">
              {routineCount} <span className="text-[10px] text-slate-500 font-normal">Unit</span>
            </p>
          </div>
        </div>
      </button>

      {/* Segera Servis */}
      <button
        type="button"
        onClick={() => onSelectStatusFilter('SEGERA')}
        className={`p-3 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
          currentStatusFilter === 'SEGERA'
            ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">Segera Servis</p>
            <p className="text-base sm:text-lg font-black text-amber-400 font-mono">
              {urgentCount} <span className="text-[10px] text-slate-500 font-normal">Unit</span>
            </p>
          </div>
        </div>
      </button>

      {/* Jatuh Tempo */}
      <button
        type="button"
        onClick={() => onSelectStatusFilter('JATUH_TEMPO')}
        className={`p-3 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
          currentStatusFilter === 'JATUH_TEMPO'
            ? 'bg-rose-950/40 border-rose-500 shadow-md ring-1 ring-rose-500'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">Jatuh Tempo</p>
            <p className="text-base sm:text-lg font-black text-rose-400 font-mono">
              {expiredCount} <span className="text-[10px] text-slate-500 font-normal">Unit</span>
            </p>
          </div>
        </div>
      </button>

      {/* Sedang Servis */}
      <button
        type="button"
        onClick={() => onSelectStatusFilter('IN_SERVICE')}
        className={`p-3 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
          currentStatusFilter === 'IN_SERVICE'
            ? 'bg-sky-950/40 border-sky-500 shadow-md ring-1 ring-sky-500'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">Sedang Servis</p>
            <p className="text-base sm:text-lg font-black text-sky-400 font-mono">
              {inServiceCount} <span className="text-[10px] text-slate-500 font-normal">Unit</span>
            </p>
          </div>
        </div>
      </button>

      {/* Tersembunyi */}
      <button
        type="button"
        onClick={() => onSelectStatusFilter('HIDDEN')}
        className={`p-3 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
          currentStatusFilter === 'HIDDEN'
            ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
            <EyeOff className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">Tersembunyi</p>
            <p className="text-base sm:text-lg font-black text-purple-400 font-mono">
              {hiddenCount} <span className="text-[10px] text-slate-500 font-normal">Unit</span>
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};

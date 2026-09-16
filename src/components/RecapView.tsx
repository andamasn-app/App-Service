import React, { useState } from 'react';
import { ServiceLog, Vehicle } from '../types';
import { 
  formatCurrency, 
  formatDateId, 
  getMonthName, 
  parseDate 
} from '../utils/calculations';
import { 
  CalendarDays, 
  Wallet, 
  FileText, 
  TrendingUp, 
  Building2, 
  X,
  ChevronRight
} from 'lucide-react';

interface RecapViewProps {
  serviceLogs: ServiceLog[];
  vehicles: Vehicle[];
  isAdmin: boolean;
  onOpenInvoice: (log: ServiceLog) => void;
}

export const RecapView: React.FC<RecapViewProps> = ({
  serviceLogs,
  vehicles,
  isAdmin,
  onOpenInvoice
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [activeMonthModal, setActiveMonthModal] = useState<number | null>(null);

  // Filter logs for selected year
  const yearLogs = serviceLogs.filter(l => {
    const d = parseDate(l.date);
    return d && d.getFullYear() === selectedYear;
  });

  const totalAnnualCost = yearLogs.reduce((acc, curr) => acc + (Number(curr.totalCost) || 0), 0);
  const totalAnnualTransactions = yearLogs.length;
  const averageMonthlyCost = Math.round(totalAnnualCost / 12);

  // Workshop breakdown
  const workshopBreakdown: Record<string, { count: number; cost: number }> = {};
  yearLogs.forEach(l => {
    const ws = l.workshop || 'Lainnya';
    if (!workshopBreakdown[ws]) workshopBreakdown[ws] = { count: 0, cost: 0 };
    workshopBreakdown[ws].count++;
    workshopBreakdown[ws].cost += Number(l.totalCost) || 0;
  });

  const getMonthData = (m: number) => {
    const mLogs = yearLogs.filter(l => {
      const d = parseDate(l.date);
      return d && d.getMonth() + 1 === m;
    });
    const totalCost = mLogs.reduce((acc, curr) => acc + (Number(curr.totalCost) || 0), 0);
    return { logs: mLogs, totalCost, count: mLogs.length };
  };

  const activeMonthData = activeMonthModal !== null ? getMonthData(activeMonthModal) : null;

  return (
    <section className="space-y-4 sm:space-y-6">
      {/* Top Banner & Year Selector */}
      <div className="bg-slate-900 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div>
          <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-sky-400" />
            <span>Rekapitulasi Pemeliharaan Bulanan & Tahunan</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Laporan akumulasi pengeluaran anggaran bengkel dan riwayat perawatan armada UNS
          </p>
        </div>

        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-sky-500 focus:outline-none self-start md:self-auto"
        >
          <option value={2024}>Tahun Anggaran 2024</option>
          <option value={2025}>Tahun Anggaran 2025</option>
          <option value={2026}>Tahun Anggaran 2026</option>
          <option value={2027}>Tahun Anggaran 2027</option>
        </select>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-slate-900 p-4 rounded-xl sm:rounded-2xl border border-slate-800 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">
              Total Pengeluaran ({selectedYear})
            </p>
            <p className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
              {formatCurrency(totalAnnualCost, isAdmin)}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl sm:rounded-2xl border border-slate-800 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold border border-sky-500/20 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Total Transaksi Selesai</p>
            <p className="text-lg sm:text-xl font-black text-white font-mono">
              {totalAnnualTransactions} <span className="text-xs text-slate-500 font-normal">Nota</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl sm:rounded-2xl border border-slate-800 flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Rata-Rata Anggaran / Bulan</p>
            <p className="text-lg sm:text-xl font-black text-indigo-300 font-mono">
              {formatCurrency(averageMonthlyCost, isAdmin)}
            </p>
          </div>
        </div>
      </div>

      {/* Workshop Distribution Bar */}
      {Object.keys(workshopBreakdown).length > 0 && (
        <div className="bg-slate-900 p-4 rounded-xl sm:rounded-2xl border border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>Distribusi Anggaran per Bengkel Mitra ({selectedYear})</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            {Object.entries(workshopBreakdown).map(([ws, data]) => {
              const percent = totalAnnualCost > 0 ? Math.round((data.cost / totalAnnualCost) * 100) : 0;
              return (
                <div key={ws} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-300">{ws}</span>
                    <span className="font-mono text-emerald-400 font-semibold">{percent}%</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{data.count} Transaksi</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatCurrency(data.cost, isAdmin)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 12 Months Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
          const mData = getMonthData(m);
          return (
            <div
              key={m}
              onClick={() => setActiveMonthModal(m)}
              className="bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded-xl sm:rounded-2xl p-4 space-y-3 cursor-pointer transition shadow-md group"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-extrabold text-sm text-white group-hover:text-sky-400 transition">
                  {getMonthName(m)} {selectedYear}
                </span>
                <span className="text-[10px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full">
                  {mData.count} Transaksi
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-slate-400 font-medium">Total Pengeluaran Servis:</p>
                <p className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                  {formatCurrency(mData.totalCost, isAdmin)}
                </p>
              </div>

              <button
                type="button"
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Lihat Rincian Transaksi</span>
                <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Monthly Detail Modal */}
      {activeMonthModal !== null && activeMonthData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Rincian Servis {getMonthName(activeMonthModal)} {selectedYear}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Total: {formatCurrency(activeMonthData.totalCost, isAdmin)} ({activeMonthData.count} transaksi)
                </p>
              </div>
              <button
                onClick={() => setActiveMonthModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {activeMonthData.logs.length > 0 ? (
                activeMonthData.logs.map(log => {
                  const car = vehicles.find(v => v.id === log.vehicleId || v.plate === log.vehicleId);
                  return (
                    <div
                      key={log.id}
                      onClick={() => {
                        setActiveMonthModal(null);
                        onOpenInvoice(log);
                      }}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center hover:border-sky-500/50 cursor-pointer transition"
                    >
                      <div>
                        <span className="font-mono font-bold text-sky-400 text-sm block">
                          {car?.plate || log.vehicleId}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {log.workshop} • {formatDateId(log.date)} • {Number(log.km).toLocaleString('id-ID')} KM
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400 block text-xs">
                          {formatCurrency(log.totalCost, isAdmin)}
                        </span>
                        <span className="text-[10px] text-sky-400 underline">Faktur #{log.invoiceNo || log.id}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500 text-center py-6">
                  Tidak ada transaksi servis di bulan ini.
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveMonthModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

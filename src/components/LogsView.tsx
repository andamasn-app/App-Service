import React, { useState } from 'react';
import { 
  Vehicle, 
  ServiceLog 
} from '../types';
import { 
  formatDateId, 
  formatCurrency, 
  parseDate, 
  getMonthNameShort 
} from '../utils/calculations';
import { VITAL_COMPONENTS_SPECS } from '../data/initialData';
import * as XLSX from 'xlsx';
import { 
  Receipt, 
  Plus, 
  FileSpreadsheet, 
  FileUp, 
  Trash2, 
  Search, 
  FileText, 
  Edit3, 
  Filter, 
  Car 
} from 'lucide-react';

interface LogsViewProps {
  serviceLogs: ServiceLog[];
  vehicles: Vehicle[];
  isAdmin: boolean;
  onOpenNewService: () => void;
  onEditLog: (log: ServiceLog) => void;
  onDeleteLog: (logId: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onOpenInvoice: (log: ServiceLog) => void;
  onImportLogs: (imported: ServiceLog[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const LogsView: React.FC<LogsViewProps> = ({
  serviceLogs,
  vehicles,
  isAdmin,
  onOpenNewService,
  onEditLog,
  onDeleteLog,
  onBulkDelete,
  onOpenInvoice,
  onImportLogs,
  onShowToast
}) => {
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [workshopFilter, setWorkshopFilter] = useState<string>('ALL');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('DATE_DESC');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter logs
  const filteredLogs = serviceLogs.filter(log => {
    if (vehicleFilter !== 'ALL') {
      const car = vehicles.find(v => v.id === vehicleFilter);
      if (log.vehicleId !== vehicleFilter && (!car || log.vehicleId !== car.plate)) {
        return false;
      }
    }

    if (workshopFilter !== 'ALL' && log.workshop !== workshopFilter) {
      return false;
    }

    const d = parseDate(log.date);
    if (monthFilter !== 'ALL') {
      const m = Number(monthFilter);
      if (!d || d.getMonth() + 1 !== m) return false;
    }

    if (yearFilter !== 'ALL') {
      const y = Number(yearFilter);
      if (!d || d.getFullYear() !== y) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const car = vehicles.find(v => v.id === log.vehicleId || v.plate === log.vehicleId);
      const plate = car ? car.plate.toLowerCase() : log.vehicleId.toLowerCase();
      const model = car ? car.model.toLowerCase() : '';
      const invoice = (log.invoiceNo || '').toLowerCase();
      const ws = log.workshop.toLowerCase();
      const itemsStr = (log.items || []).map(i => i.name.toLowerCase()).join(' ');

      const matches = plate.includes(q) || model.includes(q) || invoice.includes(q) || ws.includes(q) || itemsStr.includes(q);
      if (!matches) return false;
    }

    return true;
  });

  // Sort logs
  filteredLogs.sort((a, b) => {
    const tA = parseDate(a.date)?.getTime() || 0;
    const tB = parseDate(b.date)?.getTime() || 0;

    if (sortOption === 'DATE_DESC') return tB - tA;
    if (sortOption === 'DATE_ASC') return tA - tB;
    if (sortOption === 'COST_DESC') return (Number(b.totalCost) || 0) - (Number(a.totalCost) || 0);
    if (sortOption === 'COST_ASC') return (Number(a.totalCost) || 0) - (Number(b.totalCost) || 0);
    if (sortOption === 'KM_DESC') return (Number(b.km) || 0) - (Number(a.km) || 0);
    return 0;
  });

  const totalFilteredCost = filteredLogs.reduce(
    (acc, curr) => acc + (Number(curr.totalCost) || 0),
    0
  );

  const isAllSelected = filteredLogs.length > 0 && filteredLogs.every(l => selectedIds.includes(l.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLogs.map(l => l.id));
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportExcel = () => {
    try {
      const exportData = filteredLogs.map(log => {
        const car = vehicles.find(v => v.id === log.vehicleId || v.plate === log.vehicleId);
        return {
          Tanggal: formatDateId(log.date),
          Plat: car?.plate || log.vehicleId,
          Model: car?.model || '-',
          Sopir: car?.driver || '-',
          Bengkel: log.workshop,
          'No Invoice': log.invoiceNo || '-',
          'Odometer KM': Number(log.km) || 0,
          'Total Biaya (Rp)': Number(log.totalCost) || 0,
          'Servis Rutin': log.isRoutine ? 'Ya' : 'Tidak',
          'Rincian Part': (log.items || []).map(i => `${i.name} (Rp ${i.cost.toLocaleString('id-ID')})`).join('; ')
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'RiwayatServis');
      XLSX.writeFile(wb, `AUTOMAN_UNS_Servis_${new Date().toISOString().substring(0, 10)}.xlsx`);
      onShowToast('File Excel berhasil diekspor!', 'success');
    } catch (err: any) {
      onShowToast('Gagal mengekspor data Excel.', 'error');
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        let count = 0;
        const newLogs: ServiceLog[] = [];

        rows.forEach((row, idx) => {
          const plate = row['Plat'] || row['plat'] || row['Kendaraan'];
          const totalCost = Number(row['Total Biaya (Rp)'] || row['TotalBiaya'] || row['biaya'] || 0);

          if (plate && totalCost > 0) {
            let dateStr = new Date().toISOString().substring(0, 10);
            const rawDate = row['Tanggal'] || row['tanggal'];
            if (rawDate) {
              const parsed = parseDate(String(rawDate));
              if (parsed) dateStr = parsed.toISOString().substring(0, 10);
            }

            const targetCar = vehicles.find(v => v.plate.toUpperCase().trim() === String(plate).toUpperCase().trim());

            newLogs.push({
              id: `LOG-IMP-${Date.now()}-${idx}`,
              vehicleId: targetCar ? targetCar.id : String(plate).toUpperCase().trim(),
              workshop: row['Bengkel'] || row['bengkel'] || 'Nasmoco',
              date: dateStr,
              km: Number(row['Odometer KM'] || row['KM'] || row['km'] || 0),
              invoiceNo: row['No Invoice'] || row['Invoice'] || `IMP-${Math.floor(1000 + Math.random() * 9000)}`,
              isRoutine: true,
              items: [{ name: row['Rincian Part'] || 'Suku Cadang & Perawatan', cost: totalCost }],
              replacedComponents: ['filterOli'],
              totalCost
            });
            count++;
          }
        });

        if (count > 0) {
          onImportLogs(newLogs);
          onShowToast(`Berhasil mengimpor ${count} data transaksi servis!`, 'success');
        } else {
          onShowToast('Tidak ada data valid yang ditemukan pada file Excel.', 'error');
        }
      } catch (err: any) {
        onShowToast('Gagal memproses file Excel: ' + err.message, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const getVehicleInfo = (vId: string) => {
    const car = vehicles.find(v => v.id === vId || v.plate === vId);
    return {
      plate: car?.plate || vId,
      model: car?.model || '-'
    };
  };

  return (
    <section className="space-y-4 sm:space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="bg-slate-900 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 space-y-3.5 shadow-md">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-white">
                Riwayat Servis Armada
              </h2>
              <p className="text-[11px] text-slate-400">
                Catatan invoice, faktur berkala, dan pergantian suku cadang
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-stretch sm:justify-end">
            {selectedIds.length > 0 && isAdmin && (
              <button
                onClick={() => {
                  if (confirm(`Hapus ${selectedIds.length} catatan servis yang dicentang?`)) {
                    onBulkDelete(selectedIds);
                    setSelectedIds([]);
                  }
                }}
                className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Tercentang ({selectedIds.length})</span>
              </button>
            )}

            <label className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow">
              <FileUp className="w-3.5 h-3.5" />
              <span>Import XLSX</span>
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportExcel} className="hidden" />
            </label>

            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export XLSX</span>
            </button>

            {isAdmin && (
              <button
                onClick={onOpenNewService}
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Log</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari Plat, Part, Bengkel..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Vehicle Select */}
          <div>
            <select
              value={vehicleFilter}
              onChange={e => setVehicleFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:border-sky-500 focus:outline-none"
            >
              <option value="ALL">Semua Armada ({vehicles.length})</option>
              {vehicles.map(car => (
                <option key={car.id} value={car.id}>
                  {car.plate} - {car.model}
                </option>
              ))}
            </select>
          </div>

          {/* Workshop Select */}
          <div>
            <select
              value={workshopFilter}
              onChange={e => setWorkshopFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:border-sky-500 focus:outline-none"
            >
              <option value="ALL">Semua Bengkel</option>
              <option value="Nasmoco">Nasmoco Solo</option>
              <option value="Montecarlo">Montecarlo</option>
              <option value="Zaini Auto">Zaini Auto</option>
              <option value="Rekanan">Rekanan UNS</option>
              <option value="Bengkel Luar">Bengkel Luar</option>
            </select>
          </div>

          {/* Month & Year Select */}
          <div className="grid grid-cols-2 gap-1">
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:border-sky-500 focus:outline-none"
            >
              <option value="ALL">Semua Bln</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {getMonthNameShort(m)}
                </option>
              ))}
            </select>

            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:border-sky-500 focus:outline-none"
            >
              <option value="ALL">Semua Thn</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white font-semibold focus:border-sky-500 focus:outline-none"
            >
              <option value="DATE_DESC">📅 Tanggal Terbaru</option>
              <option value="DATE_ASC">📅 Tanggal Terlama</option>
              <option value="COST_DESC">💰 Biaya Tertinggi</option>
              <option value="COST_ASC">💰 Biaya Terendah</option>
              <option value="KM_DESC">🚘 Odometer Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Subtotal Banner */}
        <div className="bg-slate-950 p-2.5 sm:p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-bold">Menampilkan:</span>
            <span className="px-2 py-0.5 bg-sky-950 text-sky-400 rounded-lg font-mono font-bold">
              {filteredLogs.length} transaksi
            </span>
            {selectedIds.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded-lg font-mono font-bold">
                {selectedIds.length} terpilih
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">Total Biaya Filtered:</span>
            <span className="text-emerald-400 font-mono font-black text-sm sm:text-base">
              {formatCurrency(totalFilteredCost, isAdmin)}
            </span>
          </div>
        </div>
      </div>

      {/* MOBILE CARDS VIEW */}
      <div className="block md:hidden space-y-3">
        {filteredLogs.length > 0 ? (
          filteredLogs.map(log => {
            const carInfo = getVehicleInfo(log.vehicleId);
            return (
              <div
                key={log.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    {isAdmin && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(log.id)}
                        onChange={() => toggleSelectId(log.id)}
                        className="w-4 h-4 accent-sky-500 rounded cursor-pointer shrink-0"
                      />
                    )}
                    <div>
                      <span className="font-bold font-mono text-sky-400 text-sm tracking-wide">
                        {carInfo.plate}
                      </span>
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {carInfo.model}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-semibold text-slate-300 block">
                      {formatDateId(log.date)}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border mt-0.5 ${
                        log.isRoutine
                          ? 'bg-emerald-950/90 text-emerald-400 border-emerald-800'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {log.isRoutine ? 'Servis Rutin' : 'Insidental'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      Bengkel Pelaksana
                    </span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {log.workshop}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      No. Faktur
                    </span>
                    <span className="font-mono text-slate-300 truncate block">
                      {log.invoiceNo || '-'}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">
                      Odometer Pengerjaan
                    </span>
                    <span className="font-mono font-bold text-sky-400 text-xs">
                      {Number(log.km).toLocaleString('id-ID')} KM
                    </span>
                  </div>
                </div>

                {/* Items and Replaced components */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Rincian Suku Cadang:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(log.replacedComponents || []).map(k => (
                      <span
                        key={k}
                        className="px-1.5 py-0.5 bg-sky-950/80 text-sky-300 border border-sky-800 rounded text-[9px] font-bold"
                      >
                        ✓ {VITAL_COMPONENTS_SPECS[k]?.shortName || k}
                      </span>
                    ))}
                    {(log.items || []).map((it, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px] text-slate-300"
                      >
                        {it.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cost and Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">
                      Total Biaya:
                    </span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      {formatCurrency(log.totalCost, isAdmin)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenInvoice(log)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl font-bold text-xs flex items-center gap-1 shadow"
                      title="Lihat Faktur Digital"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Faktur</span>
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEditLog(log)}
                          className="p-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded-xl font-bold transition shadow"
                          title="Edit Catatan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Hapus catatan servis ini?')) {
                              onDeleteLog(log.id);
                            }
                          }}
                          className="p-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl font-bold transition shadow"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs font-medium">
            Tidak ada catatan riwayat servis yang sesuai dengan filter.
          </div>
        )}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800 text-[10px]">
              <tr>
                {isAdmin && (
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                    />
                  </th>
                )}
                <th className="p-3">Tanggal</th>
                <th className="p-3">Armada / Plat</th>
                <th className="p-3">Bengkel Mitra</th>
                <th className="p-3">No. Invoice</th>
                <th className="p-3">Odometer</th>
                <th className="p-3">Rincian Part & Komponen</th>
                <th className="p-3 text-right">Total Biaya</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => {
                  const carInfo = getVehicleInfo(log.vehicleId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      {isAdmin && (
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(log.id)}
                            onChange={() => toggleSelectId(log.id)}
                            className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="p-3 whitespace-nowrap font-mono text-slate-200">
                        {formatDateId(log.date)}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-bold font-mono text-sky-400 block">
                          {carInfo.plate}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {carInfo.model}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap font-semibold text-slate-200">
                        {log.workshop}
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-slate-300">
                        {log.invoiceNo || '-'}
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-sky-400 font-bold">
                        {Number(log.km).toLocaleString('id-ID')} KM
                      </td>
                      <td className="p-3 max-w-xs text-slate-300">
                        <div className="flex flex-wrap gap-1 items-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              log.isRoutine
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            {log.isRoutine ? 'Servis Rutin' : 'Insidental'}
                          </span>

                          {(log.replacedComponents || []).map(k => (
                            <span
                              key={k}
                              className="px-1.5 py-0.5 bg-sky-950/80 text-sky-300 border border-sky-800 rounded text-[9px] font-bold"
                            >
                              ✓ {VITAL_COMPONENTS_SPECS[k]?.shortName || k}
                            </span>
                          ))}

                          {(log.items || []).map((it, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px]"
                            >
                              <span>{it.name}</span>
                              {it.cost > 0 && isAdmin && (
                                <span className="text-emerald-400 font-mono text-[9px]">
                                  ({formatCurrency(it.cost, true)})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap font-bold text-emerald-400 font-mono text-right">
                        {formatCurrency(log.totalCost, isAdmin)}
                      </td>
                      <td className="p-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenInvoice(log)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition"
                            title="Faktur Digital"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => onEditLog(log)}
                                className="p-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded-lg transition"
                                title="Edit Log"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Hapus catatan servis ini?')) {
                                    onDeleteLog(log.id);
                                  }
                                }}
                                className="p-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg transition"
                                title="Hapus Log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="p-8 text-center text-slate-500 font-medium">
                    Tidak ada catatan riwayat servis yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

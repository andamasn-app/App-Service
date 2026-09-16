import React, { useState } from 'react';
import { Vehicle, ServiceLog } from '../types';
import { formatDateId, formatCurrency } from '../utils/calculations';
import { 
  Database, 
  X, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  FileJson, 
  Car, 
  Receipt 
} from 'lucide-react';

interface MasterDataModalProps {
  vehicles: Vehicle[];
  serviceLogs: ServiceLog[];
  onClose: () => void;
  onDeleteVehicle: (carId: string) => void;
  onDeleteLog: (logId: string) => void;
  onResetData: () => void;
  onRestoreBackup: (backup: { vehicles: Vehicle[]; serviceLogs: ServiceLog[] }) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const MasterDataModal: React.FC<MasterDataModalProps> = ({
  vehicles,
  serviceLogs,
  onClose,
  onDeleteVehicle,
  onDeleteLog,
  onResetData,
  onRestoreBackup,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'logs' | 'backup'>('vehicles');

  const handleExportJson = () => {
    try {
      const data = {
        app: 'AUTOMAN UNS',
        exportedAt: new Date().toISOString(),
        vehicles,
        serviceLogs
      };

      const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const anchor = document.createElement('a');
      anchor.setAttribute('href', jsonStr);
      anchor.setAttribute('download', `AUTOMAN_UNS_Backup_${new Date().toISOString().substring(0, 10)}.json`);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      onShowToast('Berkas cadangan JSON berhasil diunduh!', 'success');
    } catch (err: any) {
      onShowToast('Gagal mengekspor file cadangan.', 'error');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json || (!Array.isArray(json.vehicles) && !Array.isArray(json.serviceLogs))) {
          throw new Error('Struktur berkas cadangan JSON tidak valid.');
        }

        onRestoreBackup({
          vehicles: json.vehicles || [],
          serviceLogs: json.serviceLogs || []
        });
        onShowToast('Data cadangan berhasil dipulihkan!', 'success');
      } catch (err: any) {
        onShowToast('Gagal memulihkan cadangan: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Kelola Master Data System
              </h3>
              <p className="text-[11px] text-slate-400">
                Pembersihan data, basis inventaris, serta pencadangan berkas offline
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

        {/* Tab Headers */}
        <div className="flex border-b border-slate-800 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`pb-2 px-2.5 transition flex items-center gap-1.5 ${
              activeTab === 'vehicles'
                ? 'border-b-2 border-sky-500 text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Master Armada ({vehicles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2 px-2.5 transition flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-b-2 border-sky-500 text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Master Log Servis ({serviceLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2 px-2.5 transition flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-b-2 border-sky-500 text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Cadangan & Pemulihan</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="text-xs">
          {activeTab === 'vehicles' && (
            <div className="space-y-2">
              <p className="text-slate-400 text-[11px]">
                Daftar seluruh kendaraan yang terdaftar di basis data:
              </p>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/80 bg-slate-950 rounded-xl p-2 border border-slate-800">
                {vehicles.map(car => (
                  <div key={car.id} className="p-2 flex items-center justify-between hover:bg-slate-900 transition">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sky-400">{car.plate}</span>
                      <span className="text-slate-300 font-medium truncate max-w-[200px]">{car.model}</span>
                      <span className="text-[10px] text-slate-500">({car.driver || 'Sopir'})</span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus armada ${car.plate}? Semua jadwal terkait akan dihapus.`)) {
                          onDeleteVehicle(car.id);
                        }
                      }}
                      className="text-rose-400 hover:text-rose-300 p-1.5 transition"
                      title="Hapus Kendaraan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2">
              <p className="text-slate-400 text-[11px]">
                Daftar riwayat transaksi servis yang tersimpan:
              </p>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/80 bg-slate-950 rounded-xl p-2 border border-slate-800">
                {serviceLogs.map(log => {
                  const car = vehicles.find(v => v.id === log.vehicleId || v.plate === log.vehicleId);
                  return (
                    <div key={log.id} className="p-2 flex items-center justify-between hover:bg-slate-900 transition">
                      <div>
                        <span className="font-mono font-bold text-sky-400">{car?.plate || log.vehicleId}</span>
                        <span className="text-slate-400 text-[11px] ml-2 font-mono">
                          {formatDateId(log.date)} • {log.workshop}
                        </span>
                        <span className="text-emerald-400 font-mono font-bold ml-2">
                          {formatCurrency(log.totalCost, true)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Hapus transaksi servis ini?')) {
                            onDeleteLog(log.id);
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1.5 transition"
                        title="Hapus Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-3.5">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <FileJson className="w-4 h-4" />
                  <span>Cadangan & Pemulihan Berkas JSON</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Unduh seluruh database (armada, riwayat servis, komponen) dalam format file JSON untuk disimpan secara aman di komputer Anda, atau pulihkan kapan saja.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Cadangan JSON</span>
                  </button>

                  <label className="px-3.5 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pulihkan Berkas JSON</span>
                    <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-rose-900/50 space-y-2">
                <span className="font-bold text-rose-300 block">
                  Muat Ulang Data Uji Coba Default
                </span>
                <p className="text-[11px] text-slate-400">
                  Kembalikan armada contoh resmi UNS (Innova Zenix Hybrid, HiAce Commuter, Isuzu Panther, Avanza, dll.) jika data Anda kosong.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Kembalikan data ke pengaturan armada default contoh UNS?')) {
                      onResetData();
                      onShowToast('Data berhasil di-reset ke armada contoh UNS!', 'success');
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Data Awal UNS</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

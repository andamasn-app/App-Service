import React, { useState } from 'react';
import { 
  Vehicle, 
  ServiceLog, 
  VitalComponentKey, 
  ServiceItem 
} from '../types';
import { 
  QUICK_SPAREPARTS, 
  VITAL_COMPONENTS_SPECS 
} from '../data/initialData';
import { 
  formatCurrency 
} from '../utils/calculations';
import { 
  X, 
  Receipt, 
  Plus, 
  Trash2, 
  Save, 
  CheckSquare 
} from 'lucide-react';

interface ServiceLogModalProps {
  editingLog?: ServiceLog | null;
  initialVehicle?: Vehicle | null;
  vehicles: Vehicle[];
  onClose: () => void;
  onSave: (logData: Omit<ServiceLog, 'id'>, existingId?: string) => void;
}

export const ServiceLogModal: React.FC<ServiceLogModalProps> = ({
  editingLog,
  initialVehicle,
  vehicles,
  onClose,
  onSave
}) => {
  const [vehicleId, setVehicleId] = useState<string>(
    editingLog?.vehicleId || initialVehicle?.id || vehicles[0]?.id || ''
  );
  const [workshop, setWorkshop] = useState<string>(editingLog?.workshop || 'Nasmoco');
  const [date, setDate] = useState<string>(
    editingLog?.date || new Date().toISOString().substring(0, 10)
  );
  const [km, setKm] = useState<number>(
    editingLog?.km ?? (initialVehicle?.currentKm || 0)
  );
  const [invoiceNo, setInvoiceNo] = useState<string>(
    editingLog?.invoiceNo || `INV-UNS-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [isRoutine, setIsRoutine] = useState<boolean>(editingLog?.isRoutine ?? true);
  
  const [replacedComponents, setReplacedComponents] = useState<VitalComponentKey[]>(
    editingLog?.replacedComponents || ['filterOli']
  );

  const [items, setItems] = useState<ServiceItem[]>(
    editingLog?.items || [
      { name: 'Servis Berkala & Ganti Oli Mesin', cost: 450000 }
    ]
  );

  const handleToggleComponent = (key: VitalComponentKey) => {
    setReplacedComponents(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleAddItem = () => {
    setItems(prev => [...prev, { name: '', cost: 0 }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof ServiceItem, value: any) => {
    setItems(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleAddQuickPart = (sp: { name: string; cost: number; compKey?: string }) => {
    setItems(prev => [...prev, { name: sp.name, cost: sp.cost }]);
    if (sp.compKey && !replacedComponents.includes(sp.compKey as VitalComponentKey)) {
      setReplacedComponents(prev => [...prev, sp.compKey as VitalComponentKey]);
    }
  };

  const totalCost = items.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !workshop || !date) {
      alert('Lengkapi informasi armada, bengkel, dan tanggal!');
      return;
    }

    if (items.length === 0) {
      alert('Tambahkan minimal 1 item suku cadang atau jasa!');
      return;
    }

    onSave(
      {
        vehicleId,
        workshop,
        date,
        km: Number(km) || 0,
        invoiceNo: invoiceNo.trim(),
        isRoutine,
        items: items.map(it => ({ name: it.name.trim(), cost: Number(it.cost) || 0 })),
        replacedComponents,
        totalCost
      },
      editingLog ? editingLog.id : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {editingLog ? 'Edit Catatan Servis' : 'Input Nota / Transaksi Servis'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Pencatatan rincian biaya, suku cadang, dan pembaruan riwayat armada
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
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Pilih Armada Kendaraan *
              </label>
              <select
                value={vehicleId}
                onChange={e => {
                  setVehicleId(e.target.value);
                  const car = vehicles.find(v => v.id === e.target.value);
                  if (car && !editingLog) {
                    setKm(car.currentKm || 0);
                  }
                }}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold uppercase focus:border-sky-500 focus:outline-none"
              >
                {vehicles.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.plate} - {car.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Bengkel Pelaksana *
              </label>
              <select
                value={workshop}
                onChange={e => setWorkshop(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-sky-500 focus:outline-none"
              >
                <option value="Nasmoco">Nasmoco (Toyota Resmi)</option>
                <option value="Montecarlo">Montecarlo Solo</option>
                <option value="Zaini Auto">Zaini Auto Service</option>
                <option value="Rekanan">Bengkel Rekanan UNS</option>
                <option value="Bengkel Luar">Bengkel Luar Kota / Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Tanggal Servis *
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Odometer Servis (KM) *
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
                No. Invoice / Faktur
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={e => setInvoiceNo(e.target.value)}
                placeholder="Contoh: INV-NSM-9021"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Kategori Jenis Servis *
              </label>
              <select
                value={isRoutine ? 'true' : 'false'}
                onChange={e => setIsRoutine(e.target.value === 'true')}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-sky-500 focus:outline-none"
              >
                <option value="true">🟢 Servis Berkala Rutin (Reset Status Jadwal)</option>
                <option value="false">🔵 Perbaikan Non-Rutin / Insidental</option>
              </select>
            </div>
          </div>

          {/* 8 Vital Components Checkbox Matrix */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Penggantian / Servis Komponen Vital:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(VITAL_COMPONENTS_SPECS) as VitalComponentKey[]).map(key => {
                const checked = replacedComponents.includes(key);
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                      checked
                        ? 'bg-sky-950/80 border-sky-700 text-sky-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleComponent(key)}
                      className="w-3.5 h-3.5 accent-sky-500 rounded"
                    />
                    <span className="text-[11px] truncate">
                      {VITAL_COMPONENTS_SPECS[key].shortName}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Itemized Parts & Costs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300">
                Rincian Suku Cadang & Biaya Pengerjaan *
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={it.name}
                    onChange={e => handleItemChange(idx, 'name', e.target.value)}
                    required
                    placeholder="Nama part / jenis jasa pengerjaan..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-sky-500 focus:outline-none"
                  />
                  <div className="relative w-36 sm:w-44">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-[11px]">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={it.cost}
                      onChange={e => handleItemChange(idx, 'cost', Number(e.target.value))}
                      required
                      min={0}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pl-8 text-emerald-400 font-mono font-bold text-right focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition"
                      title="Hapus Baris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Spareparts Buttons */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-slate-500 font-bold block">
                Rekomendasi Cepat:
              </span>
              <div className="flex flex-wrap gap-1">
                {QUICK_SPAREPARTS.slice(0, 6).map((sp, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddQuickPart(sp)}
                    className="px-2 py-0.5 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded text-[10px] transition"
                  >
                    + {sp.name.split(' ')[0]} {sp.name.split(' ')[1]} ({formatCurrency(sp.cost, true)})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subtotal Box */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="font-extrabold text-slate-300">
              Total Biaya Faktur:
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-emerald-400">
              {formatCurrency(totalCost, true)}
            </span>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingLog ? 'Perbarui Catatan' : 'Simpan Transaksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

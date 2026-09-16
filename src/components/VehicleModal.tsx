import React, { useState } from 'react';
import { Vehicle, VehicleCategory } from '../types';
import { Car, X, Save } from 'lucide-react';

interface VehicleModalProps {
  editingVehicle?: Vehicle | null;
  onClose: () => void;
  onSave: (vehicleData: Vehicle) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  editingVehicle,
  onClose,
  onSave
}) => {
  const [plate, setPlate] = useState<string>(editingVehicle?.plate || '');
  const [model, setModel] = useState<string>(editingVehicle?.model || '');
  const [driver, setDriver] = useState<string>(editingVehicle?.driver || '');
  const [category, setCategory] = useState<VehicleCategory>(
    editingVehicle?.category || 'Operasional'
  );
  const [currentKm, setCurrentKm] = useState<number>(editingVehicle?.currentKm || 0);
  const [lastServiceKm, setLastServiceKm] = useState<number>(
    editingVehicle?.lastServiceKm || 0
  );
  const [lastServiceDate, setLastServiceDate] = useState<string>(
    editingVehicle?.lastServiceDate || ''
  );
  const [fuelType, setFuelType] = useState<'Bensin' | 'Diesel' | 'Hybrid'>(
    editingVehicle?.fuelType || 'Bensin'
  );
  const [isHidden, setIsHidden] = useState<boolean>(editingVehicle?.isHidden || false);
  const [notes, setNotes] = useState<string>(editingVehicle?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !model.trim()) {
      alert('Plat Nomor dan Model Kendaraan wajib diisi!');
      return;
    }

    const formattedPlate = plate.toUpperCase().trim();
    const id = editingVehicle ? editingVehicle.id : formattedPlate.replace(/\s+/g, '-');

    onSave({
      id,
      plate: formattedPlate,
      model: model.trim(),
      driver: driver.trim(),
      category,
      currentKm: Number(currentKm) || 0,
      lastServiceKm: Number(lastServiceKm) || 0,
      lastServiceDate: lastServiceDate || '',
      fuelType,
      isUnderService: editingVehicle?.isUnderService || false,
      targetWorkshop: editingVehicle?.targetWorkshop,
      inServiceDate: editingVehicle?.inServiceDate,
      inServiceNotes: editingVehicle?.inServiceNotes,
      isHidden,
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {editingVehicle ? 'Edit Data Armada' : 'Tambah Armada Baru'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Pendaftaran & konfigurasi data inventaris kendaraan UNS
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Plat Nomor Kendaraan *
            </label>
            <input
              type="text"
              value={plate}
              onChange={e => setPlate(e.target.value.toUpperCase())}
              required
              placeholder="Contoh: AD 1001 ZA"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white uppercase font-mono font-bold focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Model / Tipe Kendaraan *
            </label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              required
              placeholder="Contoh: Toyota Innova Zenix 2.0 HV"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Kategori Armada *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as VehicleCategory)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="Pimpinan">Pimpinan</option>
                <option value="Operasional">Operasional</option>
                <option value="Fakultas">Fakultas</option>
                <option value="Unit">Unit</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Tipe Bahan Bakar
              </label>
              <select
                value={fuelType}
                onChange={e => setFuelType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="Bensin">Bensin</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Pengemudi / Penanggung Jawab Sopir
            </label>
            <input
              type="text"
              value={driver}
              onChange={e => setDriver(e.target.value)}
              placeholder="Nama sopir UNS..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Odometer Terkini (KM) *
              </label>
              <input
                type="number"
                value={currentKm}
                onChange={e => setCurrentKm(Number(e.target.value))}
                required
                min={0}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold text-sky-400 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                KM Servis Terakhir
              </label>
              <input
                type="number"
                value={lastServiceKm}
                onChange={e => setLastServiceKm(Number(e.target.value))}
                min={0}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Tanggal Servis Terakhir
            </label>
            <input
              type="date"
              value={lastServiceDate}
              onChange={e => setLastServiceDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Catatan Penggunaan / Unit Kerja
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: Mobil Dinas Rektorat / Bagian Keuangan"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isHiddenCheck"
              checked={isHidden}
              onChange={e => setIsHidden(e.target.checked)}
              className="w-4 h-4 accent-purple-500 rounded"
            />
            <label htmlFor="isHiddenCheck" className="text-slate-300 font-bold cursor-pointer">
              Sembunyikan dari Dashboard Publik (Hidden)
            </label>
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
              <span>Simpan Data Armada</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Vehicle } from '../types';
import { Gauge, X, Save, AlertCircle } from 'lucide-react';

interface UpdateKmModalProps {
  initialVehicle?: Vehicle | null;
  vehicles: Vehicle[];
  onClose: () => void;
  onSave: (vehicleId: string, newKm: number) => void;
}

export const UpdateKmModal: React.FC<UpdateKmModalProps> = ({
  initialVehicle,
  vehicles,
  onClose,
  onSave
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialVehicle ? initialVehicle.id : vehicles[0]?.id || ''
  );

  const activeCar = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  const [newKm, setNewKm] = useState<number>(activeCar ? (activeCar.currentKm || 0) : 0);
  const [warning, setWarning] = useState<string>('');

  const handleVehicleChange = (id: string) => {
    setSelectedVehicleId(id);
    const car = vehicles.find(v => v.id === id);
    if (car) {
      setNewKm(car.currentKm || 0);
      setWarning('');
    }
  };

  const handleAddKm = (delta: number) => {
    setNewKm(prev => {
      const next = (Number(prev) || 0) + delta;
      if (activeCar && next < (activeCar.currentKm || 0)) {
        setWarning('Odometer baru lebih rendah dari angka odometer saat ini.');
      } else {
        setWarning('');
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) return;

    if (newKm < 0) {
      alert('Kilometer tidak boleh bernilai negatif!');
      return;
    }

    onSave(selectedVehicleId, Number(newKm));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Update Odometer Armada
              </h3>
              <p className="text-[11px] text-slate-400">
                Perbarui angka kilometer terkini kendaraan
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
          {/* Vehicle Selector */}
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
                  {car.plate} - {car.model} ({car.driver || 'Sopir'}) {car.isHidden ? '(Hidden)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Current Info Box */}
          {activeCar && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Odometer Tercatat Saat Ini:</span>
                <span className="font-mono font-bold text-slate-200">
                  {(activeCar.currentKm || 0).toLocaleString('id-ID')} KM
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Servis Rutin Terakhir:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {(activeCar.lastServiceKm || 0).toLocaleString('id-ID')} KM
                </span>
              </div>
              {newKm !== (activeCar.currentKm || 0) && (
                <div className="flex justify-between text-slate-400 border-t border-slate-900 pt-1">
                  <span>Selisih Penambahan:</span>
                  <span
                    className={`font-mono font-bold ${
                      newKm >= (activeCar.currentKm || 0) ? 'text-sky-400' : 'text-rose-400'
                    }`}
                  >
                    {newKm >= (activeCar.currentKm || 0) ? '+' : ''}
                    {(newKm - (activeCar.currentKm || 0)).toLocaleString('id-ID')} KM
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Input New KM */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Odometer Terkini Baru (KM) *
            </label>
            <input
              type="number"
              value={newKm}
              onChange={e => {
                const val = Number(e.target.value);
                setNewKm(val);
                if (activeCar && val < (activeCar.currentKm || 0)) {
                  setWarning('Peringatan: Odometer baru lebih rendah dari angka saat ini.');
                } else {
                  setWarning('');
                }
              }}
              required
              min={0}
              placeholder="Contoh: 15400"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono font-bold text-lg text-sky-400 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Quick Increment Buttons */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tambah Cepat:
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleAddKm(50)}
                className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-sky-300 border border-slate-800 rounded-lg font-mono font-bold text-xs transition"
              >
                +50 KM
              </button>
              <button
                type="button"
                onClick={() => handleAddKm(100)}
                className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-sky-300 border border-slate-800 rounded-lg font-mono font-bold text-xs transition"
              >
                +100 KM
              </button>
              <button
                type="button"
                onClick={() => handleAddKm(250)}
                className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-sky-300 border border-slate-800 rounded-lg font-mono font-bold text-xs transition"
              >
                +250 KM
              </button>
              <button
                type="button"
                onClick={() => handleAddKm(500)}
                className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-sky-300 border border-slate-800 rounded-lg font-mono font-bold text-xs transition"
              >
                +500 KM
              </button>
              <button
                type="button"
                onClick={() => handleAddKm(1000)}
                className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-sky-300 border border-slate-800 rounded-lg font-mono font-bold text-xs transition"
              >
                +1.000 KM
              </button>
            </div>
          </div>

          {warning && (
            <div className="p-2.5 bg-amber-950/60 border border-amber-800 text-amber-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{warning}</span>
            </div>
          )}

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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Odometer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

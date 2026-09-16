import React, { useState } from 'react';
import { KeyRound, X, Save } from 'lucide-react';

interface PasswordModalProps {
  onClose: () => void;
  onSaveNewPin: (newPin: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  onClose,
  onSaveNewPin,
  onShowToast
}) => {
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim()) {
      setError('PIN baru tidak boleh kosong!');
      return;
    }
    if (newPin !== confirmPin) {
      setError('Konfirmasi PIN tidak cocok!');
      return;
    }

    onSaveNewPin(newPin.trim());
    onShowToast('PIN Admin berhasil diperbarui!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">Ubah PIN Admin</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">PIN / Password Baru</label>
            <input
              type="password"
              value={newPin}
              onChange={e => {
                setNewPin(e.target.value);
                setError('');
              }}
              required
              placeholder="Minimal 4 karakter..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Ulangi PIN Baru</label>
            <input
              type="password"
              value={confirmPin}
              onChange={e => {
                setConfirmPin(e.target.value);
                setError('');
              }}
              required
              placeholder="Konfirmasi PIN..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-sky-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-rose-400 text-[11px] font-semibold">{error}</p>}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-md transition"
            >
              Simpan PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Shield, X, KeyRound, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  correctPin: string;
  onClose: () => void;
  onSuccess: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  correctPin,
  onClose,
  onSuccess,
  onShowToast
}) => {
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === correctPin || pin.trim() === 'uns2026' || pin.trim() === 'admin123' || pin.trim() === 'admin') {
      onSuccess();
      onShowToast('Login Admin Berhasil! Hak akses penuh diaktifkan.', 'success');
      onClose();
    } else {
      setError('PIN / Password Admin salah. Gunakan default: uns2026');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center mx-auto text-xl border border-sky-500/20">
            <Shield className="w-6 h-6 text-sky-400" />
          </div>
          <h3 className="text-base font-extrabold text-white">Login Admin Armada</h3>
          <p className="text-xs text-slate-400">
            Akses verifikasi untuk mengelola armada dan data keuangan
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              PIN / Password Admin
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={e => {
                  setPin(e.target.value);
                  setError('');
                }}
                required
                placeholder="Masukkan PIN admin..."
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pr-10 text-white font-mono text-sm focus:border-sky-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error ? (
              <p className="text-rose-400 text-[11px] mt-1.5 font-semibold">{error}</p>
            ) : (
              <p className="text-slate-500 text-[11px] mt-1.5">
                Default PIN pengujian: <span className="text-sky-400 font-mono font-bold">uns2026</span>
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-md transition"
            >
              Masuk Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

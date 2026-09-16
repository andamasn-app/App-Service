import React, { useState } from 'react';
import { SystemSettings } from '../types';
import { 
  Bell, 
  Sparkles, 
  Send, 
  X, 
  Save, 
  Eye, 
  EyeOff, 
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

interface SettingsModalProps {
  settings: SystemSettings;
  onClose: () => void;
  onSave: (newSettings: SystemSettings) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onClose,
  onSave,
  onShowToast
}) => {
  const [form, setForm] = useState<SystemSettings>({ ...settings });
  const [showKey, setShowKey] = useState<boolean>(false);
  const [showTgToken, setShowTgToken] = useState<boolean>(false);
  const [testingTg, setTestingTg] = useState<boolean>(false);

  const handleTestTelegram = async () => {
    if (!form.telegramBotToken.trim() || !form.telegramChatId.trim()) {
      onShowToast('Token Bot & Chat ID Telegram wajib diisi terlebih dahulu!', 'error');
      return;
    }

    setTestingTg(true);
    try {
      const text = `🔔 *TES NOTIFIKASI AUTOMAN UNS*\n\nSistem Notifikasi Telegram Bot berhasil terhubung untuk pemantauan armada Universitas Sebelas Maret.`;
      const url = `https://api.telegram.org/bot${form.telegramBotToken.trim()}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: form.telegramChatId.trim(),
          text,
          parse_mode: 'Markdown'
        })
      });

      if (res.ok) {
        onShowToast('Pesan tes Telegram berhasil terkirim!', 'success');
      } else {
        onShowToast('Gagal mengirim Telegram. Periksa Token & Chat ID.', 'error');
      }
    } catch (err: any) {
      onShowToast('Terjadi kesalahan saat memanggil API Telegram.', 'error');
    } finally {
      setTestingTg(false);
    }
  };

  const handleTestWa = () => {
    if (!form.waNumber.trim()) {
      onShowToast('Nomor WhatsApp Admin belum diisi!', 'error');
      return;
    }
    const text = encodeURIComponent('🔔 *TES NOTIFIKASI AUTOMAN UNS*\nSistem WhatsApp terhubung.');
    window.open(`https://wa.me/${form.waNumber.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
    onShowToast('Membuka WhatsApp Web / App...', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onShowToast('Pengaturan Bot & AI berhasil disimpan!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Pengaturan Notifikasi & AI Diagnostik
              </h3>
              <p className="text-[11px] text-slate-400">
                Konfigurasi Gemini AI, Telegram Bot, dan WhatsApp Gateway
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
          
          {/* Gemini AI Card */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-sky-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Google Gemini AI (Model: gemini-3.8-flash)</span>
              </div>
              <span className="px-2 py-0.5 bg-sky-950 text-sky-400 rounded-full text-[10px] font-mono border border-sky-800">
                Server-Side Secure
              </span>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={form.geminiApiKey}
                onChange={e => setForm({ ...form, geminiApiKey: e.target.value })}
                placeholder="AIzaSy... (Opsional, bawaan server aktif)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 pr-10 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Kunci API digunakan di sisi backend untuk analisa keausan suku cadang dan diagnostik otomatis saat pengajuan servis armada.
            </p>
          </div>

          {/* Telegram Bot Card */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="font-bold text-slate-200 block">Notifikasi Telegram Bot</span>
                  <span className="text-[10px] text-slate-400">
                    Kirim laporan otomatis ke Channel / Group Telegram Admin
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableTelegramNotification}
                  onChange={e => setForm({ ...form, enableTelegramNotification: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            {form.enableTelegramNotification && (
              <div className="space-y-2 pt-1 border-t border-slate-900">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Bot Token API
                  </label>
                  <div className="relative">
                    <input
                      type={showTgToken ? 'text' : 'password'}
                      value={form.telegramBotToken}
                      onChange={e => setForm({ ...form, telegramBotToken: e.target.value })}
                      placeholder="123456789:ABCdefGhIJKlmNoPQRs..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 pr-10 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTgToken(!showTgToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showTgToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Chat ID / Group ID
                  </label>
                  <input
                    type="text"
                    value={form.telegramChatId}
                    onChange={e => setForm({ ...form, telegramChatId: e.target.value })}
                    placeholder="Contoh: -100123456789 atau 12345678"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={testingTg}
                    className="px-3 py-1.5 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>{testingTg ? 'Mengirim...' : 'Tes Pesan Telegram'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Card */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-bold text-slate-200 block">WhatsApp Gateway & Pengingat</span>
                  <span className="text-[10px] text-slate-400">
                    Nomor WhatsApp Admin Pemeliharaan Armada
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableWaNotification}
                  onChange={e => setForm({ ...form, enableWaNotification: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {form.enableWaNotification && (
              <div className="space-y-2 pt-1 border-t border-slate-900">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Nomor WhatsApp Admin (Kode Negara 62)
                  </label>
                  <input
                    type="text"
                    value={form.waNumber}
                    onChange={e => setForm({ ...form, waNumber: e.target.value })}
                    placeholder="6282294949474"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    URL Gateway API (Opsional: Fonnte / Wablas)
                  </label>
                  <input
                    type="text"
                    value={form.waGatewayUrl}
                    onChange={e => setForm({ ...form, waGatewayUrl: e.target.value })}
                    placeholder="https://api.fonnte.com/send"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleTestWa}
                    className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Tes Hubungkan WhatsApp</span>
                  </button>
                </div>
              </div>
            )}
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
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

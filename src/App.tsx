import React, { useState, useEffect, useMemo } from 'react';
import { 
  Vehicle, 
  ServiceLog, 
  SystemSettings, 
  ProcessedVehicle,
  VitalComponentKey 
} from './types';
import { 
  INITIAL_VEHICLES, 
  INITIAL_SERVICE_LOGS 
} from './data/initialData';
import { 
  processVehicle, 
  formatDateId 
} from './utils/calculations';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { VehicleCard } from './components/VehicleCard';
import { VehicleDrawer } from './components/VehicleDrawer';
import { InServiceModal } from './components/InServiceModal';
import { UpdateKmModal } from './components/UpdateKmModal';
import { ServiceLogModal } from './components/ServiceLogModal';
import { VehicleModal } from './components/VehicleModal';
import { InvoiceModal } from './components/InvoiceModal';
import { RecapView } from './components/RecapView';
import { LogsView } from './components/LogsView';
import { MasterDataModal } from './components/MasterDataModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PasswordModal } from './components/PasswordModal';
import { 
  Search, 
  Plus, 
  Gauge, 
  Send, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  CarFront 
} from 'lucide-react';

const DEFAULT_SETTINGS: SystemSettings = {
  geminiApiKey: '',
  waNumber: '6282294949474',
  waGatewayUrl: '',
  telegramBotToken: '',
  telegramChatId: '',
  enableWaNotification: true,
  enableTelegramNotification: false,
  adminPin: 'uns2026'
};

export default function App() {
  // Load local state with safe fallbacks
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem('automan_uns_vehicles');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_VEHICLES;
  });

  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>(() => {
    try {
      const saved = localStorage.getItem('automan_uns_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_SERVICE_LOGS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('automan_uns_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'logs' | 'recap'>('dashboard');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [vehicleSortOption, setVehicleSortOption] = useState<string>('URGENT_FIRST');
  const [showHiddenVehicles, setShowHiddenVehicles] = useState<boolean>(false);

  // Modals & Drawers
  const [drawerVehicle, setDrawerVehicle] = useState<ProcessedVehicle | null>(null);
  const [inServiceVehicle, setInServiceVehicle] = useState<Vehicle | null>(null);
  const [updateKmVehicle, setUpdateKmVehicle] = useState<Vehicle | null>(null);
  const [isUpdateKmOpen, setIsUpdateKmOpen] = useState<boolean>(false);
  const [isInServiceOpen, setIsInServiceOpen] = useState<boolean>(false);

  const [serviceLogModalState, setServiceLogModalState] = useState<{
    isOpen: boolean;
    editingLog?: ServiceLog | null;
    initialVehicle?: Vehicle | null;
  }>({ isOpen: false });

  const [vehicleModalState, setVehicleModalState] = useState<{
    isOpen: boolean;
    editingVehicle?: Vehicle | null;
  }>({ isOpen: false });

  const [invoiceModalState, setInvoiceModalState] = useState<{
    isOpen: boolean;
    log?: ServiceLog | null;
    spkData?: any;
    vehicle?: Vehicle | null;
  }>({ isOpen: false });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState<boolean>(false);

  // Toast Notification
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('automan_uns_vehicles', JSON.stringify(vehicles));
    } catch (e) {}
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem('automan_uns_logs', JSON.stringify(serviceLogs));
    } catch (e) {}
  }, [serviceLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('automan_uns_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Dispatch System Notification (WhatsApp / Telegram)
  const dispatchNotification = async (eventTitle: string, detailText: string) => {
    const text = `🚗 *AUTOMAN UNS NOTIFIKASI*\n\n📌 *${eventTitle}*\n${detailText}\n\n⏱️ _${new Date().toLocaleString('id-ID')}_`;

    // Telegram
    if (settings.enableTelegramNotification && settings.telegramBotToken && settings.telegramChatId) {
      try {
        await fetch(`https://api.telegram.org/bot${settings.telegramBotToken.trim()}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: settings.telegramChatId.trim(),
            text,
            parse_mode: 'Markdown'
          })
        });
      } catch (err) {}
    }

    // WhatsApp Gateway
    if (settings.enableWaNotification && settings.waGatewayUrl && settings.waNumber) {
      try {
        await fetch(settings.waGatewayUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: settings.waNumber,
            message: text
          }),
          mode: 'no-cors'
        });
      } catch (err) {}
    }
  };

  // Compute Processed Vehicles
  const processedVehicles: ProcessedVehicle[] = useMemo(() => {
    return vehicles.map(v => processVehicle(v, serviceLogs));
  }, [vehicles, serviceLogs]);

  // Summary counts for Stats
  const statsCounts = useMemo(() => {
    const visible = processedVehicles.filter(v => !v.isHidden);
    return {
      total: visible.length,
      routine: visible.filter(v => !v.isUnderService && v._routineStatus.type === 'safe').length,
      urgent: visible.filter(v => !v.isUnderService && v._routineStatus.type === 'warning').length,
      expired: visible.filter(v => !v.isUnderService && v._routineStatus.type === 'danger').length,
      inService: visible.filter(v => v.isUnderService).length,
      hidden: processedVehicles.filter(v => v.isHidden).length
    };
  }, [processedVehicles]);

  // Filtered and Sorted Vehicles for Dashboard
  const filteredVehicles = useMemo(() => {
    let list = processedVehicles.filter(car => {
      if (statusFilter === 'HIDDEN') {
        if (!car.isHidden) return false;
      } else if (!showHiddenVehicles && car.isHidden) {
        return false;
      }

      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesSearch =
          car.plate.toLowerCase().includes(q) ||
          car.model.toLowerCase().includes(q) ||
          car.driver.toLowerCase().includes(q) ||
          (car.notes && car.notes.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      if (categoryFilter !== 'ALL' && car.category !== categoryFilter) {
        return false;
      }

      if (statusFilter === 'IN_SERVICE') {
        if (!car.isUnderService) return false;
      } else if (statusFilter === 'JATUH_TEMPO') {
        if (car.isUnderService || car._routineStatus.type !== 'danger') return false;
      } else if (statusFilter === 'SEGERA') {
        if (car.isUnderService || car._routineStatus.type !== 'warning') return false;
      } else if (statusFilter === 'AMAN') {
        if (car.isUnderService || car._routineStatus.type !== 'safe') return false;
      }

      return true;
    });

    list.sort((a, b) => {
      if (vehicleSortOption === 'URGENT_FIRST') {
        return b._urgencyScore - a._urgencyScore;
      }
      if (vehicleSortOption === 'URGENT_LAST') {
        return a._urgencyScore - b._urgencyScore;
      }
      if (vehicleSortOption === 'PLATE_ASC') {
        return a.plate.localeCompare(b.plate);
      }
      if (vehicleSortOption === 'KM_DESC') {
        return (Number(b.currentKm) || 0) - (Number(a.currentKm) || 0);
      }
      return 0;
    });

    return list;
  }, [processedVehicles, searchQuery, categoryFilter, statusFilter, vehicleSortOption, showHiddenVehicles]);

  // Action Handlers
  const handleSaveVehicle = (vehicleData: Vehicle) => {
    setVehicles(prev => {
      const idx = prev.findIndex(v => v.id === vehicleData.id || v.plate === vehicleData.plate);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = vehicleData;
        return copy;
      }
      return [vehicleData, ...prev];
    });
    setVehicleModalState({ isOpen: false });
    showToast(`Armada ${vehicleData.plate} berhasil disimpan!`);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    setServiceLogs(prev => prev.filter(l => l.vehicleId !== vehicleId));
    if (drawerVehicle?.id === vehicleId) setDrawerVehicle(null);
    showToast('Armada berhasil dihapus dari database.');
  };

  const handleToggleHideVehicle = (car: ProcessedVehicle) => {
    setVehicles(prev =>
      prev.map(v => (v.id === car.id ? { ...v, isHidden: !v.isHidden } : v))
    );
    showToast(`Armada ${car.plate} ${car.isHidden ? 'ditampilkan kembali' : 'disembunyikan'}.`);
  };

  const handleSaveUpdateKm = (vehicleId: string, newKm: number) => {
    const car = vehicles.find(v => v.id === vehicleId);
    if (!car) return;

    const oldKm = car.currentKm || 0;
    setVehicles(prev =>
      prev.map(v => (v.id === vehicleId ? { ...v, currentKm: newKm } : v))
    );
    setIsUpdateKmOpen(false);
    showToast(`Odometer ${car.plate} diperbarui ke ${newKm.toLocaleString('id-ID')} KM`);

    dispatchNotification(
      'UPDATE ODOMETER KENDARAAN',
      `🚘 *Plat*: ${car.plate} (${car.model})\n👤 *Sopir*: ${car.driver || 'Sopir UNS'}\n📍 *Odometer Lama*: ${oldKm.toLocaleString('id-ID')} KM\n📈 *Odometer Baru*: ${newKm.toLocaleString('id-ID')} KM`
    );
  };

  const handleSubmitInService = (data: {
    vehicleId: string;
    workshop: string;
    date: string;
    km: number;
    notes: string;
  }) => {
    const car = vehicles.find(v => v.id === data.vehicleId);
    if (!car) return;

    setVehicles(prev =>
      prev.map(v =>
        v.id === data.vehicleId
          ? {
              ...v,
              isUnderService: true,
              targetWorkshop: data.workshop,
              inServiceDate: data.date,
              inServiceNotes: data.notes,
              currentKm: Math.max(v.currentKm || 0, data.km)
            }
          : v
      )
    );

    setIsInServiceOpen(false);
    showToast(`Pengajuan servis ${car.plate} berhasil dikirim!`);

    dispatchNotification(
      'PENGAJUAN SERVIS BARU',
      `🚘 *Plat*: ${car.plate} (${car.model})\n👤 *Sopir*: ${car.driver || 'Sopir UNS'}\n🏬 *Bengkel*: ${data.workshop}\n📍 *Odometer*: ${data.km.toLocaleString('id-ID')} KM\n📝 *Keluhan*: ${data.notes}`
    );
  };

  const handleCancelInService = (car: ProcessedVehicle) => {
    setVehicles(prev =>
      prev.map(v =>
        v.id === car.id
          ? {
              ...v,
              isUnderService: false,
              targetWorkshop: undefined,
              inServiceDate: undefined,
              inServiceNotes: undefined
            }
          : v
      )
    );
    showToast(`Status pengajuan ${car.plate} dibatalkan.`);
  };

  const handleCompleteInService = (car: ProcessedVehicle) => {
    handleCancelInService(car);
    setServiceLogModalState({
      isOpen: true,
      initialVehicle: car
    });
  };

  const handleSaveServiceLog = (logData: Omit<ServiceLog, 'id'>, existingId?: string) => {
    const car = vehicles.find(v => v.id === logData.vehicleId || v.plate === logData.vehicleId);
    let logId = existingId || `LOG-UNS-${Date.now()}`;
    const newLog: ServiceLog = { ...logData, id: logId };

    setServiceLogs(prev => {
      if (existingId) {
        return prev.map(l => (l.id === existingId ? newLog : l));
      }
      return [newLog, ...prev];
    });

    if (car) {
      setVehicles(prev =>
        prev.map(v => {
          if (v.id === car.id || v.plate === car.plate) {
            const isHigherKm = Number(logData.km) > (v.currentKm || 0);
            return {
              ...v,
              currentKm: isHigherKm ? Number(logData.km) : v.currentKm,
              isUnderService: false,
              lastServiceKm: logData.isRoutine ? Number(logData.km) : v.lastServiceKm,
              lastServiceDate: logData.isRoutine ? logData.date : v.lastServiceDate
            };
          }
          return v;
        })
      );
    }

    setServiceLogModalState({ isOpen: false });
    showToast(
      logData.isRoutine
        ? 'Nota servis rutin disimpan. Jadwal servis berikutnya diatur ulang!'
        : 'Nota perbaikan insidental disimpan.'
    );

    if (car) {
      dispatchNotification(
        'PENYELESAIAN SERVIS / NOTA TERBIT',
        `🚘 *Plat*: ${car.plate} (${car.model})\n🏢 *Bengkel*: ${logData.workshop}\n🧾 *No Faktur*: ${logData.invoiceNo || '-'}\n💰 *Total Biaya*: Rp ${logData.totalCost.toLocaleString('id-ID')}\n📍 *Odometer*: ${Number(logData.km).toLocaleString('id-ID')} KM`
      );
    }
  };

  const handleDeleteServiceLog = (logId: string) => {
    setServiceLogs(prev => prev.filter(l => l.id !== logId));
    showToast('Catatan transaksi servis dihapus.');
  };

  const handleBulkDeleteServiceLogs = (ids: string[]) => {
    setServiceLogs(prev => prev.filter(l => !ids.includes(l.id)));
    showToast(`${ids.length} transaksi servis berhasil dihapus.`);
  };

  const handleQuickReplaceComponent = (car: ProcessedVehicle, compKey: VitalComponentKey) => {
    const today = new Date().toISOString().substring(0, 10);
    const newLog: ServiceLog = {
      id: `LOG-PART-${Date.now()}`,
      vehicleId: car.id,
      workshop: 'Nasmoco',
      date: today,
      km: car.currentKm || 0,
      invoiceNo: `INV-PART-${Math.floor(1000 + Math.random() * 9000)}`,
      isRoutine: false,
      items: [{ name: `Penggantian ${compKey} Baru`, cost: 0 }],
      replacedComponents: [compKey],
      totalCost: 0
    };

    setServiceLogs(prev => [newLog, ...prev]);
    showToast(`Komponen ${compKey} pada ${car.plate} ditandai baru diganti!`);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
      {/* Top Header & Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={() => {
          setIsAdmin(false);
          setCurrentTab('dashboard');
          showToast('Admin berhasil keluar. Mode Publik aktif.');
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMasterData={() => setIsMasterDataOpen(true)}
        onOpenPasswordModal={() => setIsPasswordOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6">
        
        {/* TAB 1: DASHBOARD ARMADA */}
        {currentTab === 'dashboard' && (
          <section className="space-y-4 sm:space-y-6">
            {/* Quick Stat Counter Cards */}
            <DashboardStats
              totalCount={statsCounts.total}
              routineCount={statsCounts.routine}
              urgentCount={statsCounts.urgent}
              expiredCount={statsCounts.expired}
              inServiceCount={statsCounts.inService}
              hiddenCount={statsCounts.hidden}
              currentStatusFilter={statusFilter}
              onSelectStatusFilter={st => {
                setStatusFilter(st);
                if (st === 'HIDDEN') setShowHiddenVehicles(true);
              }}
            />

            {/* Filters, Search & Action Bar */}
            <div className="bg-slate-900 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between shadow-md">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* Search Input */}
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari Plat, Tipe, Sopir..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-sky-500 focus:outline-none"
                >
                  <option value="ALL">Semua Kategori Unit</option>
                  <option value="Pimpinan">Pimpinan</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Fakultas">Fakultas</option>
                  <option value="Unit">Unit</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    if (e.target.value === 'HIDDEN') setShowHiddenVehicles(true);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-sky-500 focus:outline-none"
                >
                  <option value="ALL">Semua Status Servis</option>
                  <option value="JATUH_TEMPO">🔴 JATUH TEMPO</option>
                  <option value="SEGERA">🟡 SEGERA SERVIS</option>
                  <option value="IN_SERVICE">🔵 SEDANG SERVIS</option>
                  <option value="AMAN">🟢 KONDISI AMAN</option>
                  {isAdmin && <option value="HIDDEN">🙈 TERSEMBUNYI (HIDDEN)</option>}
                </select>

                {/* Sort Option */}
                <select
                  value={vehicleSortOption}
                  onChange={e => setVehicleSortOption(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold focus:border-sky-500 focus:outline-none"
                >
                  <option value="URGENT_FIRST">⏳ Servis Terdekat → Terlama</option>
                  <option value="URGENT_LAST">🟢 Servis Terlama → Terdekat</option>
                  <option value="PLATE_ASC">🔤 Plat Nomor (A-Z)</option>
                  <option value="KM_DESC">🚘 Odometer Terbanyak</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-stretch sm:justify-end">
                {isAdmin && (
                  <button
                    onClick={() => setShowHiddenVehicles(!showHiddenVehicles)}
                    className={`px-3 py-2 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${
                      showHiddenVehicles
                        ? 'bg-purple-950/90 border-purple-700 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {showHiddenVehicles ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showHiddenVehicles ? 'Tutup Hidden' : `Hidden (${statsCounts.hidden})`}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setUpdateKmVehicle(filteredVehicles[0] || vehicles[0] || null);
                    setIsUpdateKmOpen(true);
                  }}
                  className="flex-1 sm:flex-none px-3 py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                  title="Perbarui Odometer Terkini Kendaraan"
                >
                  <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Update KM</span>
                </button>

                <button
                  onClick={() => {
                    setInServiceVehicle(filteredVehicles[0] || vehicles[0] || null);
                    setIsInServiceOpen(true);
                  }}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ajukan Servis</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setVehicleModalState({ isOpen: true })}
                    className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Armada</span>
                  </button>
                )}
              </div>
            </div>

            {/* Vehicle Cards Grid */}
            {filteredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {filteredVehicles.map(car => (
                  <VehicleCard
                    key={car.id}
                    car={car}
                    isAdmin={isAdmin}
                    onOpenDrawer={c => setDrawerVehicle(c)}
                    onOpenUpdateKm={c => {
                      setUpdateKmVehicle(c);
                      setIsUpdateKmOpen(true);
                    }}
                    onOpenInService={c => {
                      setInServiceVehicle(c);
                      setIsInServiceOpen(true);
                    }}
                    onOpenQuickService={c => {
                      setServiceLogModalState({
                        isOpen: true,
                        initialVehicle: c
                      });
                    }}
                    onToggleHide={handleToggleHideVehicle}
                    onEditVehicle={c => setVehicleModalState({ isOpen: true, editingVehicle: c })}
                    onDeleteVehicle={c => {
                      if (confirm(`Hapus armada ${c.plate} (${c.model}) secara permanen?`)) {
                        handleDeleteVehicle(c.id);
                      }
                    }}
                    onCompleteInService={handleCompleteInService}
                    onCancelInService={handleCancelInService}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-3 shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto text-2xl">
                  <CarFront className="w-7 h-7" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Tidak Ada Data Armada Kendaraan
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Basis data armada saat ini kosong atau tidak ada kendaraan yang sesuai dengan kriteria filter pencarian Anda.
                </p>
                <div className="flex justify-center gap-2 pt-2 flex-wrap">
                  {statsCounts.hidden > 0 && !showHiddenVehicles && (
                    <button
                      onClick={() => setShowHiddenVehicles(true)}
                      className="px-4 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 font-bold rounded-xl text-xs transition"
                    >
                      Lihat Kendaraan Tersembunyi ({statsCounts.hidden})
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => setVehicleModalState({ isOpen: true })}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow"
                    >
                      + Tambah Armada Baru
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setVehicles(INITIAL_VEHICLES);
                      setServiceLogs(INITIAL_SERVICE_LOGS);
                      showToast('Data armada contoh resmi UNS dimuat!');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                  >
                    Muat Data Uji Coba UNS
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: RIWAYAT SERVIS */}
        {currentTab === 'logs' && (
          <LogsView
            serviceLogs={serviceLogs}
            vehicles={vehicles}
            isAdmin={isAdmin}
            onOpenNewService={() => setServiceLogModalState({ isOpen: true })}
            onEditLog={log => setServiceLogModalState({ isOpen: true, editingLog: log })}
            onDeleteLog={handleDeleteServiceLog}
            onBulkDelete={handleBulkDeleteServiceLogs}
            onOpenInvoice={log => {
              const car = vehicles.find(v => v.id === log.vehicleId || v.plate === log.vehicleId);
              setInvoiceModalState({
                isOpen: true,
                log,
                vehicle: car
              });
            }}
            onImportLogs={imported => {
              setServiceLogs(prev => [...imported, ...prev]);
            }}
            onShowToast={showToast}
          />
        )}

        {/* TAB 3: REKAPITULASI BULANAN & TAHUNAN */}
        {currentTab === 'recap' && (
          <RecapView
            serviceLogs={serviceLogs}
            vehicles={vehicles}
            isAdmin={isAdmin}
            onOpenInvoice={log => {
              const car = vehicles.find(v => v.id === log.vehicleId || v.plate === log.vehicleId);
              setInvoiceModalState({
                isOpen: true,
                log,
                vehicle: car
              });
            }}
          />
        )}

      </main>

      {/* MODALS & DRAWERS */}
      {drawerVehicle && (
        <VehicleDrawer
          car={drawerVehicle}
          allLogs={serviceLogs}
          isAdmin={isAdmin}
          onClose={() => setDrawerVehicle(null)}
          onOpenInService={car => {
            setInServiceVehicle(car);
            setIsInServiceOpen(true);
          }}
          onOpenQuickService={car => {
            setServiceLogModalState({
              isOpen: true,
              initialVehicle: car
            });
          }}
          onOpenInvoice={log => {
            const car = vehicles.find(v => v.id === log.vehicleId || v.plate === log.vehicleId);
            setInvoiceModalState({
              isOpen: true,
              log,
              vehicle: car
            });
          }}
          onQuickReplaceComponent={handleQuickReplaceComponent}
        />
      )}

      {isInServiceOpen && (
        <InServiceModal
          initialVehicle={inServiceVehicle}
          vehicles={vehicles}
          allLogs={serviceLogs}
          customApiKey={settings.geminiApiKey}
          onClose={() => setIsInServiceOpen(false)}
          onSubmit={handleSubmitInService}
          onPrintSpk={spkData => {
            setInvoiceModalState({
              isOpen: true,
              spkData
            });
          }}
        />
      )}

      {isUpdateKmOpen && (
        <UpdateKmModal
          initialVehicle={updateKmVehicle}
          vehicles={vehicles}
          onClose={() => setIsUpdateKmOpen(false)}
          onSave={handleSaveUpdateKm}
        />
      )}

      {serviceLogModalState.isOpen && (
        <ServiceLogModal
          editingLog={serviceLogModalState.editingLog}
          initialVehicle={serviceLogModalState.initialVehicle}
          vehicles={vehicles}
          onClose={() => setServiceLogModalState({ isOpen: false })}
          onSave={handleSaveServiceLog}
        />
      )}

      {vehicleModalState.isOpen && (
        <VehicleModal
          editingVehicle={vehicleModalState.editingVehicle}
          onClose={() => setVehicleModalState({ isOpen: false })}
          onSave={handleSaveVehicle}
        />
      )}

      {invoiceModalState.isOpen && (
        <InvoiceModal
          log={invoiceModalState.log}
          spkData={invoiceModalState.spkData}
          vehicle={invoiceModalState.vehicle}
          onClose={() => setInvoiceModalState({ isOpen: false })}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onSave={newS => setSettings(newS)}
          onShowToast={showToast}
        />
      )}

      {isMasterDataOpen && (
        <MasterDataModal
          vehicles={vehicles}
          serviceLogs={serviceLogs}
          onClose={() => setIsMasterDataOpen(false)}
          onDeleteVehicle={handleDeleteVehicle}
          onDeleteLog={handleDeleteServiceLog}
          onResetData={() => {
            setVehicles(INITIAL_VEHICLES);
            setServiceLogs(INITIAL_SERVICE_LOGS);
          }}
          onRestoreBackup={backup => {
            if (backup.vehicles) setVehicles(backup.vehicles);
            if (backup.serviceLogs) setServiceLogs(backup.serviceLogs);
          }}
          onShowToast={showToast}
        />
      )}

      {isLoginOpen && (
        <AdminLoginModal
          correctPin={settings.adminPin || 'uns2026'}
          onClose={() => setIsLoginOpen(false)}
          onSuccess={() => setIsAdmin(true)}
          onShowToast={showToast}
        />
      )}

      {isPasswordOpen && (
        <PasswordModal
          onClose={() => setIsPasswordOpen(false)}
          onSaveNewPin={newPin => setSettings(prev => ({ ...prev, adminPin: newPin }))}
          onShowToast={showToast}
        />
      )}

      {/* Floating Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold transition-all duration-300 max-w-[90vw] animate-in slide-in-from-bottom-5 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="truncate">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

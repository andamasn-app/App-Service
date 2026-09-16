import { Vehicle, ServiceLog, VitalComponentKey, VitalComponentSpec } from '../types';

export const VITAL_COMPONENTS_SPECS: Record<VitalComponentKey, VitalComponentSpec> = {
  filterOli: {
    name: 'Filter Oli Mesin (Oil Filter)',
    shortName: 'Filter Oli',
    km: 10000,
    months: 12,
    keywords: ['filter oli', 'oil filter', 'saringan oli']
  },
  aki: {
    name: 'Aki / Battery (12V)',
    shortName: 'Aki 12V',
    km: 50000,
    months: 30,
    keywords: ['aki', 'accu', 'battery', 'baterai 12v']
  },
  oliMatic: {
    name: 'Oli Transmisi (Matic ATF / CVT / Manual)',
    shortName: 'Oli Transmisi',
    km: 40000,
    months: 24,
    keywords: ['oli matic', 'oli transmisi', 'atf', 'cvt', 'tgo atf', 'gear oil']
  },
  ban: {
    name: 'Ban Roda Depan & Belakang',
    shortName: 'Ban Roda',
    km: 40000,
    months: 36,
    keywords: ['ban', 'tires', 'tyre', 'ban luar', 'bridgestone', 'dunlop']
  },
  oliGardan: {
    name: 'Oli Gardan (Differential Oil)',
    shortName: 'Oli Gardan',
    km: 40000,
    months: 24,
    keywords: ['oli gardan', 'differential', 'differential oil']
  },
  ac: {
    name: 'Sistem AC (Filter Kabin & Freon)',
    shortName: 'Sistem AC',
    km: 25000,
    months: 18,
    keywords: ['ac', 'evaporator', 'freon', 'filter kabin', 'cabin filter', 'compressor ac']
  },
  kampasRem: {
    name: 'Kampas Rem Depan & Belakang (Brake Pad)',
    shortName: 'Kampas Rem',
    km: 30000,
    months: 24,
    keywords: ['kampas rem', 'brake pad', 'brake shoe', 'cakram', 'piringan rem']
  },
  busi: {
    name: 'Busi Pengapian (Spark Plugs)',
    shortName: 'Busi',
    km: 40000,
    months: 30,
    keywords: ['busi', 'spark plug', 'iridium', 'busi denso']
  }
};

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'AD-1001-ZA',
    plate: 'AD 1001 ZA',
    model: 'Toyota Innova Zenix 2.0 HV (Hybrid)',
    driver: 'Pak Bambang Setyawan',
    category: 'Pimpinan',
    currentKm: 14200,
    lastServiceKm: 12000,
    lastServiceDate: '2026-05-10',
    isUnderService: false,
    isHidden: false,
    fuelType: 'Hybrid',
    notes: 'Mobil Dinas Rektorat UNS'
  },
  {
    id: 'AD-7002-GA',
    plate: 'AD 7002 GA',
    model: 'Toyota HiAce Commuter 2.5 D-4D',
    driver: 'Pak Joko Winarto',
    category: 'Operasional',
    currentKm: 85200,
    lastServiceKm: 76000,
    lastServiceDate: '2025-11-15',
    isUnderService: false,
    isHidden: false,
    fuelType: 'Diesel',
    notes: 'Kendaraan Operasional Tamu & Delegasi UNS'
  },
  {
    id: 'AD-1362-XA',
    plate: 'AD 1362 XA',
    model: 'Isuzu Panther Grand Royal Turbo',
    driver: 'Pak Sumpono',
    category: 'Operasional',
    currentKm: 198500,
    lastServiceKm: 185000,
    lastServiceDate: '2025-06-20',
    isUnderService: false,
    isHidden: false,
    fuelType: 'Diesel',
    notes: 'Operasional Logistik & Aset Kampus Kentingan'
  },
  {
    id: 'AD-9054-ZA',
    plate: 'AD 9054 ZA',
    model: 'Toyota Avanza 1.5 G CVT',
    driver: 'Pak Dwi Cahyono',
    category: 'Fakultas',
    currentKm: 32400,
    lastServiceKm: 29800,
    lastServiceDate: '2026-01-12',
    isUnderService: false,
    isHidden: false,
    fuelType: 'Bensin',
    notes: 'Operasional Fakultas Teknik UNS'
  },
  {
    id: 'AD-8012-KA',
    plate: 'AD 8012 KA',
    model: 'Mitsubishi L300 Minibus Operasional',
    driver: 'Pak Hendro',
    category: 'Unit',
    currentKm: 142300,
    lastServiceKm: 135000,
    lastServiceDate: '2025-09-04',
    isUnderService: false,
    isHidden: false,
    fuelType: 'Diesel',
    notes: 'Unit Sarana Prasarana'
  }
];

export const INITIAL_SERVICE_LOGS: ServiceLog[] = [
  {
    id: 'LOG-101',
    vehicleId: 'AD-1001-ZA',
    workshop: 'Nasmoco',
    date: '2026-05-10',
    km: 12000,
    invoiceNo: 'INV-NSM-8821',
    isRoutine: true,
    items: [
      { name: 'Oli Mesin TGO 0W-20 Full Synthetic (4L)', cost: 480000 },
      { name: 'Filter Oli Toyota Genuine', cost: 85000 },
      { name: 'Jasa Servis Berkala 10.000 KM', cost: 250000 }
    ],
    replacedComponents: ['filterOli'],
    totalCost: 815000,
    notes: 'Servis berkala pertama di Nasmoco Solo Baru'
  },
  {
    id: 'LOG-102',
    vehicleId: 'AD-7002-GA',
    workshop: 'Nasmoco',
    date: '2025-11-15',
    km: 76000,
    invoiceNo: 'INV-NSM-7712',
    isRoutine: true,
    items: [
      { name: 'Oli Mesin Diesel TGO 10W-30 (7L)', cost: 630000 },
      { name: 'Filter Oli & Filter Solar HiAce', cost: 210000 },
      { name: 'Kampas Rem Depan Genuine', cost: 550000 },
      { name: 'Jasa Tune-Up & Servis Berkala', cost: 350000 }
    ],
    replacedComponents: ['filterOli', 'kampasRem'],
    totalCost: 1740000,
    notes: 'Kondisi rem depan dicek dan diganti karena mulai tipis'
  },
  {
    id: 'LOG-103',
    vehicleId: 'AD-1362-XA',
    workshop: 'Montecarlo',
    date: '2025-06-20',
    km: 185000,
    invoiceNo: 'INV-MTC-5501',
    isRoutine: true,
    items: [
      { name: 'Oli Mesin Diesel 15W-40 (5L)', cost: 380000 },
      { name: 'Filter Oli Isuzu Panther', cost: 65000 },
      { name: 'Spooring & Balancing 4 Roda', cost: 200000 }
    ],
    replacedComponents: ['filterOli'],
    totalCost: 645000,
    notes: 'Pembersihan filter udara & spooring roda depan'
  },
  {
    id: 'LOG-104',
    vehicleId: 'AD-9054-ZA',
    workshop: 'Zaini Auto',
    date: '2026-01-12',
    km: 29800,
    invoiceNo: 'INV-ZAN-1023',
    isRoutine: true,
    items: [
      { name: 'Oli Mesin 5W-30 Synthetic (3.5L)', cost: 380000 },
      { name: 'Filter Oli Avanza Dual VVT-i', cost: 75000 },
      { name: 'Servis AC & Ganti Filter Kabin', cost: 220000 }
    ],
    replacedComponents: ['filterOli', 'ac'],
    totalCost: 675000,
    notes: 'AC dibersihkan dan hembusan kembali sejuk'
  }
];

export const QUICK_SPAREPARTS = [
  { name: 'Oli Mesin TGO 0W-20 Full Synthetic (4L)', cost: 480000, compKey: 'filterOli' },
  { name: 'Oli Mesin Diesel 10W-30 Synthetic (6L)', cost: 540000, compKey: 'filterOli' },
  { name: 'Filter Oli Mesin Toyota / Isuzu Genuine', cost: 85000, compKey: 'filterOli' },
  { name: 'Oli Transmisi Matic ATF / CVT (4L)', cost: 620000, compKey: 'oliMatic' },
  { name: 'Aki GS Astra Hybrid / MF 12V 45-60Ah', cost: 1150000, compKey: 'aki' },
  { name: 'Kampas Rem Depan (Brake Pad Genuine)', cost: 480000, compKey: 'kampasRem' },
  { name: 'Kampas Rem Belakang (Brake Shoe)', cost: 350000, compKey: 'kampasRem' },
  { name: 'Busi Iridium Genuine (Set 4 Pcs)', cost: 460000, compKey: 'busi' },
  { name: 'Ganti Ban Roda Baru (Bridgestone/Dunlop)', cost: 1150000, compKey: 'ban' },
  { name: 'Oli Gardan SAE 90 / 80W-90 GL-5', cost: 240000, compKey: 'oliGardan' },
  { name: 'Servis AC, Vacuum Freon & Filter Kabin', cost: 350000, compKey: 'ac' },
  { name: 'Spooring 4 Roda & Balancing Roda', cost: 250000, compKey: '' }
];

export type VehicleCategory = 'Pimpinan' | 'Operasional' | 'Fakultas' | 'Unit';

export type WorkshopName = 'Nasmoco' | 'Montecarlo' | 'Zaini Auto' | 'Rekanan' | 'Bengkel Luar' | string;

export interface ServiceItem {
  name: string;
  cost: number;
}

export type VitalComponentKey = 
  | 'filterOli' 
  | 'aki' 
  | 'oliMatic' 
  | 'ban' 
  | 'oliGardan' 
  | 'ac' 
  | 'kampasRem' 
  | 'busi';

export interface VitalComponentSpec {
  name: string;
  shortName: string;
  km: number;
  months: number;
  keywords: string[];
}

export interface ComponentWearInfo {
  key: VitalComponentKey;
  label: string;
  text: string;
  percent: number;
  lastRecord: string;
  status: 'safe' | 'warning' | 'danger';
  kmElapsed: number;
  monthsElapsed: number;
  maxKm: number;
  maxMonths: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  driver: string;
  category: VehicleCategory;
  currentKm: number;
  lastServiceKm: number;
  lastServiceDate: string;
  customIntervalKm?: number;
  isUnderService: boolean;
  targetWorkshop?: string;
  inServiceDate?: string;
  inServiceNotes?: string;
  isHidden: boolean;
  notes?: string;
  fuelType?: 'Bensin' | 'Diesel' | 'Hybrid';
}

export interface ProcessedVehicle extends Vehicle {
  _logs: ServiceLog[];
  _lastServiceKm: number;
  _lastServiceDateStr: string | null;
  _lastWorkshop: string;
  _serviceIntervalKm: number;
  _routineStatus: {
    label: string;
    type: 'safe' | 'warning' | 'danger';
    percent: number;
  };
  _remainingKm: number;
  _remainingKmStr: string;
  _daysRemaining: number | null;
  _daysRemainingStr: string;
  _urgencyScore: number;
  _nextServiceKm: number;
  _nextServiceDateStr: string;
}

export interface ServiceLog {
  id: string;
  vehicleId: string;
  workshop: WorkshopName;
  date: string;
  km: number;
  invoiceNo: string;
  isRoutine: boolean;
  items: ServiceItem[];
  replacedComponents: VitalComponentKey[];
  totalCost: number;
  notes?: string;
}

export interface SystemSettings {
  geminiApiKey: string;
  waNumber: string;
  waGatewayUrl: string;
  telegramBotToken: string;
  telegramChatId: string;
  enableWaNotification: boolean;
  enableTelegramNotification: boolean;
  adminPin: string;
  updatedAt?: string;
}

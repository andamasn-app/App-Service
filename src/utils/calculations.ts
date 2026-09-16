import { Vehicle, ProcessedVehicle, ServiceLog, VitalComponentKey, ComponentWearInfo } from '../types';
import { VITAL_COMPONENTS_SPECS } from '../data/initialData';

export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  if (!s) return null;

  // Format YYYY-MM-DD
  if (s.length === 10 && s[4] === '-' && s[7] === '-') {
    const y = Number(s.substring(0, 4));
    const m = Number(s.substring(5, 7)) - 1;
    const d = Number(s.substring(8, 10));
    const dt = new Date(y, m, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // Format DD-MM-YYYY
  if (s.length === 10 && s[2] === '-' && s[5] === '-') {
    const d = Number(s.substring(0, 2));
    const m = Number(s.substring(3, 5)) - 1;
    const y = Number(s.substring(6, 10));
    const dt = new Date(y, m, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
}

export function formatDateId(dateStr: string | null | undefined): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr || '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function formatCurrency(amount: number | string | undefined, forceShow = true): string {
  const num = Number(amount) || 0;
  if (!forceShow) return 'Rp ***.***';
  return 'Rp ' + num.toLocaleString('id-ID');
}

export function getMonthName(monthNumber: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[monthNumber - 1] || '';
}

export function getMonthNameShort(monthNumber: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  return months[monthNumber - 1] || '';
}

export function calculateComponentWear(
  car: Vehicle,
  compKey: VitalComponentKey,
  allLogs: ServiceLog[]
): ComponentWearInfo {
  const spec = VITAL_COMPONENTS_SPECS[compKey];
  const vLogs = allLogs.filter(
    l => l.vehicleId === car.id || l.vehicleId === car.plate
  );

  // Find most recent log where this component was replaced or serviced
  let lastLog: ServiceLog | null = null;

  for (const log of vLogs) {
    const inReplacedList = Array.isArray(log.replacedComponents) && log.replacedComponents.includes(compKey);
    const inItemsList = Array.isArray(log.items) && log.items.some(it => {
      const name = (it.name || '').toLowerCase();
      return spec.keywords.some(kw => name.includes(kw));
    });

    if (inReplacedList || inItemsList) {
      lastLog = log;
      break;
    }
  }

  const currentKm = Number(car.currentKm) || 0;
  let lastKm = 0;
  let lastDate: Date | null = null;
  let lastRecord = 'Belum tercatat penggantian';

  if (lastLog) {
    lastKm = Number(lastLog.km) || 0;
    lastDate = parseDate(lastLog.date);
    lastRecord = `${formatDateId(lastLog.date)} (${lastKm.toLocaleString('id-ID')} KM) @ ${lastLog.workshop}`;
  } else if (car.lastServiceKm && Number(car.lastServiceKm) > 0) {
    lastKm = Number(car.lastServiceKm);
    lastDate = parseDate(car.lastServiceDate);
    lastRecord = `Baseline Awal (${lastKm.toLocaleString('id-ID')} KM)`;
  }

  const kmElapsed = Math.max(0, currentKm - lastKm);
  const kmPercent = Math.round((kmElapsed / spec.km) * 100);

  const now = new Date();
  let monthsElapsed = 0;
  if (lastDate) {
    monthsElapsed = Math.max(
      0,
      (now.getFullYear() - lastDate.getFullYear()) * 12 + (now.getMonth() - lastDate.getMonth())
    );
  }
  const monthPercent = Math.round((monthsElapsed / spec.months) * 100);

  const finalPercent = Math.min(100, Math.max(kmPercent, monthPercent));
  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (finalPercent >= 85) status = 'danger';
  else if (finalPercent >= 65) status = 'warning';

  return {
    key: compKey,
    label: spec.shortName,
    text: `${kmElapsed.toLocaleString('id-ID')} / ${spec.km.toLocaleString('id-ID')} KM (${monthsElapsed} Bln)`,
    percent: finalPercent,
    lastRecord,
    status,
    kmElapsed,
    monthsElapsed,
    maxKm: spec.km,
    maxMonths: spec.months
  };
}

export function processVehicle(car: Vehicle, allLogs: ServiceLog[]): ProcessedVehicle {
  const vLogs = allLogs
    .filter(l => l.vehicleId === car.id || l.vehicleId === car.plate)
    .sort((a, b) => {
      const tA = parseDate(a.date)?.getTime() || 0;
      const tB = parseDate(b.date)?.getTime() || 0;
      if (tB !== tA) return tB - tA;
      return (Number(b.km) || 0) - (Number(a.km) || 0);
    });

  const routineLogs = vLogs.filter(l => l.isRoutine && Number(l.km) > 0);

  let lastServiceKm = 0;
  let lastServiceDateStr: string | null = null;

  if (routineLogs.length > 0) {
    lastServiceKm = Number(routineLogs[0].km) || 0;
    lastServiceDateStr = routineLogs[0].date;
  } else if (car.lastServiceKm && Number(car.lastServiceKm) > 0) {
    lastServiceKm = Number(car.lastServiceKm);
    lastServiceDateStr = car.lastServiceDate || null;
  } else {
    lastServiceKm = Number(car.currentKm) || 0;
    lastServiceDateStr = car.lastServiceDate || null;
  }

  const lastWorkshop = vLogs.length > 0 ? (vLogs[0].workshop || 'Belum Ada') : 'Belum Ada';

  let intervalKm = 7000;
  if (car.customIntervalKm && car.customIntervalKm > 0) {
    intervalKm = car.customIntervalKm;
  } else if (lastWorkshop.toLowerCase().includes('nasmoco')) {
    intervalKm = 10000;
  }

  const currentKm = Number(car.currentKm) || 0;
  const diffKm = Math.max(0, currentKm - lastServiceKm);
  const remainingKm = intervalKm - diffKm;
  const kmPercent = Math.min(100, Math.round((diffKm / intervalKm) * 100));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let isDateDanger = false;
  let isDateWarning = false;
  let daysRemaining: number | null = null;
  let datePercent = 0;
  let nextServiceDateStr = '-';

  if (lastServiceDateStr) {
    const lastD = parseDate(lastServiceDateStr);
    if (lastD) {
      // Add 6 calendar months safely
      const targetMonth = lastD.getMonth() + 6;
      const nextD = new Date(lastD.getFullYear(), targetMonth, lastD.getDate());
      nextD.setHours(0, 0, 0, 0);
      nextServiceDateStr = formatDateId(nextD.toISOString().substring(0, 10));

      daysRemaining = Math.ceil((nextD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysRemaining <= 0) {
        isDateDanger = true;
        datePercent = 100;
      } else if (daysRemaining <= 30) {
        isDateWarning = true;
        datePercent = Math.min(100, Math.round(((180 - daysRemaining) / 180) * 100));
      } else {
        datePercent = Math.min(100, Math.round(((180 - daysRemaining) / 180) * 100));
      }
    }
  }

  let remainingKmStr = '';
  if (remainingKm > 0) {
    remainingKmStr = `Sisa ${remainingKm.toLocaleString('id-ID')} KM`;
  } else if (remainingKm === 0) {
    remainingKmStr = 'Tepat 0 KM';
  } else {
    remainingKmStr = `Lewat ${Math.abs(remainingKm).toLocaleString('id-ID')} KM`;
  }

  let daysRemainingStr = '';
  if (daysRemaining === null) {
    daysRemainingStr = '-';
  } else if (daysRemaining > 0) {
    daysRemainingStr = `Sisa ${daysRemaining} Hari`;
  } else if (daysRemaining === 0) {
    daysRemainingStr = 'Jatuh Tempo Hari Ini';
  } else {
    daysRemainingStr = `Lewat ${Math.abs(daysRemaining)} Hari`;
  }

  let routineStatus: { label: string; type: 'safe' | 'warning' | 'danger'; percent: number } = {
    label: `Sisa ${remainingKm.toLocaleString('id-ID')} KM`,
    type: 'safe',
    percent: Math.max(kmPercent, datePercent)
  };

  if (diffKm >= intervalKm || isDateDanger) {
    let label = '';
    if (diffKm >= intervalKm && daysRemaining !== null && daysRemaining < 0) {
      label = `Lewat ${(diffKm - intervalKm).toLocaleString('id-ID')} KM / ${Math.abs(daysRemaining)} Hari`;
    } else if (diffKm >= intervalKm) {
      label = `Lewat ${(diffKm - intervalKm).toLocaleString('id-ID')} KM`;
    } else if (daysRemaining !== null && daysRemaining < 0) {
      label = `Lewat ${Math.abs(daysRemaining)} Hari`;
    } else {
      label = 'Jatuh Tempo Waktu';
    }
    routineStatus = { label, type: 'danger', percent: 100 };
  } else if (diffKm >= (intervalKm - 1500) || isDateWarning) {
    let label = `Sisa ${remainingKm.toLocaleString('id-ID')} KM`;
    if (daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 30) {
      label = `Sisa ${daysRemaining} Hari`;
    }
    routineStatus = { label, type: 'warning', percent: Math.max(kmPercent, datePercent) };
  }

  let urgencyScore = -9999;
  if (!car.isUnderService) {
    const kmRatio = diffKm / intervalKm;
    let timeRatio = 0;
    if (lastServiceDateStr) {
      const lastD = parseDate(lastServiceDateStr);
      if (lastD) {
        const daysElapsed = Math.max(0, Math.ceil((today.getTime() - lastD.getTime()) / (1000 * 60 * 60 * 24)));
        timeRatio = daysElapsed / 180;
      }
    }
    urgencyScore = Math.max(kmRatio, timeRatio);
  }

  return {
    ...car,
    _logs: vLogs,
    _lastServiceKm: lastServiceKm,
    _lastServiceDateStr: lastServiceDateStr,
    _lastWorkshop: lastWorkshop,
    _serviceIntervalKm: intervalKm,
    _routineStatus: routineStatus,
    _remainingKm: remainingKm,
    _remainingKmStr: remainingKmStr,
    _daysRemaining: daysRemaining,
    _daysRemainingStr: daysRemainingStr,
    _urgencyScore: urgencyScore,
    _nextServiceKm: lastServiceKm + intervalKm,
    _nextServiceDateStr: nextServiceDateStr
  };
}

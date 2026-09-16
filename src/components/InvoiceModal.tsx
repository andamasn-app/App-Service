import React from 'react';
import { Vehicle, ServiceLog } from '../types';
import { formatDateId, formatCurrency } from '../utils/calculations';
import { Printer, X, FileText } from 'lucide-react';

interface InvoiceModalProps {
  log?: ServiceLog | null;
  spkData?: {
    vehicle: Vehicle;
    workshop: string;
    date: string;
    km: number;
    notes: string;
    aiDiagnosis?: string;
  } | null;
  vehicle?: Vehicle | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  log,
  spkData,
  vehicle,
  onClose
}) => {
  const isSpk = Boolean(spkData);

  const carPlate = isSpk ? spkData?.vehicle.plate : (vehicle?.plate || log?.vehicleId || '-');
  const carModel = isSpk ? spkData?.vehicle.model : (vehicle?.model || '-');
  const driverName = isSpk ? spkData?.vehicle.driver : (vehicle?.driver || 'Sopir UNS');
  const workshopName = isSpk ? spkData?.workshop : (log?.workshop || 'Nasmoco');
  const serviceDate = isSpk ? spkData?.date : (log?.date || '');
  const odometerKm = isSpk ? spkData?.km : (log?.km || 0);
  const docNumber = isSpk 
    ? `SPK-UNS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` 
    : (log?.invoiceNo || `INV-UNS-${log?.id || '001'}`);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 border border-slate-300 w-full max-w-2xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 my-auto font-sans">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>{isSpk ? 'Pratinjau Surat Perintah Kerja (SPK)' : 'Faktur Digital Pemeliharaan Armada'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-4 print:space-y-4">
          
          {/* Official Letterhead (Kop Surat) */}
          <div className="border-b-2 border-slate-900 pb-3 text-center space-y-0.5">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
              KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
            </h2>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-sky-900 uppercase">
              UNIVERSITAS SEBELAS MARET
            </h1>
            <p className="text-[11px] text-slate-600 font-medium">
              Bagian Sarana & Prasarana • Pengelolaan Pemeliharaan Armada Kampus
            </p>
            <p className="text-[10px] text-slate-500">
              Jalan Ir. Sutami 36A, Kentingan, Surakarta 57126 • Telp. (0271) 646994
            </p>
          </div>

          {/* Title and Reference Number */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                {isSpk ? 'SURAT PERINTAH KERJA (SPK) BENGKEL' : 'BUKTI / FAKTUR PEMELIHARAAN ARMADA'}
              </span>
              <p className="text-[11px] text-slate-500">
                Sistem Terintegrasi Monitoring Perawatan (AUTOMAN UNS)
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono font-black text-sm text-slate-900 block">
                {docNumber}
              </span>
              <span className="text-xs text-slate-600">
                Tanggal: {formatDateId(serviceDate)}
              </span>
            </div>
          </div>

          {/* Info Metadata Box */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                Armada / Kendaraan:
              </span>
              <span className="font-mono font-black text-slate-900 text-sm">
                {carPlate}
              </span>
              <p className="text-slate-700 font-medium">{carModel}</p>
              <p className="text-slate-500 text-[11px]">Sopir: {driverName}</p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                Bengkel Pelaksana:
              </span>
              <span className="font-bold text-slate-900 text-sm block">
                {workshopName}
              </span>
              <p className="text-slate-600 font-mono text-[11px]">
                Odometer: {Number(odometerKm).toLocaleString('id-ID')} KM
              </p>
              <p className="text-slate-500 text-[11px]">
                Status: {isSpk ? 'Surat Pengantar Servis' : (log?.isRoutine ? 'Servis Berkala' : 'Perbaikan Insidental')}
              </p>
            </div>
          </div>

          {/* Body content based on whether it's an SPK or a Finished Invoice */}
          {isSpk ? (
            <div className="space-y-3">
              <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl text-xs space-y-1.5">
                <span className="font-bold text-amber-900 uppercase block text-[11px]">
                  Keluhan & Instruksi Pengerjaan:
                </span>
                <p className="text-slate-800 whitespace-pre-line font-mono text-[11px] leading-relaxed">
                  {spkData?.notes || 'Servis berkala dan inspeksi menyeluruh.'}
                </p>
              </div>

              {spkData?.aiDiagnosis && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-slate-700 uppercase block text-[10px]">
                    Catatan Rekomendasi Diagnostik Otomotif:
                  </span>
                  <p className="text-slate-600 font-mono text-[10px] whitespace-pre-line max-h-36 overflow-y-auto">
                    {spkData.aiDiagnosis}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-300 font-bold text-slate-700 uppercase text-[10px]">
                    <th className="p-2.5 w-10 text-center">No</th>
                    <th className="p-2.5">Uraian Suku Cadang & Jasa Pengerjaan</th>
                    <th className="p-2.5 text-right w-36">Biaya (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(log?.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="p-2.5 font-medium text-slate-800">{it.name}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(it.cost, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-black text-sm text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="p-2.5 text-right uppercase">
                      Total Biaya Pengerjaan:
                    </td>
                    <td className="p-2.5 text-right font-mono text-emerald-700">
                      {formatCurrency(log?.totalCost || 0, true)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Signatures Area */}
          <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-600">
            <div className="space-y-12">
              <p>Pengemudi / Pengaju,</p>
              <p className="font-bold text-slate-900 underline">
                ( {driverName || '...............................'} )
              </p>
            </div>
            <div className="space-y-12">
              <p>Perwakilan Bengkel / Bagian Pemeliharaan,</p>
              <p className="font-bold text-slate-900 underline">
                ( ......................................... )
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "AUTOMAN UNS API" });
  });

  // AI Diagnostic endpoint
  app.post("/api/diagnose", async (req, res) => {
    try {
      const {
        vehicle,
        currentKm,
        lastServiceKm,
        complaints,
        wearStatus,
        recentLogs,
        customApiKey
      } = req.body;

      const ai = getGeminiClient(customApiKey);

      if (!ai) {
        // Fallback to internal expert automotive diagnostic engine
        return res.json({
          source: "local-expert-rules",
          message: "API Key belum terpasang di environment server. Menggunakan Diagnostik SOP Otomotif Standar UNS.",
          diagnosis: generateLocalSopDiagnosis(vehicle, currentKm, lastServiceKm, wearStatus, complaints)
        });
      }

      const prompt = `Anda adalah Master Specialist Diagnostik Otomotif & Senior Fleet Maintenance Manager Universitas Sebelas Maret (UNS) Surakarta.
Tugas Anda: Buat analisis teknis diagnosa dan susun Perintah Kerja Bengkel (Work Order) yang sangat spesifik, akurat, profesional, dan actionable berdasarkan data riil armada UNS berikut:

[DATA KENDARAAN]
- Plat Nomor: ${vehicle?.plate || 'Unknown'}
- Tipe / Model: ${vehicle?.model || 'Unknown'}
- Bahan Bakar / Mesin: ${vehicle?.fuelType || 'Bensin / Diesel'}
- Pengemudi / Sopir: ${vehicle?.driver || 'Sopir Kampus'}
- Kategori: ${vehicle?.category || 'Operasional'}
- Odometer Saat Ini: ${Number(currentKm || 0).toLocaleString('id-ID')} KM
- Odometer Servis Rutin Terakhir: ${Number(lastServiceKm || 0).toLocaleString('id-ID')} KM
- Selisih Jarak Tempuh: ${(Number(currentKm || 0) - Number(lastServiceKm || 0)).toLocaleString('id-ID')} KM

[MATRIKS KONDISI 8 KOMPONEN VITAL]
${wearStatus || 'Data keausan belum tersedia'}

[KELUHAN PENGEMUDI / UNIT]
${complaints || 'Pemeriksaan berkala / servis rutin'}

[HISTORIS SERVIS TERAKHIR]
${recentLogs || 'Tidak ada riwayat'}

Instruksi Output:
Berikan rekomendasi dengan format terstruktur rapi:
1. 🔍 DIAGNOSA UTAMA & STATUS KELAYAKAN ARMADA (Uraian singkat 2-3 kalimat)
2. 🛠️ PERINTAH PENGERJAAN & PENGGANTIAN SUKU CADANG PRIORITAS (Daftar poin dengan jenis oli/part spesifik sesuai model mobil)
3. ⚠️ ITEM KRITIS YANG HARUS DIINSPEKSI MEKANIK (Pengecekan sistem keselamatan seperti rem, ban, suspensi, kelistrikan)
4. ⏱️ ESTIMASI WAKTU PENGERJAAN DI BENGKEL
Gunakan bahasa Indonesia formal, teknis namun mudah dipahami, tanpa basa-basi pembuka/penutup.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah sistem pakar diagnostik mekanik armada kampus UNS yang teliti dan presisi."
        }
      });

      const responseText = response.text || "";
      return res.json({
        source: "gemini-3.8-flash",
        diagnosis: responseText.trim()
      });
    } catch (err: any) {
      console.error("Gemini diagnosis error:", err);
      // Fallback gracefully
      const { vehicle, currentKm, lastServiceKm, wearStatus, complaints } = req.body || {};
      return res.json({
        source: "local-expert-rules",
        warning: `Gemini API fallback (${err?.message || 'Network error'})`,
        diagnosis: generateLocalSopDiagnosis(vehicle, currentKm, lastServiceKm, wearStatus, complaints)
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server AUTOMAN UNS running at http://localhost:${PORT}`);
  });
}

function generateLocalSopDiagnosis(
  vehicle: any,
  currentKm: number = 0,
  lastServiceKm: number = 0,
  wearStatus: string = "",
  complaints: string = ""
): string {
  const model = (vehicle?.model || "").toLowerCase();
  const kmDiff = Math.max(0, currentKm - lastServiceKm);
  const isDiesel = model.includes("diesel") || model.includes("hiace") || model.includes("panther") || model.includes("l300");
  const isHybrid = model.includes("hybrid") || model.includes("zenix") || model.includes("hv");

  const lines: string[] = [];

  lines.push(`🔍 DIAGNOSA UTAMA & STATUS KELAYAKAN ARMADA`);
  if (kmDiff >= 10000) {
    lines.push(`Kendaraan telah melampaui jadwal servis berkala sejauh ${kmDiff.toLocaleString('id-ID')} KM. Diperlukan servis menyeluruh untuk mencegah keausan komponen internal mesin.`);
  } else if (kmDiff >= 7000) {
    lines.push(`Kendaraan mendekati batas toleransi pelumasan (${kmDiff.toLocaleString('id-ID')} KM sejak servis terakhir). Disarankan segera masuk bengkel mitra.`);
  } else {
    lines.push(`Status pelumasan mesin dalam batas wajar (${kmDiff.toLocaleString('id-ID')} KM berjalan). Pengerjaan difokuskan pada keluhan pengemudi dan inspeksi rutin.`);
  }

  lines.push(`\n🛠️ PERINTAH PENGERJAAN & PENGGANTIAN SUKU CADANG PRIORITAS`);
  if (isHybrid) {
    lines.push(`• Ganti Oli Mesin Toyota Genuine Oil (TGO) 0W-20 Full Synthetic & Filter Oli Genuine.`);
    lines.push(`• Inspeksi saringan udara pendingin baterai traksi Hybrid di bawah jok baris kedua.`);
  } else if (isDiesel) {
    lines.push(`• Ganti Oli Mesin Diesel SAE 10W-30 / 15W-40 CI-4/CJ-4 & Filter Oli Genuine.`);
    lines.push(`• Kuras / periksa Water Sedimenter & Ganti Filter Solar (Fuel Filter).`);
  } else {
    lines.push(`• Ganti Oli Mesin SAE 5W-30 / 10W-40 & Filter Oli Genuine.`);
  }

  if (currentKm >= 40000 && currentKm % 40000 < 5000) {
    lines.push(`• Jadwal Kuras Oli Transmisi (CVT/ATF Matic Fluid) dan Oli Gardan belakang.`);
    lines.push(`• Penggantian Busi Pengapian Iridium Set.`);
  }

  if (complaints && complaints.trim()) {
    lines.push(`• Penanganan khusus keluhan: "${complaints.trim()}"`);
  }

  lines.push(`\n⚠️ ITEM KRITIS YANG HARUS DIINSPEKSI MEKANIK`);
  lines.push(`• Periksa ketebalan Brake Pad (kampas rem) depan & belakang, bersihkan debu kampas rem.`);
  lines.push(`• Uji tegangan Aki 12V (CCA dan voltase saat starter beban).`);
  lines.push(`• Cek tekanan angin 4 roda, kedalaman alur ban, dan lakukan rotasi / balancing roda.`);
  lines.push(`• Periksa hembusan AC dan ganti Filter Udara Kabin bila berdebu.`);

  lines.push(`\n⏱️ ESTIMASI WAKTU PENGERJAAN: 1.5 s/d 3 Jam (tergantung antrean bengkel mitra)`);

  return lines.join("\n");
}

startServer();

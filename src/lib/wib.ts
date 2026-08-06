/**
 * Utilitas untuk mengelola zona waktu WIB (Asia/Jakarta, UTC+7)
 * Memastikan absensi mereset tepat pada pukul 00:00 WIB
 */

export function getTodayWIBRange(): { startOfDay: Date; endOfDay: Date; dateStrWIB: string } {
  const now = new Date();
  // Gunakan formatter Asia/Jakarta untuk mendapatkan tanggal tahun-bulan-hari di WIB
  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value || "2026";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const day = parts.find((p) => p.type === "day")?.value || "01";

  const dateStrWIB = `${year}-${month}-${day}`; // contoh "2026-08-03"

  // 00:00:00.000 WIB = UTC-7 jam dari hari tersebut
  // Di ISO string: `${year}-${month}-${day}T00:00:00.000+07:00`
  const startOfDay = new Date(`${dateStrWIB}T00:00:00.000+07:00`);
  const endOfDay = new Date(`${dateStrWIB}T23:59:59.999+07:00`);

  return { startOfDay, endOfDay, dateStrWIB };
}

export function formatWIBTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function formatWIBDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

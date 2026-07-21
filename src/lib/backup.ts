import { validateAppData, type AppData } from "./app-data";

export const BACKUP_FORMAT_VERSION = 1;
export type BackupEnvelope = { formatVersion: number; exportedAt: string; app: "Comptes"; storage: "localStorage"; data: AppData };

export function createBackup(data: AppData): BackupEnvelope {
  return { formatVersion: BACKUP_FORMAT_VERSION, exportedAt: new Date().toISOString(), app: "Comptes", storage: "localStorage", data };
}

export function readBackup(value: unknown) {
  if (!value || typeof value !== "object") return { valid: false as const, reason: "El fitxer JSON no té el format correcte." };
  const envelope = value as Partial<BackupEnvelope>;
  if ("formatVersion" in envelope && envelope.formatVersion !== BACKUP_FORMAT_VERSION) return { valid: false as const, reason: "La versió del fitxer de còpia no és compatible." };
  return validateAppData(envelope.data ?? value);
}

export function backupFilename(date = new Date()) {
  const day = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  return `comptes-backup-${day}-${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}.json`;
}

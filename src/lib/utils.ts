import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPct(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "—";
  return `${Number(value * 100).toFixed(digits)}%`;
}

export function formatSigned(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "—";
  const n = Number(value.toFixed(digits));
  const abs = Math.abs(n).toFixed(digits);
  if (n > 0) return `+${abs}`;
  if (n < 0) return `-${abs}`;
  return abs;
}

export function formatScore(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return Number(value.toFixed(digits)).toFixed(digits);
}

export function formatSpread(spread: number): string {
  if (spread === 0) return "PK";
  return formatSigned(spread, spread % 1 === 0 ? 0 : 1);
}

export function americanOdds(american: number): string {
  return american > 0 ? `+${american}` : `${american}`;
}

export function formatUnits(n: number, signed = false): string {
  const abs = Math.abs(n).toFixed(2);
  if (signed) {
    if (n > 0) return `+${abs}u`;
    if (n < 0) return `-${abs}u`;
  }
  return `${abs}u`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

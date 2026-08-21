export type FormatFileSizeOptions = {
  /** Use 1024-based units (KiB, MiB…) instead of 1000-based. Defaults to false. */
  binary?: boolean;
  /** Maximum fraction digits. Defaults to 1 (0 for bytes). */
  maximumFractionDigits?: number;
  /** BCP 47 locale for the number format. */
  locale?: string;
};

const DECIMAL_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;
const BINARY_UNITS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] as const;

/**
 * Formats a byte count for `AttachmentDescription`, e.g. `2.4 MB`.
 */
export function formatFileSize(
  bytes: number,
  options: FormatFileSizeOptions = {}
): string {
  const { binary = false, maximumFractionDigits, locale } = options;

  if (!Number.isFinite(bytes) || bytes < 0) return "";

  const base = binary ? 1024 : 1000;
  const units = binary ? BINARY_UNITS : DECIMAL_UNITS;

  let exponent = 0;
  let value = bytes;
  while (value >= base && exponent < units.length - 1) {
    value /= base;
    exponent += 1;
  }

  const digits = maximumFractionDigits ?? (exponent === 0 ? 0 : 1);
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: digits,
  }).format(value);

  return `${formatted} ${units[exponent]}`;
}

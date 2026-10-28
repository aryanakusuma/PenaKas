/**
 * Format angka ke mata uang Rupiah (contoh: Rp 1.500.000)
 */
export const formatIDR = (value: number): string => {
  if (isNaN(value)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format angka dengan titik pemisah ribuan (contoh: 1.500.000)
 */
export const formatNumberWithDots = (val: number | string): string => {
  const num = typeof val === 'number' ? val : parseInt(val.replace(/\D/g, ''), 10);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('id-ID').format(num);
};

/**
 * Parsing string format angka ber-titik kembali ke number murni
 */
export const parseCleanNumber = (val: string): number => {
  const clean = val.replace(/\D/g, '');
  return clean ? parseInt(clean, 10) : 0;
};

/**
 * Format tanggal ke tampilan Bahasa Indonesia (contoh: 28 Oktober 2026)
 */
export const formatDateIndo = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return dateStr;
  }
};

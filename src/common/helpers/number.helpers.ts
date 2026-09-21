export const numberHelpers = {
  addOne: (index: number) => index + 1,
  mod: (a: number, b: number) => a % b,
  check: (a: number, b: number) => a < b,
  multiply: (a: number, b: number) => a * b,
  divide: (a: number, b: number) => (b !== 0 ? a / b : 0),
  subtract: (a: number, b: number) => a - b,
  isNumber: (val: any) =>
    (typeof val === 'number' && !isNaN(val)) ||
    (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))),
  formatRupiah: (angka: any) => {
    if (angka == null || angka === undefined || angka === '') {
      return 'Not set';
    }
    const num = typeof angka === 'number' ? angka : Number(angka);
    if (isNaN(num)) {
      return String(angka);
    }
    return num.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    });
  },
};

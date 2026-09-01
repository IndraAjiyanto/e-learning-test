export const numberHelpers = {
  addOne: (index: number) => index + 1,
  mod: (a: number, b: number) => a % b,
  check: (a: number, b: number) => a < b,
  multiply: (a: number, b: number) => a * b,
  divide: (a: number, b: number) => (b !== 0 ? a / b : 0),
  subtract: (a: number, b: number) => a - b,
  formatRupiah: (angka: number) => {
    if (angka == null || angka === undefined) {
      return 'Not set';
    }
    return angka.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    });
  },
};

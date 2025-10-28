# Setup LibreOffice untuk Konversi PPT

## 1. Install LibreOffice

### Windows:

1. Download LibreOffice dari: https://www.libreoffice.org/download/download/
2. Install LibreOffice (biasanya di `C:\Program Files\LibreOffice`)
3. Pastikan path di `libreoffice.service.ts` sesuai dengan lokasi instalasi Anda

### Cek Instalasi:

```bash
# Di Command Prompt atau PowerShell
"C:\Program Files\LibreOffice\program\soffice.exe" --version
```

## 2. Install ImageMagick (Opsional - untuk convert PDF ke PNG)

### Windows:

1. Download ImageMagick dari: https://imagemagick.org/script/download.php
2. Install dengan opsi "Install legacy utilities (e.g. convert)"
3. Restart terminal/command prompt

### Cek Instalasi:

```bash
magick --version
```

## 3. Install NPM Package (Alternatif untuk ImageMagick)

Jika tidak ingin install ImageMagick, bisa gunakan `pdf-poppler`:

```bash
npm install pdf-poppler
```

**ATAU gunakan package lain:**

```bash
# Alternatif 1: pdf2pic (memerlukan GraphicsMagick atau ImageMagick)
npm install pdf2pic

# Alternatif 2: pdf-to-png-converter
npm install pdf-to-png-converter
```

## 4. Cara Penggunaan di Controller

### Opsi A: Menggunakan ImageMagick (Recommended)

```typescript
// Sudah terintegrasi di libreoffice.service.ts
// Akan otomatis convert PPT → PDF → PNG per slide
const slidePaths = await this.libreOfficeService.convertPptToPng(
  tmpPath,
  slideOutputDir,
);
```

### Opsi B: Menggunakan pdf-poppler

```typescript
// Install: npm install pdf-poppler
const slidePaths = await this.libreOfficeService.convertPptToPngAlternative(
  tmpPath,
  slideOutputDir,
);
```

### Opsi C: Hanya convert ke PDF (tanpa PNG)

```typescript
// Jika tidak perlu gambar per slide, cukup PDF
const pdfPath = await this.libreOfficeService.convertPptToPdf(
  tmpPath,
  outputDir,
);
```

## 5. Konfigurasi Path LibreOffice

Jika LibreOffice terinstall di lokasi berbeda, update di `libreoffice.service.ts`:

```typescript
constructor() {
  // Sesuaikan dengan lokasi instalasi LibreOffice Anda
  this.libreOfficePath = 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';

  // ATAU gunakan environment variable
  // this.libreOfficePath = process.env.LIBREOFFICE_PATH || 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';
}
```

Atau tambahkan di `.env`:

```
LIBREOFFICE_PATH="C:\Program Files\LibreOffice\program\soffice.exe"
```

## 6. Testing

Test apakah LibreOffice berfungsi:

```typescript
// Di controller atau service
const isInstalled = await this.libreOfficeService.checkLibreOfficeInstalled();
console.log('LibreOffice installed:', isInstalled);
```

## Troubleshooting

### Error: "LibreOffice not found"

- Pastikan LibreOffice sudah terinstall
- Cek path di `libreoffice.service.ts`
- Restart terminal/command prompt

### Error: "ImageMagick not available"

- Install ImageMagick atau
- Gunakan alternatif: `npm install pdf-poppler`
- Update method di controller untuk gunakan `convertPptToPngAlternative`

### Error: "Failed to convert PPT to PDF"

- Pastikan file PPT tidak corrupt
- Cek apakah LibreOffice bisa membuka file secara manual
- Cek log error untuk detail lebih lanjut

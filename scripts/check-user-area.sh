#!/usr/bin/env bash
#
# check-user-area.sh — pagar untuk PR area student (role `user`).
#
# Dipakai oleh setiap work package di docs/user-area-design-alignment-plan.md.
# Melaporkan sisa-sisa yang seharusnya sudah hilang setelah sebuah tab dirapikan,
# plus cek wajib "tidak menyentuh admin/super_admin".
#
# Pakai:
#   scripts/check-user-area.sh                 # seluruh area student
#   scripts/check-user-area.sh <file|dir>...   # hanya path yang kamu sentuh
#
# Exit code: 0 bila bersih, 1 bila masih ada temuan.
set -uo pipefail
cd "$(dirname "$0")/.."

DEFAULT_PATHS=(src/views/user src/views/partials/user)
if [ "$#" -gt 0 ]; then PATHS=("$@"); else PATHS=("${DEFAULT_PATHS[@]}"); fi

EXISTING=()
for p in "${PATHS[@]}"; do [ -e "$p" ] && EXISTING+=("$p"); done
if [ "${#EXISTING[@]}" -eq 0 ]; then
  echo "check-user-area: tidak ada path yang bisa diperiksa: ${PATHS[*]}"
  exit 0
fi

fail=0

# $1 = judul, $2 = regex, $3 = keterangan perbaikan
scan() {
  local title="$1" pattern="$2" fix="$3" hits
  hits=$(grep -rnE "$pattern" "${EXISTING[@]}" --include='*.hbs' 2>/dev/null || true)
  if [ -n "$hits" ]; then
    fail=1
    echo "✗ $title — $(printf '%s\n' "$hits" | wc -l | tr -d ' ') temuan"
    echo "  perbaikan: $fix"
    printf '%s\n' "$hits" | cut -c1-160 | sed 's/^/    /' | head -20
    local n; n=$(printf '%s\n' "$hits" | wc -l | tr -d ' ')
    [ "$n" -gt 20 ] && echo "    ... dan $((n - 20)) lagi"
    echo
  else
    echo "✓ $title"
  fi
}

echo "== Area student: ${EXISTING[*]}"
echo

scan "Ukuran font hardcoded (text-[NNpx])" \
     'text-\[[0-9]+px\]' \
     "pakai komponen super_admin (page_header/description/text_field) atau key sizeClass."

scan "Shadow berat gaya lama (shadow-[0px_0px_...])" \
     'shadow-\[0px_0px_[0-9]+px' \
     "kartu memakai 'rounded-xl border border-[#d9d9d9] bg-white p-5'; input/tombol tanpa shadow."

scan "Tautan mati (href=\"#\")" \
     'href="#"' \
     "arahkan ke rute sungguhan, atau sembunyikan elemennya bila datanya belum ada."

# Font BUKAN kegagalan: sapuan font adalah pekerjaan terjadwal (WP6), dan tabel
# celah di rencana memang melacaknya sebagai angka. Dilaporkan saja.
font_hits=$(grep -rnE 'font-(montserrat|sans)\b' "${EXISTING[@]}" --include='*.hbs' 2>/dev/null | wc -l | tr -d ' ')
if [ "$font_hits" -gt 0 ]; then
  echo "· Font per-elemen di luar komponen: $font_hits (informasi, bukan kegagalan)"
  echo "  judul ikut komponen; teks isi memakai font-inter. Lihat WP6."
else
  echo "✓ Tidak ada font per-elemen di luar komponen"
fi
echo

# Cek wajib: PR area student tidak boleh menyentuh admin/super_admin.
echo "== Cek jejak admin/super_admin di working tree"
admin_touched=$(git status --porcelain | grep -iE 'admin' || true)
if [ -n "$admin_touched" ]; then
  fail=1
  echo "✗ ada file admin/super_admin yang berubah:"
  printf '%s\n' "$admin_touched" | sed 's/^/    /'
  echo "  Bila ini memang PR komponen (lihat aturan 2 di docs/user-area-design-alignment-plan.md),"
  echo "  sebutkan di deskripsi PR dan minta review pemilik halaman super admin."
else
  echo "✓ tidak ada file admin/super_admin yang berubah"
fi

echo
if [ "$fail" -eq 0 ]; then echo "Bersih."; else echo "Masih ada temuan di atas."; fi
exit "$fail"

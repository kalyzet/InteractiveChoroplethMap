# CHANGELOG

Semua perubahan penting pada DemographicMap didokumentasikan di sini.
Format mengikuti [Semantic Versioning](https://semver.org/) — perubahan
breaking ditandai **BREAKING**.

## [5.0.1] — Restrukturisasi Direktori

- Library bundle pindah ke `dist/map-renderer.js` (pola konvensional distribusi)
- Dokumentasi teknis & riwayat versi dipindah ke `docs/` — hanya `README.md`
  yang tersisa di root
- `data-source.js` dihapus (contoh static adapter kini terdokumentasi inline
  di README bagian Data Adapter; mockup asli tersimpan di `docs/MOCKUP-V1.md`)
- Semua referensi path di demo, contoh, dan dokumentasi diperbarui
- README ditulis ulang untuk publik + lisensi proyek: **MIT** (`LICENSE`)

## [5.0.0] — Packaging & i18n Plugin (V5)

- Locale kini berupa **plugin**: `DemographicMap.registerLocale("kode", {...})`
  + opsi `locale: "kode"` (string) — menambah bahasa baru tidak menyentuh kode inti
- **BREAKING**: file `country-names.js` dihapus, diganti `locales/id.js`;
  opsi `locale` tidak lagi menerima global `countryNamesID` (pakai `"id"`
  atau objek pemetaan langsung)
- Distribusi resmi sebagai single-file bundle: satu `<script src="map-renderer.js">`
- Dokumentasi API lengkap di README + `CHANGELOG.md` (file ini)

## [4.0.0] — Data Adapter (V4)

- Opsi `dataAdapter`: `{ type: "static" | "json" | "api", url?, parse?, data? }`
  atau fungsi async kustom — semua resolve ke `{ kodeISO: nilai }`
- **BREAKING**: `init()` kini mengembalikan Promise (resolve instance jsVectorMap,
  `null` saat gagal memuat data)
- Overlay status "Memuat data..." / pesan error merah + callback `onError(err)`
- Demo utama memuat data via fetch JSON (`data/reader-stats.json`)
- Persiapan skema SQLite: `database/schema.sql`

## [3.2.0] — Penyempurnaan UX Legenda & Zoom

- Tombol tutup legenda diganti ikon mata toggle (SVG) — sembunyi/tampil dua arah;
  ikon diposisikan kiri-bawah card legenda
- Tombol zoom +/− disamakan gayanya dengan UI library (24px, flex-centered)
- Style UI library di-inject saat `init()` (bukan menunggu `onLoaded`)

## [3.1.0] — Respons Masukan Pengguna

- **BREAKING**: opsi `zoom: boolean` diganti granular `zoomOnScroll` +
  `zoomButtons` (shorthand `zoom: true` masih didukung); scroll-zoom dimatikan
  di demo karena membajak scroll halaman
- Legenda lebih ringkas, bisa ditutup, dipindah ke pojok kiri bawah

## [3.0.0] — Fitur Visual & Interaksi (V3)

- Zoom/pan interaktif + dukungan sentuh
- Legenda gradasi otomatis dari `colorScale` (overlay HTML, posisi 4 sudut)
- Callback event: `onLoaded`, `onRegionHover(code, value)`, `onRegionClick(code, value)`
- Media query responsif ≤768px

## [2.0.0] — Refactor Public API (V2)

- **BREAKING**: renderer tidak lagi mengeksekusi dirinya sendiri —
  titik masuk tunggal `DemographicMap.init(options)` dengan DEFAULTS
- Helper warna & logika dienkapsulasi dalam IIFE
- Contoh konsumsi kedua: `examples/demo-penjualan/`

## [1.x] — Prototipe Kloroplet Dasar (V1)

- Render peta dunia jsVectorMap dengan tema gelap
- Gradasi biru manual via `series.regions[0].attributes` (workaround bug OrdinalScale:
  array `scale` membuat negara berdata ter-render hitam)
- Tooltip `[Nama Negara] [X]% of Readers`; negara tanpa data tampil nama saja
- Terjemahan nama negara Indonesia (172/172 region dataset ter-cover)

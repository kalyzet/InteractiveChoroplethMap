# ARCHITECTURE.md — Dokumentasi Arsitektur & Progress

Dokumen ini mencatat arsitektur teknis serta progres perkembangan proyek Peta Demografi per versi.

---

## Versi 1 (V1) — Prototipe Kloroplet Dasar

**Status:** Selesai dan teruji berjalan

### Ringkasan

Versi awal ini merupakan fondasi prototipe standalone: peta kloroplet dunia yang merender data persentase pembaca per negara dengan tema _dark mode_, lengkap dengan tooltip dinamis pelacak kursor. Fitur zoom/pan sengaja ditunda ke versi berikutnya.

### Struktur File

```
InteractiveChoroplethMap/
├── index.html        # Kerangka UI + pemanggilan CDN
├── style.css         # Tata letak, tema gelap, styling tooltip
├── data-source.js    # Layer data (objek readerStats)
├── country-names.js  # Layer terjemahan nama negara (bahasa Indonesia)
├── map-renderer.js   # Logika inti render & interaksi
├── README.md         # Spesifikasi fitur + panduan menjalankan
├── DESIGN.md         # Pedoman desain visual
├── TODO.md           # Checklist fase pengerjaan
└── MOCKUP-V1.md      # Mockup data 24 negara
```

### Komponen & Tanggung Jawab

| Komponen | Peran | Detail Implementasi |
|---|---|---|
| `index.html` | Kerangka UI | Kontainer `<div id="map-container">`; memuat jsvectormap v1.5.3 + dataset `world.js` via CDN jsdelivr; urutan load: library → data → renderer |
| `style.css` | Presentasi | Background body `#333333`; kontainer full viewport (`100vh`); override tooltip: `rgba(0,0,0,0.75)`, border-radius 4px, box-shadow |
| `data-source.js` | Manajemen Data | Objek global `readerStats` — pemetaan kode ISO 3166-1 alpha-2 → nilai persentase (24 negara sesuai MOCKUP-V1.md) |
| `country-names.js` | Terjemahan | Objek global `countryNamesID` — pemetaan kode ISO 3166-1 alpha-2 → nama negara bahasa Indonesia (249 entri, mencakup seluruh 172 region di dataset `world.js`) |
| `map-renderer.js` | Logika Inti | Inisialisasi `jsVectorMap`, konfigurasi `regionStyle`, kalkulasi gradasi biru manual + injeksi via `attributes`, handler `onRegionTooltipShow` |

### Alur Data (Data Flow)

```
Halaman dimuat
      │
      ▼
jsVectorMap fetch dataset "world" (GeoJSON → SVG path)
      │
      ▼
series.regions membaca readerStats
      │
      ├─ Kalkulasi gradasi manual (interpolateColor)
      │   rasio = value / nilaiMaks → lerp "#b8d8f2" → "#0d3a66"
      │
      ▼
Injeksi warna via series.regions[0].attributes { ID: "#...", US: "#...", ... }
      │
      └─ Negara tanpa data ──────────► tetap fill default "#f2f2f2"
      │
      ▼
Event hover pada region
      │
      ▼
onRegionTooltipShow(event, tooltip, code)
      │
      ├─ Nama: countryNamesID[code] (fallback nama Inggris bawaan)
      │
      ├─ Ada data ──► tooltip: "[Nama Negara] [X]% of Readers"
      └─ Tanpa data ► tooltip: "[Nama Negara]" saja
```

### Keputusan Teknis

1. **Pemisahan layer data dari logika UI** — `data-source.js` terisolasi agar kelak mudah diganti sumbernya (misal SQLite/API) tanpa menyentuh `map-renderer.js`.
2. **Gradasi warna dihitung manual** — series jsvectormap memakai `OrdinalScale` yang hanya memetakan key → warna (`this._scale[value]`), bukan interpolasi numerik. Konfigurasi awal berupa array `scale: ["#b8d8f2", "#0d3a66"]` membuat semua negara berdata ter-render hitam (fill invalid → default SVG). Solusi: helper `interpolateColor()` melakukan lerp hex manual berdasarkan rasio `value / nilaiMaks`, lalu hasilnya disuntikkan lewat opsi resmi `series.regions[0].attributes` (pemetaan langsung kode negara → warna).
   > Catatan: opsi `normalizeFunction` adalah fitur warisan jvectormap jQuery dan tidak berefek apa pun di jsvectormap.
3. **Zoom dinonaktifkan** — `zoomOnScroll: false` + `zoomButtons: false`; fitur zoom disepakati menyusul di iterasi berikutnya.
4. **Negara tanpa data tanpa persentase** — tooltip hanya menampilkan nama negara, bukan "0%", agar tidak menyesatkan antara "tidak ada data" vs "bernilai nol". (Catatan: `RU` bernilai `0.0` eksplisit di mockup, sehingga tetap tampil sebagai 0%.)
5. **Server lokal wajib** — penyajian via `file://` memicu CORS error; dokumentasi cara menjalankan tersedia di README bagian 4.

### Checklist Progress

- [x] Fase 1 — Persiapan struktur file & CDN
- [x] Fase 2 — Integrasi HTML & CSS (dark mode, kontainer responsif)
- [x] Fase 3 — Logika JavaScript (mockup data, render, regionStyle, tooltip dinamis)
- [x] Fase 4 — Pengujian via server lokal (semua aset HTTP 200, tanpa CORS error)

### Batasan Versi Ini

- Belum ada fitur zoom-in/zoom-out interaktif
- Data masih statis (hardcoded di `data-source.js`)
- Belum ada legenda skala warna pada UI
- Baris komentar pada `MOCKUP-V1.md` belum dipertahankan identik di `data-source.js` (hanya penamaan negara yang sedikit dirapikan)

---

## Versi 2 (V2) — Refactor Public API

**Status:** Selesai dan teruji berjalan

### Ringkasan

`map-renderer.js` diubah dari skrip eksekusi-langsung menjadi mini-library `DemographicMap` (pola IIFE) dengan satu titik masuk: `DemographicMap.init(options)`. Projek konsumen kini cukup memanggil `init()` dengan konfigurasinya sendiri — tanpa menyentuh file library. Terbukti lewat contoh projek kedua (`examples/demo-penjualan/`) yang memakai data, palet ungu, selektor, dan format tooltip berbeda.

### Struktur File

```
InteractiveChoroplethMap/
├── index.html                  # Demo utama
├── style.css                   # Tata letak & tema demo utama
├── map-renderer.js             # INTI LIBRARY — DemographicMap v2.0.0 (IIFE)
├── main.js                     # Entry demo: pemanggilan DemographicMap.init()
├── data-source.js              # Data mockup (konsumsi demo, bukan bagian inti)
├── country-names.js            # Locale bahasa Indonesia (opsional)
├── examples/
│   └── demo-penjualan/         # Contoh "projek kedua" — bukti reusability
│       └── index.html          #   palet ungu, zoom aktif, data berbeda
└── *.md                        # README, DESIGN, TODO, MOCKUP-V1, PLAN, ARCHITECTURE
```

### API Publik

```js
DemographicMap.init({
  selector: "#map-container",           // target kontainer peta
  map: "world",                          // dataset jsvectormap
  data: { ID: 85, US: 30.5 },           // { kodeISO: nilai }
  colorScale: ["#b8d8f2", "#0d3a66"],   // gradasi [nilaiRendah, nilaiTinggi]
  defaultFill: "#f2f2f2",               // warna negara tanpa data
  hoverOpacity: 0.8,
  locale: countryNamesID,                // opsional: { kodeISO: namaLokal }
  tooltipFormat: "{name} {value}% of Readers",
  zoom: false,                           // scroll-zoom + tombol zoom
  onRegionHover: fn(code, value),        // callback opsional
  onRegionClick: fn(code, value),
  onLoaded: fn()
});
```

Semua opsi punya default yang identik dengan tampilan V1; `init()` mengembalikan instance jsVectorMap untuk kontrol lanjutan oleh konsumen.

### Perubahan dari V1

| Aspek | V1 | V2 |
|---|---|---|
| Titik masuk | Eksekusi langsung saat load | `DemographicMap.init(options)` |
| Konfigurasi | Hardcoded di dalam renderer | Opsi + DEFAULTS |
| Helper warna | Global (tumpah ke scope) | Dienkapsulasi di IIFE |
| Konsumsi ulang | Edit file library | Cukup panggil `init()` dengan config baru |

### Pengujian

- Semua aset HTTP 200 via server lokal (demo utama + demo kedua)
- Smoke test Node dengan mock `jsVectorMap`: selector, zoom flags, `defaultFill`, hasil gradasi (`ID → #0d3a66`, `RU → #b8d8f2`, `US → #6389ac`) dan format tooltip terverifikasi

---

## Versi 3 (V3) — Fitur Visual & Interaksi

**Status:** Selesai dan teruji berjalan

### Ringkasan

Library kini mendukung zoom/pan, legenda gradasi warna otomatis, dan callback event. Demo utama mengaktifkan semuanya; responsivitas mobile ditambahkan via media query CSS.

### Fitur Baru

1. **Zoom/pan interaktif** — opsi granular `zoomOnScroll` dan `zoomButtons` (default keduanya `false`); `zoom: true` tetap didukung sebagai shorthand mengaktifkan keduanya. Rekomendasi UX: gunakan tombol saja agar scroll halaman tidak terbajak
2. **Legenda gradasi otomatis** — opsi `legend: { title?, unit?, position? }` merender overlay HTML ringkas berisi bar gradien CSS (`linear-gradient` dari `colorScale`) plus label `0` → nilai maksimum data, lengkap dengan tombol tutup (×). Style di-inject sekali per halaman (`injectLegendCss`), posisi tersedia di 4 sudut kontainer
3. **Callback event** — `onLoaded()`, `onRegionHover(code, value)`, `onRegionClick(code, value)` untuk hook logika per-projek
4. **Responsif mobile** — media query ≤768px: kontainer 70vh + tooltip lebih ringkas

### Penyempurnaan UX (v3.1.0 – v3.2.0, masukan pengguna)

- Scroll-zoom dinonaktifkan di demo utama karena membajak scroll halaman dan terasa mengganggu — kini cukup tombol zoom
- Legenda dipindah ke pojok kiri bawah (bottom-right menutupi area Asia Tenggara) dan dibuat lebih ringkas
- v3.2.0: tombol tutup (×) diganti **ikon mata toggle** — klik untuk sembunyikan (ikon berubah jadi mata tertutup) dan klik lagi untuk tampilkan; panel legenda tidak pernah hilang permanen; ikon diposisikan di kiri-bawah card legenda
- Tombol zoom +/− bawaan jsvectormap disamakan gayanya dengan card UI library (24px, border-radius 6px, background transparan gelap, rata kiri 15px); style UI kini di-inject sekaligus saat `init()`, bukan menunggu `onLoaded`

### Pengujian

- Smoke test Node: versi 3.0.0, style legenda ter-inject saat `onLoaded` (bukan saat init), callback pass-through terdaftar benar
- Semua aset HTTP 200 (demo utama + demo penjualan)

---

## Versi 4 (V4) — Data Adapter

**Status:** Selesai dan teruji berjalan

### Ringkasan

Renderer kini tidak lagi terikat pada objek statis: `init()` menerima opsi `dataAdapter` yang memuat data secara async sebelum peta dirender. Semua adapter menghasilkan kontrak data yang sama — objek datar `{ kodeISO: nilai }`.

### Kontrak Data Adapter

| Bentuk | Perilaku |
|---|---|
| `data: { ID: 85 }` | Static object (kompatibilitas V1–V3, tetap didukung) |
| `{ type: "static", data }` | Sama dengan di atas, eksplisit |
| `{ type: "json", url }` | `fetch(url)` → JSON datar `{code: value}` |
| `{ type: "api", url, parse? }` | `fetch` endpoint; respons diekstrak lewat callback `parse(json)` |
| fungsi async | Bebas sumbernya (WebSocket, IndexedDB, kelak SQLite), wajib resolve objek datar |

### Perilaku Baru

- `DemographicMap.init()` sekarang mengembalikan **Promise** → resolve berupa instance jsVectorMap, atau `null` bila gagal memuat data
- **Overlay status**: "Memuat data peta..." saat loading; pesan merah saat error (`onError(err)` terpanggil)
- File `data-source.js` tidak lagi dimuat oleh demo utama — statusnya menjadi contoh penggunaan static adapter
- **Persiapan SQLite**: `database/schema.sql` berisi skema `countries` + `reader_stats` + view `latest_reader_stats` (snapshot terbaru per negara) sebagai kontrak untuk adapter SQLite di masa depan

### Pengujian

- Smoke test Node (8 kasus): static/data lama, json, api+parse, custom async fn, HTTP error (overlay error + onError + resolve null), tipe tak dikenal, overlay loading
- Semua aset HTTP 200 termasuk `data/reader-stats.json`; demo utama memuat data via fetch JSON tanpa CORS error

---

## Versi 5 (V5) — Packaging & i18n Plugin

**Status:** Selesai dan teruji berjalan — roadmap V1–V5 tuntas

### Ringkasan

Library distibusikan sebagai **single-file bundle** (global `DemographicMap`, satu `<script>`, tanpa build tooling) dan sistem bahasa diubah menjadi **plugin locale**: menambah bahasa baru tidak pernah menyentuh kode inti.

### Perubahan

1. **Locale plugin API** — `DemographicMap.registerLocale("kode", { ISO: nama, ... })`; opsi `locale` kini menerima string kode registry (`"id"`) atau objek kustom langsung. Locale tidak dikenal → fallback aman ke nama bawaan dataset
2. **BREAKING**: `country-names.js` dihapus → diganti `locales/id.js` yang memanggil `registerLocale("id", ...)`; global `countryNamesID` tidak ada lagi
3. **Versioning semantik + changelog** — riwayat lengkap v1–v5 di `CHANGELOG.md`
4. **Dokumentasi API lengkap** di README bagian 5: tabel semua opsi, pola data adapter, plugin bahasa, contoh setup minimal

### Struktur File Akhir

> Setelah restrukturisasi direktori (lihat CHANGELOG 5.0.1), library pindah ke
> `dist/` dan seluruh dokumentasi teknis ke `docs/`. Pohon di bawah mencerminkan
> kondisi terkini.

```
InteractiveChoroplethMap/
├── index.html                  # Demo utama
├── style.css                   # Tema demo utama
├── main.js                     # Entry demo utama
├── src/
│   └── map-renderer.core.js    # SUMBER CANONICAL library
├── scripts/
│   └── build-dist.mjs          # Generator dist/ (tanpa dependency)
├── dist/
│   ├── map-renderer.js         # Varian IIFE — hasil generate
│   └── demographic-map.esm.js  # Varian ESM — hasil generate
├── locales/
│   └── id.js                   # Plugin locale bahasa Indonesia
├── data/
│   └── reader-stats.json       # Data demo utama (via adapter json)
├── database/
│   ├── schema.sql              # Skema SQLite
│   ├── build_demo_db.py        # Generator peta.db
├── examples/
│   ├── demo-penjualan/         # Contoh projek kedua
│   └── demo-sqlite/            # Demo SQLite runtime (+ peta.db)
└── docs/                       # ARCHITECTURE, CHANGELOG, DESIGN,
                                # PLAN, TODO, MOCKUP-V1 + README di root
```

### Pengujian

- Smoke test Node: registerLocale valid/invalid, locale string terdaftar/tak dikenal, objek kustom, evaluasi `locales/id.js`
- Verifikasi tooltip end-to-end dengan mock: `US → "Amerika Serikat 30.5% of Readers"`, `IE → "Irlandia"`
- Semua aset HTTP 200

---

## Versi 5.1 — Distribusi ES Module

**Status:** Selesai dan teruji berjalan

### Ringkasan

Distribusi ganda dari satu sumber canonical: `src/map-renderer.core.js`
(satu-satunya tempat edit kode inti) dibangun oleh
`scripts/build-dist.mjs` (Node murni, tanpa dependency) menjadi dua varian:

| Varian | Konsumsi |
|---|---|
| `dist/map-renderer.js` (IIFE) | `<script src="dist/map-renderer.js">` → global `DemographicMap` |
| `dist/demographic-map.esm.js` | `import DemographicMap from ...` / named exports |

Kedua varian meng-attach `globalThis.DemographicMap`, sehingga plugin locale
(`locales/*.js`) kompatibel di kedua mode tanpa perubahan apa pun.

### Pengujian

- Smoke test Node 7 kasus: IIFE (VERSION 5.1.0, init, registerLocale), ESM
  (named + default export), plugin locale `"id"` lewat global di mode ESM,
  konsistensi versi antar varian

---

## Ekstensi: Adapter SQLite Runtime (pasca-V5)

**Status:** Selesai dan teruji berjalan

Realisasi backlog "adapter runtime SQLite" — **tanpa perubahan pada library inti**,
memanfaatkan adapter fungsi async kustom dari V4:

- `database/build_demo_db.py` — skrip Python bawaan (modul `sqlite3`) untuk
  generate `examples/demo-sqlite/peta.db` sesuai `database/schema.sql`;
  data memuat dua periode untuk membuktikan view `latest_reader_stats`
  mengambil snapshot terbaru saja
- `examples/demo-sqlite/index.html` — demo ketiga: engine SQLite dimuat sebagai
  WebAssembly (sql.js via CDN), file `.db` di-fetch, lalu view dipetakan ke
  format `{ kodeISO: nilai }` oleh adapter kustom
- Palet cokelat-krem (`#f5deb3` → `#8b4513`) untuk membedakan dari dua demo lain

### Pengujian

- Verifikasi isi database langsung via Python: view mengembalikan 24 entri
  snapshot terbaru (ID → 85.5, bukan 85.0 periode Juli)
- Semua aset HTTP 200 (halaman demo, peta.db 20 KB, library, locale)

---

## Rencana Versi Berikutnya (Backlog)

- [x] Publish ke GitHub Releases — https://github.com/kalyzet/InteractiveChoroplethMap/releases
- [ ] Publish ke npm

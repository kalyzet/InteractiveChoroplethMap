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

## Rencana Versi Berikutnya (Backlog)

- [ ] Aktifkan zoom/pan interaktif (`zoomOnScroll`, tombol zoom)
- [ ] Sumber data eksternal (SQLite / API endpoint) menggantikan mockup statis
- [ ] Legenda gradasi warna sebagai indikator skala persentase
- [ ] Responsivitas lanjutan untuk layar mobile

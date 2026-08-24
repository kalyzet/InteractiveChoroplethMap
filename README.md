# DemographicMap

> Mini-library JavaScript murni untuk peta kloroplet (choropleth) dunia yang interaktif — satu file bundle, tanpa build tooling, tanpa framework.

[![Version](https://img.shields.io/badge/version-5.1.0-blue)](docs/CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)
[![GitHub](https://img.shields.io/badge/repo-kalyzet%2FInteractiveChoroplethMap-181717?logo=github)](https://github.com/kalyzet/InteractiveChoroplethMap)
[![Dependency](https://img.shields.io/badge/library-jsvectormap%201.5.3-orange)](https://github.com/themustafaomar/jsvectormap)
[![Stack](https://img.shields.io/badge/stack-vanilla%20JS%20%7C%20HTML%20%7C%20CSS-green)]()

DemographicMap mengemas visualisasi choropleth â€” pewarnaan negara berdasarkan nilai data, tooltip dinamis pelacak kursor, legenda gradasi otomatis, dan zoom â€” ke dalam API tunggal `DemographicMap.init()`. Dirancang sebagai _standalone web utility_: modular, dapat dipakai ulang antar projek, dan cukup dijalankan lewat `<script>` biasa.

## Fitur

- ðŸ—ºï¸ **Choropleth dinamis** â€” gradasi warna kontinu dihitung dari rasio nilai data
- ðŸ’¬ **Tooltip interaktif** â€” format teks kustom dengan token `{name}` dan `{value}`, melacak posisi kursor secara presisi
- ðŸ“Š **Legenda otomatis** â€” bar gradien + label skala, bisa disembunyikan/tampilkan via ikon mata
- ðŸ” **Zoom & pan** â€” tombol zoom bergaya konsisten atau scroll-zoom opsional
- ðŸ”Œ **Data adapter** â€” static object, fetch JSON, endpoint API, atau fungsi async kustom (termasuk SQLite runtime via sql.js)
- ðŸŒ **Plugin locale** â€” terjemahan nama negara per bahasa tanpa menyentuh kode inti
- ðŸ“± **Responsif** â€” media query bawaan untuk layar mobile

## Demo

| Halaman                                                | Isi                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| `/`                                                    | Demo utama: data pembaca 24 negara via fetch JSON, locale Indonesia |
| [`examples/demo-penjualan/`](examples/demo-penjualan/) | Projek konsumen kedua: palet ungu, zoom aktif, legenda              |
| [`examples/demo-sqlite/`](examples/demo-sqlite/)       | Data langsung dari file SQLite (`peta.db`) di browser               |

## Menjalankan

Proyek harus disajikan lewat HTTP server lokal (membuka `index.html` langsung via `file://` memicu CORS error):

```bash
python -m http.server
```

Lalu buka `http://localhost:8000`.

Alternatif: ekstensi **Live Server** (VS Code) atau `npx serve`.

## Menggunakan Library

### Setup Minimal

```html
<!-- Dependency eksternal -->
<script src="https://cdn.jsdelivr.net/npm/jsvectormap@1.5.3/dist/js/jsvectormap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jsvectormap@1.5.3/dist/maps/world.js"></script>

<!-- Library + plugin (urutan penting) -->
<script src="dist/map-renderer.js"></script>
<script src="locales/id.js"></script>
<!-- opsional -->

<div id="map-container"></div>
```

```js
DemographicMap.init({
    selector: '#map-container',
    locale: 'id',
    colorScale: ['#b8d8f2', '#0d3a66'],
    legend: { title: 'Pembaca' },
    zoomButtons: true,
});
```

`init()` mengembalikan **Promise** â†’ resolve instance jsVectorMap, atau `null` bila gagal memuat data.

### Distribusi ES Module

Bagi projek berbasis module, gunakan varian ESM â€” API identik:

```js
import DemographicMap from "./dist/demographic-map.esm.js";
// atau: import { init, registerLocale, VERSION } from "./dist/demographic-map.esm.js";

DemographicMap.init({ selector: "#peta", locale: "id" });
```

Kedua varian dibangun dari satu sumber yang sama (`src/`) dan selalu sinkron.
Varian ESM tetap meng-attach `globalThis.DemographicMap` sehingga plugin locale
berformat `<script>` tetap kompatibel.

### Referensi Opsi

| Opsi                         | Tipe               | Default                        | Keterangan                                                                                      |
| ---------------------------- | ------------------ | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| `selector`                   | string             | `"#map-container"`             | Kontainer target render                                                                         |
| `map`                        | string             | `"world"`                      | Dataset jsVectorMap                                                                             |
| `data`                       | object             | `{}`                           | Static adapter: `{ "ID": 85, ... }`                                                             |
| `dataAdapter`                | object \| function | `null`                         | Sumber data async (lihat [Data Adapter](#data-adapter)); menimpa `data`                         |
| `colorScale`                 | [hex, hex]         | biru                           | Gradasi warna `[nilaiRendah, nilaiTinggi]`                                                      |
| `defaultFill`                | hex                | `"#f2f2f2"`                    | Warna negara tanpa data                                                                         |
| `hoverOpacity`               | number             | `0.8`                          | Opasitas saat hover                                                                             |
| `locale`                     | string \| object   | `null`                         | Kode plugin terdaftar (`"id"`) atau objek `{ "US": "Amerika Serikat" }`                         |
| `tooltipFormat`              | string             | `"{name} {value}% of Readers"` | Token `{name}` & `{value}`                                                                      |
| `zoomOnScroll`               | boolean            | `false`                        | Zoom via scroll (perhatikan: membajak scroll halaman)                                           |
| `zoomButtons`                | boolean            | `false`                        | Tombol +/âˆ’ di pojok kiri atas                                                                   |
| `legend`                     | boolean \| object  | `false`                        | `{ title?, unit?, position? }` â€” posisi: `bottom-right`, `bottom-left`, `top-right`, `top-left` |
| `onLoaded()`                 | function           | `null`                         | Peta selesai dirender                                                                           |
| `onRegionHover(code, value)` | function           | `null`                         | Hover pada region                                                                               |
| `onRegionClick(code, value)` | function           | `null`                         | Klik region                                                                                     |
| `onError(err)`               | function           | `null`                         | Gagal memuat data                                                                               |

## Data Adapter

Semua adapter resolve ke kontrak yang sama â€” objek datar `{ kodeISO: nilai }`:

```js
// 1. Static object (tanpa dataAdapter)
DemographicMap.init({ selector: '#peta', data: { ID: 85, US: 30 } });

// 2. Fetch JSON datar { "ID": 85, ... }
DemographicMap.init({ selector: '#peta', dataAdapter: { type: 'json', url: 'data.json' } });

// 3. Endpoint API dengan struktur respons kustom
DemographicMap.init({
    selector: '#peta',
    dataAdapter: {
        type: 'api',
        url: '/api/stats',
        parse: (json) => json.data, // wajib menghasilkan { kodeISO: nilai }
    },
});

// 4. Fungsi async kustom (WebSocket, IndexedDB, SQLite via sql.js, dll)
DemographicMap.init({ selector: '#peta', dataAdapter: async () => ambilDataDariDatabase() });
```

Saat memakai `dataAdapter`, peta menampilkan overlay _"Memuat data..."_ hingga siap; kegagalan ditampilkan sebagai pesan error merah + callback `onError`.

### Contoh: SQLite Runtime (sql.js)

Memuat file `.db` langsung di browser tanpa backend â€” lihat [`examples/demo-sqlite/`](examples/demo-sqlite/):

```js
const SQL = await initSqlJs({ locateFile: (f) => CDN + f });
const res = await fetch('peta.db');
const db = new SQL.Database(new Uint8Array(await res.arrayBuffer()));

DemographicMap.init({
    selector: '#peta',
    dataAdapter: async () => {
        const stmt = db.prepare('SELECT code, value FROM latest_reader_stats');
        const data = {};
        while (stmt.step()) data[stmt.get()[0]] = stmt.get()[1];
        return data;
    },
});
```

File database dibuat/diperbarui dengan skrip bawaan (tanpa dependency):

```bash
python database/build_demo_db.py
```

Skema lengkap: [`database/schema.sql`](database/schema.sql) â€” view `latest_reader_stats` menghasilkan snapshot terbaru per negara.

## Plugin Bahasa

Bahasa adalah plugin â€” menambah bahasa baru tidak pernah menyentuh kode inti:

```js
// locales/es.js
DemographicMap.registerLocale('es', { US: 'Estados Unidos', ID: 'Indonesia' });

// aktifkan:
DemographicMap.init({ selector: '#peta', locale: 'es' });
```

Negara tanpa terjemahan otomatis fallback ke nama bawaan dataset. Plugin bawaan: [`locales/id.js`](locales/id.js) (249 entri, mencakup seluruh 172 region dataset dunia).

## Struktur Proyek

```
InteractiveChoroplethMap/
â”œâ”€â”€ index.html              # Demo utama
â”œâ”€â”€ style.css               # Tema demo utama
â”œâ”€â”€ main.js                 # Entry demo utama
â”œâ”€â”€ src/
â”‚   â””â”€â”€ map-renderer.core.js  # SUMBER CANONICAL library (satu-satunya tempat edit)
â”œâ”€â”€ scripts/
â”‚   â””â”€â”€ build-dist.mjs      # Generator: core -> kedua varian di dist/
â”œâ”€â”€ dist/
â”‚   â”œâ”€â”€ map-renderer.js     # Varian IIFE (global <script>) â€” hasil generate
â”‚   â””â”€â”€ demographic-map.esm.js  # Varian ES Module â€” hasil generate
â”œâ”€â”€ locales/
â”‚   â””â”€â”€ id.js               # Plugin locale bahasa Indonesia
â”œâ”€â”€ data/
â”‚   â””â”€â”€ reader-stats.json   # Data demo utama
â”œâ”€â”€ database/               # Skema SQLite + generator peta.db
â”œâ”€â”€ examples/               # Contoh projek konsumen lain
â””â”€â”€ docs/                   # Dokumentasi teknis & riwayat versi
```

Alur kerja library: edit `src/map-renderer.core.js` â†’ jalankan
`node scripts/build-dist.mjs` â†’ kedua varian di `dist/` diperbarui.

Prinsip pemisahan: logika library (`dist/`), layer data (`data/`, `database/`), plugin (`locales/`), contoh konsumen (`examples/`), dan dokumentasi (`docs/`) tidak saling bercampur.

## Dokumentasi Teknis

Dokumentasi mendalam tersedia di folder [`docs/`](docs/):

| Dokumen                                 | Isi                                     |
| --------------------------------------- | --------------------------------------- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arsitektur teknis & progres tiap versi  |
| [CHANGELOG.md](docs/CHANGELOG.md)       | Riwayat perubahan (semantic versioning) |
| [PLAN.md](docs/PLAN.md)                 | Roadmap pengembangan V1â€“V5              |
| [DESIGN.md](docs/DESIGN.md)             | Pedoman desain visual                   |
| [TODO.md](docs/TODO.md)                 | Checklist fase awal pengembangan        |
| [MOCKUP-V1.md](docs/MOCKUP-V1.md)       | Mockup data versi pertama               |

## Rencana Lanjutan

- [x] Publish ke [GitHub Releases](https://github.com/kalyzet/InteractiveChoroplethMap/releases)
- [x] Distribusi ES Module (`import DemographicMap from ...`)
- [ ] Publish ke npm

## Lisensi

Dirilis di bawah [Lisensi MIT](LICENSE).

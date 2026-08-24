Proyek ini adalah template pengembangan mandiri untuk merender peta kloroplet (choropleth) interaktif. Tujuannya adalah menampilkan persentase distribusi data demografi berdasarkan negara menggunakan manipulasi SVG.
Sebenarnya tidak sampai sekompleks membuat "framework" utuh dari awal, tapi lebih ke merakit sebuah template modular atau prototipe mandiri (standalone). Karena eksekusinya menggunakan HTML, CSS, dan JavaScript murni, pendekatannya memang terasa seperti merancang mini-framework sendiri.
Memisahkan alur sistem ke dalam beberapa modul spesifik sangat identik dengan prinsip saat membangun standalone web utility pada umumnya. Hal ini membuat logika pemrosesan data tidak bertumpuk dengan struktur tampilan.

Berikut adalah draf spesifikasi fitur Peta Demografi yang bisa kamu jadikan pedoman teknis:

### 1. Spesifikasi Fungsional Fitur

- **Visualisasi Kloroplet (Choropleth):** Poligon negara diwarnai secara dinamis berdasarkan nilai persentase (misal: 0% menggunakan abu-abu terang, >50% menggunakan gradasi biru pekat).
- **Interaksi Tooltip Dinamis:** Sistem memunculkan _floating box_ kustom berisi teks "[Nama Negara] [X]% of Readers" saat kursor masuk (_hover_) ke area negara tertentu.
- **Pelacakan Kursor (Mouse Tracking):** Posisi _tooltip_ harus secara presisi diperbarui mengikuti pergerakan sumbu X dan Y dari kursor _mouse_.
- **Skalabilitas Vektor:** Rendering menggunakan format SVG agar peta mendukung fitur _zoom-in/zoom-out_ interaktif dan tetap tajam di berbagai resolusi layar.

### 2. Arsitektur Modul Sistem

Pemisahan struktur ke dalam beberapa _file_ terisolasi sangat penting agar logika presentasi visual dan _layer_ data tidak bercampur.

- **`index.html` (Kerangka UI):** Bertugas menampung elemen kontainer (seperti `<div id="map-container">`) dan mengeksekusi pemanggilan CDN _library_ eksternal.
- **`style.css` (Tata Letak & Gaya):** Mengatur warna latar antarmuka menjadi gelap, mendesain _box-shadow_ pada _tooltip_, serta memastikan peta memenuhi ukuran layar dengan responsif.
- **`data-source.js` (Manajemen Data):** Berisi objek JSON statis yang memetakan kode wilayah (ISO 3166-1 alpha-2, seperti `ID`, `RU`, `US`) dengan data angka analitik persentase.
- **`map-renderer.js` (Logika Inti):** Berisi skrip JavaScript fungsional yang menarik data dari `data-source.js`, menyuntikkannya ke dalam _engine library_ peta, dan memanipulasi _event listener_ saat terjadi _hover_.

### 3. Alur Pemrosesan (Data Flow)

- **Inisialisasi DOM:** Saat halaman dimuat, skrip _renderer_ memanggil data koordinat dunia (GeoJSON) dan menggambar peta dasar (_base map_).
- **Data Binding:** Sistem mencocokkan kode negara dari _file_ koordinat dengan struktur JSON data pembaca, lalu mengkalkulasi properti _fill color_ (warna daratan) secara otomatis.
- **Render Parsial:** Perubahan data pada file konfigurasi hanya akan memicu pembaruan manipulasi DOM pada _tag path_ SVG spesifik, tanpa perlu memuat ulang keseluruhan halaman web.

### 4. Cara Menjalankan Proyek

Proyek ini **tidak bisa dijalankan langsung dengan membuka `index.html`** lewat file explorer (protokol `file://`). Penyajian berkas via protokol tersebut memicu kegagalan pemuatan aset eksternal yang dikenal sebagai _CORS error_, sehingga peta tidak akan terender.

Solusinya, sajikan proyek melalui server lokal sederhana bawaan Python:

```bash
python -m http.server
```

Perintah di atas akan menjalankan HTTP server statis pada direktori saat ini dan menyediakannya di `http://localhost:8000`. Buka alamat tersebut di browser untuk melihat peta.

Beberapa opsi tambahan yang bisa dipakai:

```bash
# Menentukan port kustom (misal: 3000)
python -m http.server 3000

# Menjalankan dari direktori proyek tanpa pindah folder
python -m http.server 8000 --directory path/ke/proyek

# Menentukan bind address tertentu (default: semua interface)
python -m http.server 8000 --bind 127.0.0.1
```

> Alternatif tanpa Python: ekstensi **Live Server** di VS Code, atau `npx serve` jika sudah terpasang Node.js.

Setelah server berjalan, uji interaksi dengan menggerakkan kursor di atas peta — negara dengan data akan tersorot gradasi biru dan menampilkan tooltip persentase pembaca.

### 5. Menggunakan DemographicMap sebagai Library

Sejak V2, logika inti peta dikemas sebagai mini-library mandiri dalam satu file bundle (`map-renderer.js`, global `DemographicMap`). Projek lain cukup memuat jsvectormap + library + plugin locale, lalu memanggil `init()` — tanpa pernah mengedit file library.

#### Setup Minimal

```html
<!-- Dependency eksternal -->
<script src="https://cdn.jsdelivr.net/npm/jsvectormap@1.5.3/dist/js/jsvectormap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jsvectormap@1.5.3/dist/maps/world.js"></script>

<!-- Library + plugin (urutan penting) -->
<script src="map-renderer.js"></script>
<script src="locales/id.js"></script>   <!-- opsional -->
```

#### Referensi Opsi `DemographicMap.init(options)`

| Opsi | Tipe | Default | Keterangan |
|---|---|---|---|
| `selector` | string | `"#map-container"` | Kontainer target render |
| `map` | string | `"world"` | Dataset jsVectorMap |
| `data` | object | `{}` | Static adapter: `{ "ID": 85, ... }` |
| `dataAdapter` | object\|function | `null` | Sumber data async (lihat tabel di bawah); menimpa `data` |
| `colorScale` | [hex, hex] | abu-biru | Gradasi warna `[nilaiRendah, nilaiTinggi]` |
| `defaultFill` | hex | `"#f2f2f2"` | Warna negara tanpa data |
| `hoverOpacity` | number | `0.8` | Opasitas saat hover |
| `locale` | string\|object | `null` | `"id"` (plugin terdaftar) atau objek `{ "US": "Amerika Serikat" }` |
| `tooltipFormat` | string | `"{name} {value}% of Readers"` | Token `{name}` & `{value}` |
| `zoomOnScroll` | boolean | `false` | Zoom via scroll (membajak scroll halaman!) |
| `zoomButtons` | boolean | `false` | Tombol +/− di pojok kiri atas |
| `legend` | boolean\|object | `false` | `{ title?, unit?, position? }` — posisi: `bottom-right` (default), `bottom-left`, `top-right`, `top-left` |
| `onLoaded()` | function | `null` | Peta selesai dirender |
| `onRegionHover(code, value)` | function | `null` | Hover pada region |
| `onRegionClick(code, value)` | function | `null` | Klik region |
| `onError(err)` | function | `null` | Gagal memuat data |

Return value: **Promise** → resolve instance jsVectorMap, atau `null` bila gagal.

#### Data Adapter

```js
// 1. Static object (tanpa dataAdapter)
DemographicMap.init({ selector: "#peta", data: { ID: 85, US: 30 } });

// 2. Fetch JSON datar { "ID": 85, ... }
DemographicMap.init({ selector: "#peta", dataAdapter: { type: "json", url: "data.json" } });

// 3. Endpoint API dengan struktur respons kustom
DemographicMap.init({
  selector: "#peta",
  dataAdapter: {
    type: "api",
    url: "/api/stats",
    parse: (json) => json.data   // wajib menghasilkan { kodeISO: nilai }
  }
});

// 4. Fungsi async kustom (WebSocket, IndexedDB, SQLite, dll)
DemographicMap.init({ selector: "#peta", dataAdapter: async () => ambilDataDariDatabase() });
```

#### Plugin Bahasa

```js
// locales/es.js
DemographicMap.registerLocale("es", { US: "Estados Unidos", ID: "Indonesia" });

// lalu aktifkan:
DemographicMap.init({ selector: "#peta", locale: "es", ... });
```

Menambah bahasa baru tidak pernah menyentuh kode inti — cukup file baru di folder `locales/`. Negara tanpa terjemahan otomatis fallback ke nama bawaan dataset.

#### Contoh Lengkap

Lihat `examples/demo-penjualan/index.html` — projek kedua dengan palet ungu, zoom aktif, legenda, dan data terpisah dari demo utama.

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

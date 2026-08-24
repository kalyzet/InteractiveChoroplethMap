Berikut adalah TODO list yang bisa kamu jadikan acuan pengerjaan:

### 1. Fase Persiapan & Desain UI

- Siapkan rancangan tata letak kasar atau palet warna di Figma agar tampilan peta selaras dengan gaya _dark mode_.
- Buat direktori proyek baru dan buat tiga _file_ utama: `index.html`, `style.css`, dan `main.js`.
- Siapkan tautan CDN untuk _library_ jsVectorMap dan _file_ data koordinat GeoJSON dunia.

### 2. Fase Integrasi HTML & CSS

- Susun kerangka dasar HTML5 dan tautkan _file_ eksternal CSS serta JavaScript dengan urutan yang benar.
- Buat elemen `<div id="demographic-map">` sebagai kontainer utama target _render_ peta.
- Tulis kode CSS untuk mengatur warna latar belakang _body_ dan menetapkan dimensi tinggi/lebar kontainer peta agar responsif di layar.

### 3. Fase Logika JavaScript (Data & Render)

- Buat variabel objek JSON di dalam `main.js` untuk menyimpan _mockup_ data persentase pembaca dari beberapa negara pengujian (misal: ID, RU, US).
- Tulis skrip inisialisasi jsVectorMap yang mengikat langsung ke selektor `#demographic-map`.
- Konfigurasikan parameter `regionStyle` untuk mengubah warna _fill_ daratan _default_ menjadi abu-abu terang, dan mengatur efek transisi saat di-_hover_.
- Aktifkan _event listener_ `onRegionTooltipShow` untuk memanipulasi teks _tooltip_ agar menampilkan persentase data secara dinamis berdasarkan negara yang ditunjuk kursor.

### 4. Fase Pengujian (Testing)

- Jalankan proyek lokal menggunakan ekstensi Live Server untuk memastikan sistem memuat data vektor tanpa terkena _CORS error_.
- Lakukan uji coba pergerakan _mouse_ di atas peta untuk memverifikasi apakah _tooltip_ sudah secara presisi melacak titik koordinat kursor.

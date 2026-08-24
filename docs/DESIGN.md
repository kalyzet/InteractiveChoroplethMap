### 1. Konsep Visual & Antarmuka (UI/UX)

- **Tema Warna:** Menggunakan pendekatan _dark mode_ dengan latar belakang kanvas abu-abu gelap (`#333333`) untuk menonjolkan elemen vektor peta.
- **Pemetaan Kloroplet:** Daratan negara _default_ dirender dengan abu-abu terang (`#f2f2f2`). Negara dengan data pembaca disorot menggunakan skala gradasi biru berdasarkan jumlah persentasenya.
- **Desain Tooltip:** Menggunakan kotak informasi mengambang berlatar gelap transparan dengan _border-radius_ tipis, dapat dirancang presisi terlebih dahulu menggunakan prinsip tata letak dasar di Figma.

### 2. Struktur Data & Integrasi

- **Format Geometri:** Mengandalkan _file_ GeoJSON ringan untuk merender poligon batas setiap negara di dunia ke dalam elemen SVG.
- **Skema JSON:** Memanfaatkan _array_ objek mandiri yang mengikat kode standar ISO negara (seperti `ID` untuk Indonesia, `RU` untuk Rusia) dengan nilai metrik persentase.
- **Skalabilitas Database:** Pemisahan _layer_ data dari UI ini menyiapkan kerangka yang sangat fleksibel, terutama jika kelak data persentase ingin ditarik langsung dari arsitektur _database_ seperti SQLite.

### 3. Logika Interaksi (User Flow)

- **Pelacakan Kursor:** Sistem secara _real-time_ mendeteksi koordinat sumbu X dan Y dari pergerakan _mouse_ di atas kontainer peta.
- **Pemicu Hover:** Menyentuh batas poligon suatu negara akan memicu transisi _opacity_, memberikan _feedback_ visual instan kepada pengguna tanpa jeda.
- **Injeksi Data Dinamis:** Sistem menangkap kode negara yang sedang disorot kursor, mencocokkannya dengan _layer_ JSON, lalu mencetak teks "[Nama Negara] [X]% of Readers" secara dinamis di dalam _tooltip_.

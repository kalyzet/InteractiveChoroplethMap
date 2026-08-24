# PLAN.md — Roadmap Pengembangan Template Peta Kloroplet

Dokumen ini memetakan arah pengembangan template dari prototipe standalone (V1) menjadi mini-framework yang dapat dipakai ulang di berbagai projek web.

## Visi

Mengubah prototipe peta kloroplet menjadi **library mandiri** dengan prinsip *configuration over modification*: projek konsumen tidak pernah mengedit isi library, cukup memanggil API dengan konfigurasinya sendiri.

### Hambatan Utama Saat Ini (hasil audit V1)

- `readerStats` dan `countryNamesID` adalah global object yang _hardwired_ ke renderer
- `new jsVectorMap(...)` langsung dieksekusi saat load — tidak ada titik masuk API
- Gradasi warna, selektor target, dan format tooltip tertanam di dalam logika
- Tidak ada mekanisme hook/event untuk kebutuhan kustom per-projek

---

## V2 — Refactor Public API ⬅ **prioritas berikutnya**

**Tujuan:** library bisa dikonsumsi tanpa menyentuh file internalnya.

### Rencana Perubahan

1. Ubah `map-renderer.js` menjadi factory function:

```js
DemographicMap.init({
  selector: "#map-container",
  data: readerStats,
  colorScale: ["#b8d8f2", "#0d3a66"],
  locale: countryNamesID,
  tooltipFormat: "{name} {value}% of Readers",
  zoom: false
});
```

2. Semua nilai yang sekarang hardcoded (selektor, warna skala, fallback fill, format teks) menjadi opsi dengan default yang sama seperti V1
3. Helper interpolasi warna (`interpolateColor`, dll) dienkapsulasi di dalam closure/scope library
4. `data-source.js` dan `country-names.js` berubah status menjadi "contoh konsumsi" — bukan bagian inti library

### Kriteria Selesai

- [x] Halaman demo tetap tampil identik dengan V1
- [x] Projek kedua (dummy) berhasil memakai library dengan data & palet warna berbeda hanya lewat konfigurasi → `examples/demo-penjualan/index.html`
- [x] Tidak ada lagi global variable wajib antar file inti (helper dienkapsulasi dalam IIFE)

---

## V3 — Fitur Visual & Interaksi

**Tujuan:** paritas fitur dengan peta demografi produksi pada umumnya.

- [ ] Aktifkan zoom/pan (`zoomOnScroll`, tombol zoom) — lanjutan keputusan V1
- [ ] Legenda gradasi warna sebagai indikator skala persentase
- [ ] Callback event: `onRegionClick`, `onRegionHover`, `onLoaded`
- [ ] Responsivitas lanjutan untuk layar mobile

### Kriteria Selesai

- [x] Zoom berfungsi mulus dan tooltip tetap akurat mengikuti kursor
- [x] Legenda muncul otomatis berdasarkan `colorScale`
- [x] Callback terpicu dan bisa diverifikasi lewat `console.log` di demo

---

## V4 — Data Adapter

**Tujuan:** realisasi skalabilitas database yang direncanakan DESIGN.md.

- [ ] Definisikan kontrak adapter: fungsi async yang resolve `{code: value}`
- [ ] Adapter bawaan: `staticObject` (default), `jsonUrl` (fetch), `apiEndpoint`
- [ ] State loading/error sederhana saat data belum siap
- [ ] Persiapan skema SQLite untuk kebutuhan projek mendatang

### Kriteria Selesai

- [x] Renderer tidak peduli asal data — semua adapter menghasilkan struktur sama
- [x] Demo memuat data via fetch JSON lokal tanpa CORS error

---

## V5 — Packaging & i18n

**Tujuan:** distribusi rapi dan dukungan multi-bahasa.

- [ ] Migrasi pola `<script src=...>` → ES Modules (`export`) atau bundel tunggal (IIFE)
- [ ] File terjemahan menjadi plugin locale opsional (`locale: 'id' | custom`)
- [ ] Versioning semantik + changelog
- [ ] Dokumentasi API lengkap di README/ARCHITECTURE
- [ ] (Opsional, jika dirasa layak) publish ke npm/GitHub publik

### Kriteria Selesai

- [x] Library terpakai via satu file bundel ATAU satu import ES Module
- [x] Menambah bahasa baru tidak mengubah kode inti

---

## Prinsip yang Dipertahankan Sepanjang Roadmap

1. **Vanilla JS murni** — tanpa dependency framework; jsVectorMap tetap satu-satunya dependency eksternal
2. **Arsitektur modular** — layer data, presentasi, dan logika selalu terpisah (warisan desain README)
3. **Dokumentasi hidup** — setiap versi tercatat di ARCHITECTURE.md; MOCKUP-V1.md menjadi preseden penamaan mockup per versi
4. **Kompatibilitas progresif** — tiap fase harus tetap lulus pengujian server lokal sebelum lanjut fase berikutnya

## Status Saat Ini

| Versi | Status |
|---|---|
| V1 — Prototipe kloroplet dasar | ✅ Selesai (lihat ARCHITECTURE.md) |
| V2 — Refactor Public API | ✅ Selesai (lihat ARCHITECTURE.md) |
| V3 — Fitur visual & interaksi | ✅ Selesai (lihat ARCHITECTURE.md) |
| V4 — Data adapter | ✅ Selesai (lihat ARCHITECTURE.md) |
| V5 — Packaging & i18n | ✅ Selesai (lihat ARCHITECTURE.md) |

**Roadmap V1–V5 tuntas.** Ekstensi pasca-roadmap: adapter runtime SQLite via sql.js (✅ selesai, lihat `examples/demo-sqlite/`) dan distribusi ES Module + publish GitHub Releases (✅ selesai). Sisa opsional: publish ke npm.

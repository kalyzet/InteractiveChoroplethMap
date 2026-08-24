// Entry demo: konsumsi library DemographicMap dengan konfigurasi projek ini.
// V4 — data dimuat via adapter fetch JSON; V5 — locale sebagai plugin ("id").
DemographicMap.init({
  selector: "#map-container",
  dataAdapter: { type: "json", url: "data/reader-stats.json" },
  locale: "id",
  colorScale: ["#b8d8f2", "#0d3a66"],
  tooltipFormat: "{name} {value}% of Readers",

  // V3 — zoom (tombol saja, tanpa membajak scroll halaman) & legenda
  zoomButtons: true,
  legend: { title: "Pembaca", position: "bottom-left" },

  // V3/V4 — callback untuk integrasi logika per-projek
  onLoaded() {
    console.log("[DemographicMap] Peta dimuat (v" + DemographicMap.VERSION + ")");
  },
  onRegionHover(code, value) {
    console.log("[DemographicMap] Hover:", code, "→", value);
  },
  onRegionClick(code, value) {
    console.log("[DemographicMap] Klik:", code, "→", value);
  },
  onError(err) {
    console.error("[DemographicMap] Gagal memuat data:", err.message);
  }
});

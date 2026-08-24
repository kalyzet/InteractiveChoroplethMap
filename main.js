// Entry demo: konsumsi library DemographicMap dengan konfigurasi projek ini.
DemographicMap.init({
  selector: "#map-container",
  data: readerStats,
  locale: countryNamesID,
  colorScale: ["#b8d8f2", "#0d3a66"],
  tooltipFormat: "{name} {value}% of Readers",

  // V3 — zoom (tombol saja, tanpa membajak scroll halaman) & legenda
  zoomButtons: true,
  legend: { title: "Pembaca", position: "bottom-left" },

  // V3 — callback untuk integrasi logika per-projek
  onLoaded() {
    console.log("[DemographicMap] Peta dimuat (v" + DemographicMap.VERSION + ")");
  },
  onRegionHover(code, value) {
    console.log("[DemographicMap] Hover:", code, "→", value);
  },
  onRegionClick(code, value) {
    console.log("[DemographicMap] Klik:", code, "→", value);
  }
});

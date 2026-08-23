// Entry demo: konsumsi library DemographicMap dengan konfigurasi projek ini.
DemographicMap.init({
  selector: "#map-container",
  data: readerStats,
  locale: countryNamesID,
  colorScale: ["#b8d8f2", "#0d3a66"],
  tooltipFormat: "{name} {value}% of Readers"
});

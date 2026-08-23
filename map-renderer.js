new jsVectorMap({
  selector: "#map-container",
  map: "world",

  // Fitur zoom menyusul
  zoomOnScroll: false,
  zoomButtons: false,

  regionStyle: {
    initial: {
      fill: "#f2f2f2"
    },
    hover: {
      fillOpacity: 0.8
    }
  },

  series: {
    regions: [
      {
        values: readerStats,
        scale: ["#b8d8f2", "#0d3a66"],
        normalizeFunction: "polynomial",
        attribute: "fill"
      }
    ]
  },

  onRegionTooltipShow(event, tooltip, code) {
    const regionName = tooltip.text();
    const value = readerStats[code];

    if (value !== undefined) {
      tooltip.text(`${regionName} ${value}% of Readers`);
    }
    // Negara tanpa data: hanya tampilkan nama (default)
  }
});

// jsvectormap tidak mendukung interpolasi gradasi numerik pada series
// (OrdinalScale hanya memetakan key -> warna), sehingga gradasi biru
// dihitung manual dan disuntikkan via opsi `attributes`.

const COLOR_MIN = "#b8d8f2"; // nilai rendah
const COLOR_MAX = "#0d3a66"; // nilai tinggi

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}

function rgbToHex(rgb) {
  return (
    "#" +
    rgb
      .map((c) => Math.round(c).toString(16).padStart(2, "0"))
      .join("")
  );
}

function interpolateColor(ratio) {
  const from = hexToRgb(COLOR_MIN);
  const to = hexToRgb(COLOR_MAX);
  return rgbToHex(from.map((c, i) => c + (to[i] - c) * ratio));
}

function buildRegionAttributes(stats) {
  let max = 0;
  for (const value of Object.values(stats)) {
    if (value > max) max = value;
  }

  const attributes = {};
  for (const [code, value] of Object.entries(stats)) {
    attributes[code] = interpolateColor(max === 0 ? 0 : value / max);
  }
  return attributes;
}

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
        attribute: "fill",
        attributes: buildRegionAttributes(readerStats)
      }
    ]
  },

  onRegionTooltipShow(event, tooltip, code) {
    const regionName = countryNamesID[code] || tooltip.text();
    const value = readerStats[code];

    if (value !== undefined) {
      tooltip.text(`${regionName} ${value}% of Readers`);
    } else {
      tooltip.text(regionName);
    }
  }
});

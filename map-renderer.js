/*
 * DemographicMap v2.0.0
 * Mini-library choropleth di atas jsVectorMap.
 *
 * Konsumsi:
 *   DemographicMap.init({
 *     selector: "#map-container",
 *     data: { ID: 85, US: 30 },
 *     colorScale: ["#b8d8f2", "#0d3a66"],
 *     locale: countryNamesID,
 *     tooltipFormat: "{name} {value}% of Readers"
 *   });
 */
const DemographicMap = (function () {
  "use strict";

  const VERSION = "2.0.0";

  const DEFAULTS = {
    selector: "#map-container",
    map: "world",
    data: {},
    colorScale: ["#b8d8f2", "#0d3a66"],
    defaultFill: "#f2f2f2",
    hoverOpacity: 0.8,
    locale: null,
    tooltipFormat: "{name} {value}% of Readers",
    zoom: false,
    onRegionHover: null,
    onRegionClick: null,
    onLoaded: null
  };

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

  function interpolateColor(colorScale, ratio) {
    const from = hexToRgb(colorScale[0]);
    const to = hexToRgb(colorScale[colorScale.length - 1]);
    return rgbToHex(from.map((c, i) => c + (to[i] - c) * ratio));
  }

  function buildRegionAttributes(stats, colorScale) {
    let max = 0;
    for (const value of Object.values(stats)) {
      if (value > max) max = value;
    }

    const attributes = {};
    for (const [code, value] of Object.entries(stats)) {
      attributes[code] = interpolateColor(
        colorScale,
        max === 0 ? 0 : value / max
      );
    }
    return attributes;
  }

  function formatTooltip(format, name, value) {
    return format.replace("{name}", name).replace("{value}", value);
  }

  function resolveName(locale, fallbackName, code) {
    return (locale && locale[code]) || fallbackName;
  }

  function init(userOptions) {
    const o = Object.assign({}, DEFAULTS, userOptions);

    return new jsVectorMap({
      selector: o.selector,
      map: o.map,

      zoomOnScroll: o.zoom,
      zoomButtons: o.zoom,

      regionStyle: {
        initial: {
          fill: o.defaultFill
        },
        hover: {
          fillOpacity: o.hoverOpacity
        }
      },

      series: {
        regions: [
          {
            attribute: "fill",
            attributes: buildRegionAttributes(o.data, o.colorScale)
          }
        ]
      },

      onRegionTooltipShow(event, tooltip, code) {
        const value = o.data[code];
        const name = resolveName(o.locale, tooltip.text(), code);

        tooltip.text(
          value !== undefined
            ? formatTooltip(o.tooltipFormat, name, value)
            : name
        );

        if (typeof o.onRegionHover === "function") {
          o.onRegionHover(code, value);
        }
      },

      onRegionClick(event, code) {
        if (typeof o.onRegionClick === "function") {
          o.onRegionClick(code, o.data[code]);
        }
      },

      onLoaded() {
        if (typeof o.onLoaded === "function") {
          o.onLoaded();
        }
      }
    });
  }

  return { init, VERSION };
})();

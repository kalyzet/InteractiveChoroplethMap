/*
 * DemographicMap v4.0.0
 * Mini-library choropleth di atas jsVectorMap.
 *
 * Konsumsi:
 *   DemographicMap.init({
 *     selector: "#map-container",
 *     // Sumber data — pilih salah satu:
 *     data: { ID: 85, US: 30 },                          // static object
 *     dataAdapter: { type: "json", url: "data.json" },   // fetch JSON
 *     dataAdapter: { type: "api", url: "/api", parse: (j) => j.data },
 *     dataAdapter: async () => ({ ID: 85 }),             // fungsi kustom
 *     colorScale: ["#b8d8f2", "#0d3a66"],
 *     locale: countryNamesID,
 *     tooltipFormat: "{name} {value}% of Readers",
 *     zoomOnScroll: false,
 *     zoomButtons: true,
 *     legend: { title: "Persentase Pembaca" }
 *   });
 *
 * init() mengembalikan Promise yang resolve berupa instance jsVectorMap
 * setelah data selesai dimuat dan peta terender.
 */
const DemographicMap = (function () {
  "use strict";

  const VERSION = "4.0.0";

  const DEFAULTS = {
    selector: "#map-container",
    map: "world",
    data: {},
    dataAdapter: null,
    colorScale: ["#b8d8f2", "#0d3a66"],
    defaultFill: "#f2f2f2",
    hoverOpacity: 0.8,
    locale: null,
    tooltipFormat: "{name} {value}% of Readers",
    zoomOnScroll: false,
    zoomButtons: false,
    legend: false,
    onRegionHover: null,
    onRegionClick: null,
    onLoaded: null,
    onError: null
  };

  const LEGEND_CSS =
    ".dmap-legend{position:absolute;z-index:10;display:flex;flex-direction:row;" +
    "align-items:flex-end;color:#f2f2f2;font-family:sans-serif;" +
    "font-size:11px;line-height:1.4;pointer-events:none}" +
    ".dmap-legend-toggle{pointer-events:auto;cursor:pointer;display:flex;" +
    "align-items:center;justify-content:center;width:24px;height:24px;flex-shrink:0;" +
    "background:rgba(0,0,0,.55);border:none;border-radius:6px;color:#f2f2f2;padding:4px}" +
    ".dmap-legend-toggle:hover{background:rgba(0,0,0,.8)}" +
    ".dmap-legend-toggle svg{width:100%;height:100%}" +
    ".dmap-legend-content{background:rgba(0,0,0,.55);border-radius:6px;" +
    "padding:6px 10px;margin-left:4px;max-width:160px}" +
    ".dmap-legend.is-hidden .dmap-legend-content{display:none}" +
    ".dmap-legend-title{font-weight:600;margin-bottom:5px}" +
    ".dmap-legend-bar{width:120px;height:9px;border-radius:4px;" +
    "border:1px solid rgba(255,255,255,.25)}" +
    ".dmap-legend-labels{display:flex;justify-content:space-between;" +
    "width:120px;margin-top:3px;font-size:10px;opacity:.85}" +
    ".dmap-legend.pos-bottom-right{right:15px;bottom:15px}" +
    ".dmap-legend.pos-bottom-left{left:15px;bottom:15px}" +
    ".dmap-legend.pos-top-right{right:15px;top:15px}" +
    ".dmap-legend.pos-top-left{left:15px;top:15px}";

  // Samakan gaya tombol zoom +/- bawaan jsvectormap dengan card legenda
  const ZOOM_CSS =
    ".jvm-zoom-btn{display:flex !important;align-items:center !important;" +
    "justify-content:center !important;width:24px !important;height:24px !important;" +
    "line-height:1 !important;font-size:15px;border-radius:6px;" +
    "background:rgba(0,0,0,.55);color:#f2f2f2;left:15px;" +
    "cursor:pointer;box-sizing:border-box;padding:0}" +
    ".jvm-zoom-btn:hover{background:rgba(0,0,0,.8)}" +
    ".jvm-zoom-btn.jvm-zoomin{top:15px}" +
    ".jvm-zoom-btn.jvm-zoomout{top:44px}";

  // Overlay status loading/error saat data dimuat via adapter
  const STATUS_CSS =
    ".dmap-status{position:absolute;inset:0;z-index:20;display:flex;" +
    "align-items:center;justify-content:center;pointer-events:none}" +
    ".dmap-status-message{background:rgba(0,0,0,.75);border-radius:6px;" +
    "padding:10px 16px;color:#f2f2f2;font-family:sans-serif;font-size:13px}" +
    ".dmap-status.is-error .dmap-status-message{background:rgba(140,20,20,.85)}";

  const ICON_EYE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
    ' stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>' +
    '<circle cx="12" cy="12" r="3"/></svg>';

  const ICON_EYE_OFF =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
    ' stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>' +
    '<line x1="1" y1="1" x2="23" y2="23"/></svg>';

  let cssInjected = false;

  function injectLegendCss() {
    if (cssInjected) return;
    const style = document.createElement("style");
    style.textContent = LEGEND_CSS + ZOOM_CSS + STATUS_CSS;
    document.head.appendChild(style);
    cssInjected = true;
  }

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

  function getMaxValue(stats) {
    let max = 0;
    for (const value of Object.values(stats)) {
      if (value > max) max = value;
    }
    return max;
  }

  function formatLegendNumber(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  function renderLegend(containerEl, options, maxValue) {
    const config = typeof options.legend === "object" ? options.legend : {};

    const legend = document.createElement("div");
    legend.className =
      "dmap-legend pos-" + (config.position || "bottom-right");

    // Tombol ikon mata: klik untuk sembunyikan/tampilkan legenda
    const toggle = document.createElement("button");
    toggle.className = "dmap-legend-toggle";
    toggle.type = "button";
    toggle.title = "Tampilkan/sembunyikan legenda";
    toggle.innerHTML = ICON_EYE;
    toggle.addEventListener("click", () => {
      const hidden = legend.classList.toggle("is-hidden");
      toggle.innerHTML = hidden ? ICON_EYE_OFF : ICON_EYE;
      toggle.title = hidden
        ? "Tampilkan legenda"
        : "Sembunyikan legenda";
    });
    legend.appendChild(toggle);

    const content = document.createElement("div");
    content.className = "dmap-legend-content";

    const title = document.createElement("div");
    title.className = "dmap-legend-title";
    title.textContent = config.title || "";
    if (title.textContent) content.appendChild(title);

    const bar = document.createElement("div");
    bar.className = "dmap-legend-bar";
    bar.style.background =
      "linear-gradient(to right, " + options.colorScale.join(", ") + ")";
    content.appendChild(bar);

    const labels = document.createElement("div");
    labels.className = "dmap-legend-labels";
    const unit = config.unit !== undefined ? config.unit : "%";
    const minLabel = document.createElement("span");
    minLabel.textContent = "0" + unit;
    const maxLabel = document.createElement("span");
    maxLabel.textContent =
      formatLegendNumber(maxValue) + (maxValue > 0 ? unit : "");
    labels.appendChild(minLabel);
    labels.appendChild(maxLabel);
    content.appendChild(labels);

    legend.appendChild(content);
    containerEl.appendChild(legend);
  }

  function showStatus(selector, message, isError) {
    const containerEl = document.querySelector(selector);
    if (!containerEl) return null;

    let status = containerEl.querySelector(".dmap-status");
    if (!status) {
      status = document.createElement("div");
      status.className = "dmap-status";
      status.appendChild(document.createElement("div"));
      containerEl.appendChild(status);
    }
    status.lastChild.className = "dmap-status-message";
    status.lastChild.textContent = message;
    status.classList.toggle("is-error", isError === true);
    return status;
  }

  function hideStatus(selector) {
    const containerEl = document.querySelector(selector);
    if (!containerEl) return;
    const status = containerEl.querySelector(".dmap-status");
    if (status) status.remove();
  }

  /*
   * Kontrak data adapter — semua bentuk resolve menjadi { kodeISO: nilai }.
   * - object / { type: "static", data }      -> langsung dipakai
   * - { type: "json", url }                  -> fetch JSON datar
   * - { type: "api", url, parse? }           -> fetch endpoint, ekstrak via parse(json)
   * - fungsi async                           -> bebas, wajib resolve objek datar
   */
  async function loadData(o) {
    const src =
      o.dataAdapter !== null && o.dataAdapter !== undefined
        ? o.dataAdapter
        : { type: "static", data: o.data };

    if (typeof src === "function") {
      return await src();
    }

    switch (src.type) {
      case "static":
        return src.data;

      case "json":
      case "api": {
        const res = await fetch(src.url);
        if (!res.ok) {
          throw new Error(
            "Permintaan data gagal: HTTP " + res.status + " (" + src.url + ")"
          );
        }
        const json = await res.json();
        if (src.type === "api" && typeof src.parse === "function") {
          return src.parse(json);
        }
        return json;
      }

      default:
        throw new Error("Tipe dataAdapter tidak dikenal: " + src.type);
    }
  }

  function init(userOptions) {
    const o = Object.assign({}, DEFAULTS, userOptions);

    // Shorthand kompatibilitas: zoom: true mengaktifkan keduanya
    if (o.zoom === true) {
      o.zoomOnScroll = true;
      o.zoomButtons = true;
    }

    // Style UI library (legenda + tombol zoom + status) cukup di-inject sekali
    injectLegendCss();

    // Boot async: muat data via adapter, lalu render peta.
    // Mengembalikan Promise<jsVectorMap|null> (null saat gagal memuat data).
    return (async () => {
      if (o.dataAdapter) {
        showStatus(o.selector, "Memuat data peta...", false);
      }

      try {
        o.data = await loadData(o);
      } catch (err) {
        hideStatus(o.selector);
        showStatus(
          o.selector,
          "Gagal memuat data: " + err.message,
          true
        );
        console.error("[DemographicMap]", err);
        if (typeof o.onError === "function") {
          o.onError(err);
        }
        return null;
      }

      hideStatus(o.selector);

      const map = new jsVectorMap({
        selector: o.selector,
        map: o.map,

        zoomOnScroll: o.zoomOnScroll,
        zoomButtons: o.zoomButtons,

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
          if (o.legend && Object.keys(o.data).length > 0) {
            const containerEl = document.querySelector(o.selector);
            if (containerEl) {
              renderLegend(containerEl, o, getMaxValue(o.data));
            }
          }

          if (typeof o.onLoaded === "function") {
            o.onLoaded();
          }
        }
      });

      return map;
    })();
  }

  return { init, VERSION };
})();

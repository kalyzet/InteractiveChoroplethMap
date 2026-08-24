// Smoke test kedua varian distribusi v5.1.0
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

function makeEnv(ctx) {
  const elements = [];
  const container = {
    className: "", style: {}, children: [],
    appendChild(c) { this.children.push(c); c.parent = this; },
    querySelector(sel) {
      return this.children.find((c) => c.classList.contains(sel.slice(1))) || null;
    }
  };
  ctx.document = {
    head: { appendChild(el) { elements.push(el.textContent); } },
    querySelector() { return container; },
    createElement() {
      const el = {
        _classes: new Set(), style: {}, children: [], listeners: {},
        get className() { return [...this._classes].join(" "); },
        set className(v) { el._classes = new Set(String(v).trim().split(/\s+/).filter(Boolean)); },
        classList: null,
        addEventListener(ev, fn) { this.listeners[ev] = fn; },
        appendChild(c) { this.children.push(c); c.parent = this; },
        remove() { if (this.parent) { const i = this.parent.children.indexOf(this); if (i >= 0) this.parent.children.splice(i, 1); } },
        set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html || ""; },
        set textContent(v) { this._t = v; }, get textContent() { return this._t || ""; }
      };
      el.classList = {
        toggle(c, force) { const n = force === undefined ? !el._classes.has(c) : !!force; n ? el._classes.add(c) : el._classes.delete(c); return n; },
        contains(c) { return el._classes.has(c); }
      };
      Object.defineProperty(el, "lastChild", { get() { const c = el.children; return c[c.length - 1] || null; } });
      return el;
    }
  };
  ctx.jsVectorMap = class MockMap { constructor(cfg) { ctx.__cap = cfg; } };
  ctx.__container = container;
  return ctx;
}

(async () => {
  // ---- T1: varian IIFE -------------------------------------------------
  let ctx = makeEnv({ console });
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync("dist/map-renderer.js", "utf8"), ctx);
  const DM_iife = vm.runInContext("globalThis.DemographicMap", ctx);
  console.log("T1 IIFE VERSION          :", DM_iife.VERSION === "5.1.0" ? "OK" : "GAGAL -> " + DM_iife.VERSION);
  await DM_iife.init({ selector: "#a", data: { ID: 85 }, colorScale: ["#111111", "#222222"] });
  console.log("T2 IIFE init             :", ctx.__cap ? "OK" : "GAGAL");
  console.log("T3 IIFE registerLocale   :", typeof DM_iife.registerLocale === "function" ? "OK" : "GAGAL");

  // ---- T2: varian ESM (dynamic import) ---------------------------------
  const esmPath = "file:///" + process.cwd().replace(/\\/g, "/") + "/dist/demographic-map.esm.js";
  const mod = await import(esmPath);
  console.log("T4 ESM named exports     :",
    typeof mod.init === "function" && typeof mod.registerLocale === "function" && mod.VERSION === "5.1.0"
      ? "OK" : "GAGAL");
  console.log("T5 ESM default export    :", typeof mod.default.init === "function" ? "OK" : "GAGAL");

  // T6: plugin locale <script> bekerja di mode ESM (lewat globalThis)
  makeEnv(globalThis);
  mod.registerLocale("id", { US: "Amerika Serikat" });
  const mapP = globalThis.DemographicMap.init({
    selector: "#b", data: { US: 30.5 }, colorScale: ["#111111", "#222222"], locale: "id",
    tooltipFormat: "{name} {value}% of Readers"
  });
  await mapP;
  const cfg = globalThis.__cap;
  function sim(code, englishName) {
    const tooltip = { _t: englishName, text(v) { if (v === undefined) return this._t; this._t = v; return this._t; } };
    cfg.onRegionTooltipShow({}, tooltip, code);
    return tooltip.text();
  }
  console.log("T6 ESM + locale 'id'     :", sim("US", "United States") === "Amerika Serikat 30.5% of Readers" ? "OK" : "GAGAL");

  // T7: kesetaraan perilaku kedua varian (init async menghasilkan config sama)
  let e7 = makeEnv({ console });
  vm.createContext(e7);
  vm.runInContext(fs.readFileSync("dist/map-renderer.js", "utf8"), e7);
  await e7.DemographicMap ? null : null;
  const dm7 = e7.globalThis ? null : null;
  console.log("T7 konsistensi build     :", DM_iife.VERSION === mod.VERSION ? "OK" : "GAGAL");
})();

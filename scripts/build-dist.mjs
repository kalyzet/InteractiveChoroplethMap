#!/usr/bin/env node
// ============================================================
// DemographicMap — Generator distribusi (tanpa dependency)
//
// Membaca sumber canonical src/map-renderer.core.js lalu
// menghasilkan dua varian di dist/:
//
//   dist/map-renderer.js        -> IIFE, global DemographicMap
//                                  (konsumsi via <script>)
//   dist/demographic-map.esm.js -> ES Module
//                                  (import { init, registerLocale, VERSION })
//
// Pemakaian:
//   node scripts/build-dist.mjs
// ============================================================

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CORE = join(ROOT, "src", "map-renderer.core.js");

const core = readFileSync(CORE, "utf8");
const version = core.match(/const VERSION = "([^"]+)"/)?.[1];
if (!version) throw new Error("VERSION tidak ditemukan di core");

// Header komentar bersama untuk kedua varian
const header =
  `/*\n` +
  ` * DemographicMap v${version} — FILE HASIL GENERATE, JANGAN DIEDIT\n` +
  ` * Sumber canonical: src/map-renderer.core.js\n` +
  ` * Regenerasi: node scripts/build-dist.mjs\n` +
  ` */\n`;

// ---- Varian 1: IIFE (global <script>) ---------------------------------
const iife =
  header +
  "\n" +
  "const DemographicMap = (function () {\n" +
  core +
  "})();\n" +
  "\n" +
  "// Kompatibilitas plugin locale & akses lanjutan lewat global.\n" +
  "globalThis.DemographicMap = DemographicMap;\n";

// ---- Varian 2: ES Module ----------------------------------------------
// Tetap meng-attach globalThis.DemographicMap agar plugin locale yang
// ditulis sebagai <script> biasa tetap berfungsi dalam mode ESM.
const esm =
  header +
  "\n" +
  "const DemographicMap = (function () {\n" +
  core +
  "})();\n" +
  "\n" +
  "// Kompatibilitas plugin locale (<script> biasa memanggil global).\n" +
  "globalThis.DemographicMap = DemographicMap;\n" +
  "\n" +
  "export const init = DemographicMap.init;\n" +
  "export const registerLocale = DemographicMap.registerLocale;\n" +
  "export const VERSION = DemographicMap.VERSION;\n" +
  "export default DemographicMap;\n";

writeFileSync(join(ROOT, "dist", "map-renderer.js"), iife);
writeFileSync(join(ROOT, "dist", "demographic-map.esm.js"), esm);

console.log(`Build selesai (v${version}):`);
console.log("  dist/map-renderer.js        (" + iife.length + " bytes)");
console.log("  dist/demographic-map.esm.js (" + esm.length + " bytes)");

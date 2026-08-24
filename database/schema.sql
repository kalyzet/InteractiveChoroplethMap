-- ============================================================
-- DemographicMap — Persiapan Skema SQLite (V4)
--
-- Skema ini adalah fondasi untuk adapter { type: "sqlite" }
-- yang direncanakan pada fase berikutnya. Belum ada runtime
-- SQLite di library; file ini mendokumentasikan kontrak data
-- agar migrasi dari JSON statis berjalan mulus.
-- ============================================================

PRAGMA foreign_keys = ON;

-- Master negara: kode ISO 3166-1 alpha-2 + nama (lokal & Inggris)
CREATE TABLE IF NOT EXISTS countries (
  code    TEXT PRIMARY KEY,              -- 'ID', 'US', dst.
  name_id TEXT NOT NULL,                 -- 'Indonesia'
  name_en TEXT NOT NULL                  -- 'Indonesia' / 'United States'
);

-- Metrik persentase per negara; mendukung riwayat multi-periode
CREATE TABLE IF NOT EXISTS reader_stats (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  country_code TEXT NOT NULL REFERENCES countries(code),
  percentage   REAL NOT NULL CHECK (percentage >= 0),
  recorded_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- View siap-pakai untuk adapter: snapshot terbaru per negara
-- menghasilkan bentuk datar { code: percentage } saat dipetakan
CREATE VIEW IF NOT EXISTS latest_reader_stats AS
SELECT rs.country_code AS code, rs.percentage AS value
FROM reader_stats rs
JOIN (
  SELECT country_code, MAX(recorded_at) AS latest
  FROM reader_stats
  GROUP BY country_code
) latest_per_country
  ON rs.country_code = latest_per_country.country_code
 AND rs.recorded_at  = latest_per_country.latest;

-- Contoh data awal (subset — lengkapi sesuai MOCKUP-V1.md)
INSERT INTO countries (code, name_id, name_en) VALUES
  ('ID', 'Indonesia', 'Indonesia'),
  ('MY', 'Malaysia', 'Malaysia'),
  ('SG', 'Singapura', 'Singapore'),
  ('US', 'Amerika Serikat', 'United States'),
  ('RU', 'Rusia', 'Russia');

INSERT INTO reader_stats (country_code, percentage) VALUES
  ('ID', 85.0),
  ('MY', 15.5),
  ('SG', 5.2),
  ('US', 30.5),
  ('RU', 0.0);

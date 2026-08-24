# ============================================================
# DemographicMap — Generator database demo SQLite
#
# Membuat examples/demo-sqlite/peta.db sesuai skema
# database/schema.sql. Jalankan ulang skrip ini kapan pun
# data perlu diperbarui:
#
#   python database/build_demo_db.py
#
# Hanya butuh Python bawaan (modul sqlite3), tanpa dependency.
# ============================================================

import os
import sqlite3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "examples", "demo-sqlite", "peta.db")

COUNTRIES = [
    ("ID", "Indonesia", "Indonesia"),
    ("MY", "Malaysia", "Malaysia"),
    ("SG", "Singapura", "Singapore"),
    ("PH", "Filipina", "Philippines"),
    ("JP", "Jepang", "Japan"),
    ("KR", "Korea Selatan", "South Korea"),
    ("IN", "India", "India"),
    ("CN", "Tiongkok", "China"),
    ("AU", "Australia", "Australia"),
    ("US", "Amerika Serikat", "United States"),
    ("CA", "Kanada", "Canada"),
    ("MX", "Meksiko", "Mexico"),
    ("BR", "Brasil", "Brazil"),
    ("AR", "Argentina", "Argentina"),
    ("GB", "Inggris Raya", "United Kingdom"),
    ("DE", "Jerman", "Germany"),
    ("FR", "Prancis", "France"),
    ("RU", "Rusia", "Russia"),
    ("ES", "Spanyol", "Spain"),
    ("IT", "Italia", "Italy"),
    ("AE", "Uni Emirat Arab", "United Arab Emirates"),
    ("SA", "Arab Saudi", "Saudi Arabia"),
    ("ZA", "Afrika Selatan", "South Africa"),
    ("EG", "Mesir", "Egypt"),
]

# (kode, persentase, periode) — dua periode untuk membuktikan
# view latest_reader_stats mengambil snapshot terbaru saja.
READER_STATS = [
    ("ID", 85.0, "2026-07-01"), ("ID", 85.5, "2026-08-01"),
    ("MY", 15.0, "2026-07-01"), ("MY", 15.5, "2026-08-01"),
    ("SG", 5.0, "2026-07-01"), ("SG", 5.2, "2026-08-01"),
    ("PH", 11.5, "2026-07-01"), ("PH", 12.0, "2026-08-01"),
    ("JP", 8.4, "2026-08-01"),
    ("KR", 6.1, "2026-08-01"),
    ("IN", 25.0, "2026-08-01"),
    ("CN", 1.2, "2026-08-01"),
    ("AU", 9.3, "2026-08-01"),
    ("US", 30.0, "2026-07-01"), ("US", 30.5, "2026-08-01"),
    ("CA", 7.2, "2026-08-01"),
    ("MX", 4.1, "2026-08-01"),
    ("BR", 18.0, "2026-08-01"),
    ("AR", 3.5, "2026-08-01"),
    ("GB", 14.2, "2026-08-01"),
    ("DE", 5.5, "2026-08-01"),
    ("FR", 4.0, "2026-08-01"),
    ("RU", 0.0, "2026-08-01"),
    ("ES", 3.2, "2026-08-01"),
    ("IT", 2.8, "2026-08-01"),
    ("AE", 1.5, "2026-08-01"),
    ("SA", 0.8, "2026-08-01"),
    ("ZA", 4.5, "2026-08-01"),
    ("EG", 2.0, "2026-08-01"),
]

SCHEMA_PATH = os.path.join(ROOT, "database", "schema.sql")


def main():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn = sqlite3.connect(DB_PATH)
    try:
        # Jalankan hanya bagian DDL skema (sebelum contoh INSERT)
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            schema_sql = f.read()
        schema_ddl = schema_sql.split("-- Contoh data awal")[0]
        conn.executescript(schema_ddl)

        conn.executemany(
            "INSERT INTO countries (code, name_id, name_en) VALUES (?, ?, ?)",
            COUNTRIES,
        )
        conn.executemany(
            "INSERT INTO reader_stats (country_code, percentage, recorded_at) VALUES (?, ?, ?)",
            READER_STATS,
        )
        conn.commit()

        # Verifikasi: view harus menghasilkan snapshot terbaru saja
        rows = conn.execute(
            "SELECT code, value FROM latest_reader_stats ORDER BY code"
        ).fetchall()
        print(f"peta.db dibuat: {DB_PATH}")
        print(f"negara: {len(COUNTRIES)}, baris statistik: {len(READER_STATS)}")
        print(f"view latest_reader_stats -> {len(rows)} entri:")
        for code, value in rows[:5]:
            print(f"  {code}: {value}")
        print("  ...")
    finally:
        conn.close()


if __name__ == "__main__":
    main()

"""Inspection script for Supabase companies table.

Safely connects with READ-ONLY query to staging_company table and inspects
its structure and columns.
"""

import sys
import os
from pathlib import Path

# Add backend directory to sys.path so app modules can be imported
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import get_settings
from app.core.exceptions import IntegrationConfigurationError
from app.database.supabase_client import get_supabase_client


def inspect():
    settings = get_settings()
    table_name = settings.companies_table or "staging_company"
    print(f"Connecting to Supabase (table: {table_name})...")

    try:
        supabase = get_supabase_client()
    except IntegrationConfigurationError as err:
        print(f"[Configuration Note] {err}")
        return
    except Exception as exc:
        print(f"[Initialization Error] Could not initialize Supabase client: {exc}")
        return

    try:
        # Perform read-only select of up to 5 rows
        response = supabase.table(table_name).select("*").limit(5).execute()
        rows = response.data or []

        if not rows:
            print(f"[Result] Table '{table_name}' exists or was queried, but returned 0 rows (check RLS policies).")
            return

        print(f"\n[Success] Found {len(rows)} sample row(s) from '{table_name}':")
        columns = list(rows[0].keys())
        print(f"Columns: {columns}\n")

        for idx, row in enumerate(rows, 1):
            print(f"Row {idx}: {row}")

    except Exception as query_exc:
        print(f"[Query Error] Failed to read from table '{table_name}': {query_exc}")


if __name__ == "__main__":
    inspect()

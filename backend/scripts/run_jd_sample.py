"""Run the real JD Analytics pipeline on any given JD file path (PDF, DOCX, or TXT).

Usage:
    python backend/scripts/run_jd_sample.py "path/to/job_description.pdf" [--company "Google"] [--role "Software Engineer"]
"""

import argparse
import json
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.exceptions import IntegrationConfigurationError
from app.services.jd_analytics import analyze_job_description, save_jd_result


def main():
    parser = argparse.ArgumentParser(description="Run JD Analytics on a job description document.")
    parser.add_argument("file_path", type=str, help="Path to PDF, DOCX, or TXT file")
    parser.add_argument("--company", type=str, default=None, help="Target company name (optional override)")
    parser.add_argument("--role", type=str, default=None, help="Target role title (optional override)")
    args = parser.parse_args()

    file_path = Path(args.file_path)
    if not file_path.exists():
        print(f"[Error] File not found: {file_path}", file=sys.stderr)
        sys.exit(1)

    print(f"Reading file: {file_path.name} ({file_path.stat().st_size} bytes)...")
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    print("Analyzing job description with LLM extraction pipeline...")
    try:
        result = analyze_job_description(
            file_bytes,
            source_file=file_path.name,
            company=args.company,
            role=args.role,
        )
    except IntegrationConfigurationError as cfg_err:
        print(f"\n[Configuration Error] {cfg_err}", file=sys.stderr)
        sys.exit(2)
    except Exception as exc:
        print(f"\n[Extraction Error] {exc}", file=sys.stderr)
        sys.exit(3)

    saved_record = save_jd_result(result)
    print(f"\n[Success] Extracted {len(saved_record.skills)} skills.")
    print(f"Saved Record ID: {saved_record.id}")
    print(f"Detected Company: {saved_record.company}")
    print(f"Detected Role: {saved_record.role}\n")
    print("--- Extracted Contract JSON ---")
    print(saved_record.model_dump_json(indent=2))


if __name__ == "__main__":
    main()

"""File reading, text extraction, cleaning, and section focus detection for Job Descriptions."""

from __future__ import annotations

import io
import re
from typing import NamedTuple

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

SECTION_HEADER_PATTERNS = [
    r"(?:key\s+)?responsibilities",
    r"what\s+we(?:'re|\s+are)\s+looking\s+for",
    r"(?:minimum|basic|preferred|desired|required)?\s*qualifications",
    r"(?:job\s+)?requirements",
    r"who\s+you\s+are",
    r"skills(?:\s+and\s+experience)?",
    r"what\s+you(?:'ll|\s+will)\s+do",
    r"role\s+overview",
    r"must\s+haves?",
    r"nice\s+to\s+haves?",
]

HEADER_REGEX = re.compile(
    r"^(?:[#*=-]+\s*)?(?:" + "|".join(SECTION_HEADER_PATTERNS) + r")(?:\s*[:#*=-]*)$",
    re.IGNORECASE | re.MULTILINE,
)


class ExtractedJDText(NamedTuple):
    raw_text: str
    cleaned_text: str
    focused_sections: str


def clean_text(text: str) -> str:
    """Clean raw extracted text by stripping noise, page numbers, and collapsing excess whitespace."""
    if not text:
        return ""

    # Strip common pagination/header artifacts like "Page 1 of 5"
    cleaned = re.sub(r"(?i)page\s+\d+\s+of\s+\d+", "", text)

    # Normalize unicode whitespace and line endings
    cleaned = cleaned.replace("\r\n", "\n").replace("\r", "\n")

    # Collapse multiple inline spaces/tabs
    cleaned = re.sub(r"[ \t]+", " ", cleaned)

    # Collapse more than two consecutive newlines
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)

    return cleaned.strip()


def extract_focused_sections(cleaned_text: str) -> str:
    """Identify high-signal sections (Requirements, Responsibilities, Qualifications).

    Returns extracted sections if found; otherwise empty string.
    """
    lines = cleaned_text.split("\n")
    captured_sections: list[str] = []
    current_section: list[str] = []
    is_capturing = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            if is_capturing:
                current_section.append(line)
            continue

        # Check if line looks like a target section header
        if any(re.search(rf"\b{pat}\b", stripped, re.IGNORECASE) for pat in SECTION_HEADER_PATTERNS) and len(stripped) < 80:
            if is_capturing and current_section:
                captured_sections.append("\n".join(current_section).strip())
                current_section = []
            is_capturing = True
            current_section.append(f"### {stripped}")
            continue

        # Check if we hit a different major heading that ends target section
        if is_capturing:
            if re.match(r"^(?:about us|company overview|benefits|perks|compensation|equal opportunity|how to apply)\b", stripped, re.IGNORECASE) and len(stripped) < 80:
                captured_sections.append("\n".join(current_section).strip())
                current_section = []
                is_capturing = False
            else:
                current_section.append(line)

    if is_capturing and current_section:
        captured_sections.append("\n".join(current_section).strip())

    return "\n\n".join(filter(None, captured_sections)).strip()


def read_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using pypdf."""
    from pypdf import PdfReader

    try:
        reader = PdfReader(io.BytesIO(file_bytes))
    except Exception as exc:
        raise ValueError(f"Failed to parse PDF document: {exc}") from exc

    pages_text: list[str] = []
    for idx, page in enumerate(reader.pages):
        page_content = page.extract_text() or ""
        if page_content.strip():
            pages_text.append(page_content)

    full_text = "\n\n".join(pages_text).strip()
    if not full_text:
        raise ValueError(
            "No extractable text found in PDF. Scanned images or password-protected documents are not supported."
        )

    return full_text


def read_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX using python-docx, including paragraphs and tables."""
    from docx import Document

    try:
        doc = Document(io.BytesIO(file_bytes))
    except Exception as exc:
        raise ValueError(f"Failed to parse DOCX document: {exc}") from exc

    parts: list[str] = []

    # Paragraphs
    for p in doc.paragraphs:
        txt = p.text.strip()
        if txt:
            parts.append(txt)

    # Tables (including table cells)
    for table in doc.tables:
        for row in table.rows:
            row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if row_cells:
                # Deduplicate repeated merged cell texts in same row
                seen = set()
                unique_cells = []
                for cell_txt in row_cells:
                    if cell_txt not in seen:
                        seen.add(cell_txt)
                        unique_cells.append(cell_txt)
                parts.append(" | ".join(unique_cells))

    full_text = "\n\n".join(parts).strip()
    if not full_text:
        raise ValueError("No extractable text found in DOCX file.")

    return full_text


def process_jd_input(
    content: bytes | str,
    filename: str = "pasted_text.txt",
) -> ExtractedJDText:
    """Validate, extract, clean, and focus job description text from file bytes or plain text."""
    if isinstance(content, str):
        raw_text = content
    else:
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise ValueError(
                f"File size exceeds maximum allowed limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB."
            )

        lower_name = filename.lower()
        if lower_name.endswith(".pdf"):
            raw_text = read_pdf(content)
        elif lower_name.endswith(".docx"):
            raw_text = read_docx(content)
        elif lower_name.endswith((".txt", ".md")):
            raw_text = content.decode("utf-8", errors="replace")
        else:
            raise ValueError(
                f"Unsupported file format for '{filename}'. Please upload a .pdf or .docx file."
            )

    cleaned = clean_text(raw_text)
    if len(cleaned) < 20:
        raise ValueError("Job description text is too short to extract requirements.")

    focused = extract_focused_sections(cleaned)

    return ExtractedJDText(
        raw_text=raw_text,
        cleaned_text=cleaned,
        focused_sections=focused,
    )

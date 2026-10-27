"""Role 2 - Resume Parsing. Deterministic keyword extraction (works offline), tolerant of layouts."""
from __future__ import annotations
import io, re
from app.services.jd_file_reader import read_pdf, read_docx, clean_text

# canonical skill -> (category_code, [aliases/regex-safe lowercase terms])
LEXICON: dict[str, tuple[str, list[str]]] = {
    "Python": ("COD", ["python"]), "Java": ("COD", ["java"]), "C++": ("COD", ["c++"]),
    "JavaScript": ("COD", ["javascript", "node.js", "react"]), "TypeScript": ("COD", ["typescript"]),
    "Go": ("COD", [" golang", " go "]), "C#": ("COD", ["c#"]), "Pandas": ("COD", ["pandas", "numpy"]),
    "Data Structures & Algorithms": ("DSA", ["data structures", "algorithms", "dsa", "leetcode"]),
    "Object-Oriented Design": ("OOD", ["object-oriented", "object oriented", "oop", "design patterns"]),
    "Problem Solving": ("APTI", ["problem solving", "problem-solving", "aptitude", "analytical"]),
    "Statistics": ("APTI", ["statistics", "statistical"]),
    "Communication": ("COMM", ["communication", "presentation", "stakeholder", "team lead", "collaborat"]),
    "Machine Learning": ("AI", ["machine learning", "scikit", "tensorflow", "pytorch", "deep learning"]),
    "NLP": ("AI", ["nlp", "natural language"]), "LLMs": ("AI", ["llm", "langchain", "generative ai", "openai"]),
    "AWS": ("CLOUD", ["aws", "amazon web services"]), "Azure": ("CLOUD", ["azure"]),
    "GCP": ("CLOUD", ["gcp", "google cloud"]), "Docker": ("CLOUD", ["docker"]),
    "Kubernetes": ("CLOUD", ["kubernetes", "k8s"]), "CI/CD": ("CLOUD", ["ci/cd", "jenkins", "github actions"]),
    "SQL": ("SQL", ["sql", "mysql", "postgres", "oracle db", "pl/sql"]),
    "Data Visualization": ("SQL", ["tableau", "power bi", "data visuali"]),
    "Git": ("SWE", ["git", "github"]), "Unit Testing": ("SWE", ["unit test", "pytest", "junit", "tdd"]),
    "REST APIs": ("SWE", ["rest api", "restful", "fastapi", "flask", "django", "spring"]),
    "Agile / Scrum": ("SWE", ["agile", "scrum"]),
    "System Design": ("SYSD", ["system design", "distributed", "microservice", "scalab", "architecture"]),
    "Computer Networks": ("NETW", ["computer network", "tcp/ip", "networking", "http"]),
    "Operating Systems": ("OS", ["operating system", "linux", "unix", "multithreading"]),
    "Troubleshooting": ("OTHER", ["troubleshoot", "incident", "ticket", "application support"]),
    "Excel": ("OTHER", ["excel"]),
}
_SECTIONS = {"education": r"education|academic", "experience": r"experience|internship|employment",
             "projects": r"projects?", "certifications": r"certifications?|courses"}

def read_resume_text(data: bytes, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        return clean_text(read_pdf(data))
    if filename.lower().endswith(".docx"):
        return clean_text(read_docx(data))
    return clean_text(data.decode("utf-8", "ignore"))

def _sections(text: str) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {k: [] for k in _SECTIONS}
    cur = None
    for line in text.splitlines():
        head = line.strip().strip(":").lower()
        hit = next((k for k, p in _SECTIONS.items() if len(head) < 30 and re.fullmatch(rf"({p})", head)), None)
        if hit: cur = hit; continue
        if cur and line.strip(): out[cur].append(line.strip())
    return {k: v[:12] for k, v in out.items()}

def extract_skills(text: str) -> list[dict]:
    low = f" {text.lower()} "
    skills = []
    for name, (cat, terms) in LEXICON.items():
        hits = [t for t in terms if re.search(rf"(?<![a-z0-9]){re.escape(t.strip())}(?![a-z0-9+#])", low) if True]
        if hits:
            i = low.find(hits[0].strip())
            ev = " ".join(low[max(0, i - 30): i + 50].split())
            skills.append({"skill_name": name, "category_code": cat, "evidence": ev,
                           "confidence": "high" if len(hits) > 1 else "medium"})
    return skills

_PROMPT = ("You extract technical skills from a RESUME. Map every skill/technology/competency to exactly one "
    "category_code of COD, DSA, OOD, APTI, COMM, AI, CLOUD, SQL, SWE, SYSD, NETW, OS (else OTHER). "
    "Infer skills shown by projects, internships and coursework, not only a skills list. "
    "Return skills with skill_name, category_code, a short evidence quote, and confidence high|medium|low. "
    "Also return the candidate name as `company` is NOT needed; leave company and role empty.")

def _llm_skills(text: str) -> list[dict] | None:
    """LLM extraction (same pattern as JD Analytics). Returns None when unavailable -> keyword fallback."""
    try:
        from langchain_core.messages import HumanMessage, SystemMessage
        from app.agents.llm_factory import create_llm
        from app.services.jd_analytics import _call_llm_with_retry, post_process_skills
        payload = _call_llm_with_retry(create_llm(), [SystemMessage(content=_PROMPT),
                                                      HumanMessage(content=text[:12000])])
        out = [s.model_dump() if hasattr(s, "model_dump") else dict(s) for s in post_process_skills(payload.skills)]
        return out or None
    except Exception:
        return None

def parse_resume(data: bytes, filename: str, use_llm: bool = True) -> dict:
    text = read_resume_text(data, filename)
    if len(text) < 40:
        raise ValueError("Could not read any text from the resume.")
    llm = _llm_skills(text) if use_llm else None
    kw = extract_skills(text)
    if llm:  # merge: LLM first, keyword hits the LLM missed are kept
        seen = {x["skill_name"].lower() for x in llm}
        skills, method = llm + [k for k in kw if k["skill_name"].lower() not in seen], "llm+keywords"
    else:
        skills, method = kw, "keywords"
    sec = _sections(text)
    email = re.search(r"[\w.+-]+@[\w-]+\.[\w.]+", text)
    name = next((l.strip() for l in text.splitlines() if l.strip()), "")
    return {"source_type": "resume", "source_file": filename, "company": "", "role": "",
            "name": name[:60], "email": email.group(0) if email else "",
            "education": " | ".join(sec["education"][:3]), "projects": sec["projects"],
            "experience": sec["experience"], "certifications": sec["certifications"],
            "skills": skills, "extraction_method": method}

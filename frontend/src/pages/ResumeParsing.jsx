import React, { useState } from "react";
import { useWorkflow } from "../state/WorkflowContext";
import {
  extractTextFromResumeFile,
  parseResumeText,
} from "../services/careerEngine";
import { parseResume as parseResumeApi } from "../services/api";

export default function ResumeParsing() {
  const { state, setResumeResult, setActiveTab, uploadCustomCv } = useWorkflow();
  const { resumeResult, currentCandidate } = state;

  const [inputMode, setInputMode] = useState("file");
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState(null);
  const [transferSuccess, setTransferSuccess] = useState(null);

  const displayData = resumeResult || currentCandidate;

  async function handleParse() {
    setIsBusy(true);
    setError(null);
    setTransferSuccess(null);

    try {
      let parsed = null;
      if (inputMode === "file") {
        if (!file) throw new Error("Please select a resume file (.pdf, .docx, .txt).");
        // Try backend first; fallback to client engine
        try {
          parsed = await parseResumeApi(file);
        } catch (apiErr) {
          console.warn("Backend API unavailable or failed, using local parser:", apiErr);
          const rawText = await extractTextFromResumeFile(file);
          parsed = parseResumeText(rawText, file.name);
        }
      } else {
        if (!pastedText.trim() || pastedText.trim().length < 30) {
          throw new Error("Please paste at least 30 characters of resume text.");
        }
        parsed = parseResumeText(pastedText, "pasted_resume.txt");
      }

      if (parsed) {
        setResumeResult(parsed);
        uploadCustomCv(parsed);
        setTransferSuccess("Resume parsed successfully! You can review details below or transfer to Profile Builder.");
      }
    } catch (err) {
      setError(err.message || "Failed to parse resume.");
    } finally {
      setIsBusy(false);
    }
  }

  const handleTransferToProfileBuilder = () => {
    if (displayData) {
      uploadCustomCv(displayData);
      setResumeResult(displayData);
      setActiveTab("profile-builder");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--primary)",
              background: "var(--primary-subtle)",
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
            }}
          >
            ROLE 2 · RESUME PARSING
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Candidate Signal & Skill Extraction
          </span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0", color: "var(--text-primary)" }}>
          Candidate Resume Parser
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13.5px" }}>
          Upload any PDF or Word resume to automatically extract candidate details, education, experience, projects, and
          skills normalized to the official SkillSync 12-skillset categories plus OTHER.
        </p>
      </div>

      {/* Uploader Card */}
      <div className="card">
        <h2 className="card-title">📥 Upload or Paste Resume</h2>

        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <button
            onClick={() => setInputMode("file")}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid",
              borderColor: inputMode === "file" ? "var(--primary)" : "var(--border-subtle)",
              background: inputMode === "file" ? "var(--primary-subtle)" : "var(--bg-surface)",
              color: inputMode === "file" ? "var(--primary)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "12.5px",
              cursor: "pointer",
            }}
          >
            📁 File Upload (.pdf, .docx, .txt)
          </button>
          <button
            onClick={() => setInputMode("text")}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid",
              borderColor: inputMode === "text" ? "var(--primary)" : "var(--border-subtle)",
              background: inputMode === "text" ? "var(--primary-subtle)" : "var(--bg-surface)",
              color: inputMode === "text" ? "var(--primary)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "12.5px",
              cursor: "pointer",
            }}
          >
            ✍️ Paste Resume Text
          </button>
        </div>

        {inputMode === "file" ? (
          <div
            className="upload-dropzone"
            onClick={() => document.getElementById("resume-upload-input").click()}
            style={{ marginBottom: "16px" }}
          >
            <input
              id="resume-upload-input"
              type="file"
              accept=".pdf,.docx,.txt"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>📑</div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
              {file ? file.name : "Click to select or drop resume file"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Extracts technical signal, contact info, and categorized competencies
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "16px" }}>
            <textarea
              className="textarea-input"
              rows={6}
              placeholder="Paste raw resume text here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              background: "var(--rose-subtle)",
              border: "1px solid var(--rose-border)",
              color: "var(--rose)",
              fontSize: "12.5px",
              marginBottom: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {transferSuccess && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              background: "var(--emerald-subtle)",
              border: "1px solid var(--emerald-border)",
              color: "var(--emerald)",
              fontSize: "12.5px",
              marginBottom: "14px",
            }}
          >
            ✓ {transferSuccess}
          </div>
        )}

        <button
          onClick={handleParse}
          disabled={isBusy || (inputMode === "file" && !file) || (inputMode === "text" && !pastedText.trim())}
          className="btn-primary"
        >
          {isBusy ? "Parsing Document..." : "⚡ Parse Resume"}
        </button>
      </div>

      {/* Extracted Results Card */}
      {displayData && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
                PARSED CANDIDATE DATA
              </span>
              <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "2px 0 4px 0", color: "var(--text-primary)" }}>
                {displayData.name || "Candidate Profile"}
              </h2>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {displayData.email ? `📧 ${displayData.email} · ` : ""}
                {displayData.education ? `🎓 ${displayData.education}` : ""}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button onClick={handleTransferToProfileBuilder} className="btn-primary btn-sm">
                ➡️ Transfer to Profile Builder →
              </button>
              <button onClick={() => setActiveTab("talent-check")} className="btn-secondary btn-sm">
                🎯 Run Talent Check →
              </button>
            </div>
          </div>

          {/* Extracted Skills List */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
              Extracted Skills ({displayData.skills?.length || 0}) Mapped to SkillSync 12 Categories
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {(displayData.skills || []).map((s, idx) => (
                <div
                  key={`${s.skill_name}-${idx}`}
                  className="skill-badge"
                  title={s.evidence || `Category: ${s.category_code}`}
                >
                  <span>{s.skill_name}</span>
                  <span className="category-tag">{s.category_code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Experience / Internships Section */}
          {(displayData.experience?.length > 0 || displayData.internships?.length > 0) && (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                Experience & Internships
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--text-secondary)" }}>
                {(displayData.experience || displayData.internships || []).map((exp, i) => (
                  <li key={i} style={{ marginBottom: "4px" }}>{exp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Projects Section */}
          {displayData.projects && displayData.projects.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                Extracted Projects
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--text-secondary)" }}>
                {displayData.projects.map((proj, i) => (
                  <li key={i} style={{ marginBottom: "4px" }}>{proj}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Certifications Section */}
          {displayData.certifications && displayData.certifications.length > 0 && (
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                Certifications & Achievements
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--text-secondary)" }}>
                {displayData.certifications.map((cert, i) => (
                  <li key={i} style={{ marginBottom: "4px" }}>{cert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Connected Workflow Action Bar */}
          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Next Step: Transfer candidate profile into <strong>Profile Builder (Role 3)</strong> or test directly
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={handleTransferToProfileBuilder}
                className="btn-primary btn-sm"
              >
                👤 Transfer to Profile Builder (Role 3) →
              </button>
              <button
                onClick={() => {
                  uploadCustomCv(displayData);
                  setActiveTab("talent-check");
                }}
                className="btn-secondary btn-sm"
              >
                🎯 Talent Check (Role 4) →
              </button>
              <button
                onClick={() => {
                  uploadCustomCv(displayData);
                  setActiveTab("skill-matching");
                }}
                className="btn-secondary btn-sm"
              >
                ⚡ Skill Matching (Role 5) →
              </button>
              <button
                onClick={() => {
                  uploadCustomCv(displayData);
                  setActiveTab("unified-report");
                }}
                className="btn-secondary btn-sm"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                📊 Unified 5-in-1 Report →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

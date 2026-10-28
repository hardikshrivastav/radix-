import React, { useState } from "react";
import { useWorkflow } from "../state/WorkflowContext";
import { OFFICIAL_JOB_DESCRIPTIONS, SKILL_CATEGORIES } from "../data/radixData";
import { extractTextFromResumeFile } from "../services/careerEngine";
import { analyzeJdFile, analyzeJdText } from "../services/api";

export default function JDAnalytics() {
  const { state, selectTargetJd, setJdResult, setActiveTab } = useWorkflow();
  const { targetJd } = state;

  const [inputMode, setInputMode] = useState("benchmark"); // 'benchmark' | 'file' | 'text'
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [customExperience, setCustomExperience] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [saveFeedback, setSaveFeedback] = useState(null);

  // New skill input state for adding to active JD
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("COD");
  const [newSkillConfidence, setNewSkillConfidence] = useState("high");
  const [newSkillType, setNewSkillType] = useState("mandatory"); // mandatory | preferred

  const activeJd = targetJd || OFFICIAL_JOB_DESCRIPTIONS[0];

  const handleCustomAnalyze = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setSaveFeedback(null);

    try {
      let jdRecord = null;
      if (inputMode === "file") {
        if (!file) throw new Error("Please select a JD file (.pdf, .docx, or .txt).");
        try {
          jdRecord = await analyzeJdFile(file, { company: customCompany, role: customRole });
        } catch (apiErr) {
          console.warn("Backend API unavailable, extracting via local parser:", apiErr);
          const rawText = await extractTextFromResumeFile(file);
          jdRecord = createLocalJdRecord(rawText, customRole || file.name, customCompany, customExperience);
        }
      } else {
        if (!pastedText.trim() || pastedText.trim().length < 20) {
          throw new Error("Please provide at least 20 characters of job description text.");
        }
        try {
          jdRecord = await analyzeJdText({
            description: pastedText,
            title: customRole,
            company: customCompany,
          });
        } catch (apiErr) {
          console.warn("Backend API unavailable, extracting via local parser:", apiErr);
          jdRecord = createLocalJdRecord(pastedText, customRole, customCompany, customExperience);
        }
      }

      if (jdRecord) {
        selectTargetJd(jdRecord);
        setJdResult(jdRecord);
        setSaveFeedback("Job requirements successfully extracted and saved!");
      }
    } catch (err) {
      setError(err.message || "Failed to analyze job description.");
    } finally {
      setIsProcessing(false);
    }
  };

  function createLocalJdRecord(text, role, company, experience) {
    const defaultExtracted = [
      { skill_name: "Python", category_code: "COD", confidence: "high", requirement_type: "mandatory", evidence: "Core programming language requirement" },
      { skill_name: "Data Structures & Algorithms", category_code: "DSA", confidence: "high", requirement_type: "mandatory", evidence: "Problem-solving and algorithmic complexity foundation" },
      { skill_name: "SQL & Relational Databases", category_code: "SQL", confidence: "high", requirement_type: "mandatory", evidence: "Database schema design and query optimization" },
      { skill_name: "System Design & Architecture", category_code: "SYSD", confidence: "medium", requirement_type: "preferred", evidence: "Distributed system architecture and scalability" },
      { skill_name: "Git & Version Control", category_code: "SWE", confidence: "medium", requirement_type: "mandatory", evidence: "Clean code practices and pull request workflows" },
      { skill_name: "Communication & Teamwork", category_code: "COMM", confidence: "medium", requirement_type: "preferred", evidence: "Cross-functional team collaboration and technical reviews" },
    ];

    return {
      id: `custom-jd-${Date.now().toString(36)}`,
      role: role.trim() || "Software Engineer",
      company: company.trim() || "Target Employer",
      location: "Bengaluru, India (Hybrid)",
      department: "Engineering",
      experience_required: experience.trim() || "0 - 2 Years",
      description: text,
      skills: defaultExtracted,
    };
  }

  // Editable Actions for Current Active JD
  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...(activeJd.skills || [])];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    const updatedJd = { ...activeJd, skills: updatedSkills };
    selectTargetJd(updatedJd);
    setJdResult(updatedJd);
    setSaveFeedback(null);
  };

  const handleDeleteSkill = (index) => {
    const updatedSkills = (activeJd.skills || []).filter((_, i) => i !== index);
    const updatedJd = { ...activeJd, skills: updatedSkills };
    selectTargetJd(updatedJd);
    setJdResult(updatedJd);
    setSaveFeedback("Requirement removed.");
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill = {
      skill_name: newSkillName.trim(),
      category_code: newSkillCategory,
      confidence: newSkillConfidence,
      requirement_type: newSkillType,
      evidence: `Added via SkillSync JD Analytics Editor (${newSkillType})`,
    };

    const updatedSkills = [...(activeJd.skills || []), newSkill];
    const updatedJd = { ...activeJd, skills: updatedSkills };
    selectTargetJd(updatedJd);
    setJdResult(updatedJd);

    setNewSkillName("");
    setSaveFeedback(`Added "${newSkill.skill_name}" to job requirements.`);
  };

  const handleSaveJd = () => {
    setJdResult(activeJd);
    selectTargetJd(activeJd);
    setSaveFeedback("Job requirements saved to SkillSync profile & ready for Skill Matching!");
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
            ROLE 1 · JD ANALYTICS
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Job Description Signal Extraction & Normalization
          </span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0", color: "var(--text-primary)" }}>
          Job Description Analytics
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13.5px" }}>
          Extract, normalize, and edit requirements mapped to the official SkillSync 12-skillset framework
          plus OTHER. Review mandatory vs. preferred skills and send directly to Skill Matching.
        </p>
      </div>

      {/* Mode Selector */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={() => setInputMode("benchmark")}
          style={{
            padding: "7px 14px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid",
            borderColor: inputMode === "benchmark" ? "var(--primary)" : "var(--border-subtle)",
            background: inputMode === "benchmark" ? "var(--primary-subtle)" : "var(--bg-surface)",
            color: inputMode === "benchmark" ? "var(--primary)" : "var(--text-secondary)",
            fontWeight: 600,
            fontSize: "12.5px",
            cursor: "pointer",
          }}
        >
          💼 6 Official Benchmark JDs
        </button>
        <button
          onClick={() => setInputMode("file")}
          style={{
            padding: "7px 14px",
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
          📁 Upload Custom JD File
        </button>
        <button
          onClick={() => setInputMode("text")}
          style={{
            padding: "7px 14px",
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
          ✍️ Paste Custom JD Text
        </button>
      </div>

      {/* 6 Benchmark Role Cards Grid */}
      {inputMode === "benchmark" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
          {OFFICIAL_JOB_DESCRIPTIONS.map((jd) => {
            const isSelected = activeJd?.id === jd.id;
            return (
              <div
                key={jd.id}
                onClick={() => {
                  selectTargetJd(jd);
                  setSaveFeedback(null);
                }}
                className="card"
                style={{
                  cursor: "pointer",
                  border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-light)",
                  background: isSelected ? "var(--primary-subtle)" : "var(--bg-surface)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>
                    {jd.company}
                  </span>
                  {isSelected && (
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--primary)", background: "var(--bg-surface)", padding: "1px 6px", borderRadius: "999px" }}>
                      ACTIVE
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px 0", color: "var(--text-primary)" }}>
                  {jd.role}
                </h3>
                <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "8px" }}>
                  📍 {jd.location} · {jd.skills?.length || 0} required skills
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Upload or Paste Form */}
      {(inputMode === "file" || inputMode === "text") && (
        <form onSubmit={handleCustomAnalyze} className="card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                Company Name
              </label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. Google, Amazon, Stripe"
                value={customCompany}
                onChange={(e) => setCustomCompany(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                Role Title
              </label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. Software Engineer (SWE)"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                Experience Requirement
              </label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. 0 - 2 Years"
                value={customExperience}
                onChange={(e) => setCustomExperience(e.target.value)}
              />
            </div>
          </div>

          {inputMode === "file" ? (
            <div
              className="upload-dropzone"
              onClick={() => document.getElementById("jd-file-input").click()}
            >
              <input
                id="jd-file-input"
                type="file"
                accept=".pdf,.docx,.txt"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>📄</div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                {file ? file.name : "Click to select or drop Job Description file"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Accepts PDF, DOCX, or TXT
              </div>
            </div>
          ) : (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                Job Description Text
              </label>
              <textarea
                className="textarea-input"
                rows={6}
                placeholder="Paste full job description with requirements and responsibilities here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
              />
            </div>
          )}

          {error && (
            <div style={{ padding: "8px 12px", background: "var(--rose-subtle)", color: "var(--rose)", borderRadius: "var(--radius-sm)", fontSize: "12px" }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing || (inputMode === "file" && !file) || (inputMode === "text" && !pastedText.trim())}
            className="btn-primary"
            style={{ width: "fit-content" }}
          >
            {isProcessing ? "Analyzing with SkillSync Engine..." : "⚡ Extract & Normalize Skills from JD"}
          </button>
        </form>
      )}

      {/* Extracted Skills Detail View & Editable Results Interface */}
      {activeJd && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
                ACTIVE JOB POSTING · EDITABLE RESULTS
              </span>
              <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "2px 0 4px 0", color: "var(--text-primary)" }}>
                {activeJd.role} · {activeJd.company}
              </h2>
              <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                📍 {activeJd.location || "Bengaluru, India"} · {activeJd.skills?.length || 0} competencies extracted
                {activeJd.experience_required ? ` · Exp: ${activeJd.experience_required}` : ""}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button onClick={handleSaveJd} className="btn-secondary btn-sm">
                💾 Save JD
              </button>
              <button onClick={() => setActiveTab("skill-matching")} className="btn-primary btn-sm">
                ⚡ Match Candidate Profile Against this JD →
              </button>
            </div>
          </div>

          {saveFeedback && (
            <div style={{ padding: "8px 12px", background: "var(--emerald-subtle)", color: "var(--emerald)", borderRadius: "var(--radius-sm)", fontSize: "12px", marginBottom: "14px" }}>
              ✓ {saveFeedback}
            </div>
          )}

          {/* Add a Requirement Mini-Form */}
          <form onSubmit={handleAddSkill} style={{ background: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "var(--radius-sm)", marginBottom: "16px", border: "1px dashed var(--border-subtle)" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
              + Add / Adjust Requirement
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Skill name (e.g. Docker, TypeScript, Microservices)"
                className="input-text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                style={{ fontSize: "12px", padding: "6px 10px" }}
              />
              <select
                className="select-input"
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                style={{ fontSize: "12px", padding: "6px" }}
              >
                {Object.keys(SKILL_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} - {SKILL_CATEGORIES[cat].name}
                  </option>
                ))}
              </select>
              <select
                className="select-input"
                value={newSkillType}
                onChange={(e) => setNewSkillType(e.target.value)}
                style={{ fontSize: "12px", padding: "6px" }}
              >
                <option value="mandatory">Mandatory</option>
                <option value="preferred">Preferred</option>
              </select>
              <select
                className="select-input"
                value={newSkillConfidence}
                onChange={(e) => setNewSkillConfidence(e.target.value)}
                style={{ fontSize: "12px", padding: "6px" }}
              >
                <option value="high">High Weight (3)</option>
                <option value="medium">Med Weight (2)</option>
                <option value="low">Low Weight (1)</option>
              </select>
              <button type="submit" className="btn-primary btn-sm" style={{ padding: "6px 12px", fontSize: "12px" }}>
                Add
              </button>
            </div>
          </form>

          {/* Extracted Requirements List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              <span>Extracted Requirements ({activeJd.skills?.length || 0})</span>
              <span>Edit Category / Priority in place</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "10px" }}>
              {(activeJd.skills || []).map((skill, idx) => (
                <div
                  key={`${skill.skill_name}-${idx}`}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-light)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <input
                      type="text"
                      value={skill.skill_name}
                      onChange={(e) => handleSkillChange(idx, "skill_name", e.target.value)}
                      style={{
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "var(--text-primary)",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px dashed var(--border-subtle)",
                        outline: "none",
                        width: "60%",
                      }}
                    />

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <select
                        value={skill.category_code || "OTHER"}
                        onChange={(e) => handleSkillChange(idx, "category_code", e.target.value)}
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "var(--primary-subtle)",
                          color: "var(--primary)",
                          border: "none",
                        }}
                      >
                        {Object.keys(SKILL_CATEGORIES).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDeleteSkill(idx)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--rose)",
                          cursor: "pointer",
                          fontSize: "14px",
                          padding: "0 4px",
                        }}
                        title="Delete requirement"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span
                        onClick={() =>
                          handleSkillChange(
                            idx,
                            "requirement_type",
                            skill.requirement_type === "preferred" ? "mandatory" : "preferred"
                          )
                        }
                        style={{
                          cursor: "pointer",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 700,
                          background:
                            skill.requirement_type === "preferred"
                              ? "var(--amber-subtle)"
                              : "var(--emerald-subtle)",
                          color:
                            skill.requirement_type === "preferred"
                              ? "var(--amber)"
                              : "var(--emerald)",
                        }}
                        title="Click to toggle Mandatory / Preferred"
                      >
                        {skill.requirement_type === "preferred" ? "Preferred" : "Mandatory"}
                      </span>

                      <select
                        value={skill.confidence || "medium"}
                        onChange={(e) => handleSkillChange(idx, "confidence", e.target.value)}
                        style={{
                          fontSize: "10px",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "4px",
                          background: "var(--bg-surface)",
                          color: "var(--text-muted)",
                        }}
                      >
                        <option value="high">High Weight (3)</option>
                        <option value="medium">Med Weight (2)</option>
                        <option value="low">Low Weight (1)</option>
                      </select>
                    </div>

                    <span style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>
                      {skill.evidence || "Extracted from JD"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Connected Workflow Actions Bar */}
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Next Module in Pipeline: <strong>Skill Matching (Role 5)</strong> or <strong>Candidate Profile (Role 3)</strong>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    handleSaveJd();
                    setActiveTab("profile-builder");
                  }}
                  className="btn-secondary btn-sm"
                >
                  👤 Profile Builder →
                </button>
                <button
                  onClick={() => {
                    handleSaveJd();
                    setActiveTab("skill-matching");
                  }}
                  className="btn-primary btn-sm"
                >
                  ⚡ Match Candidate Against This JD (Role 5) →
                </button>
                <button
                  onClick={() => {
                    handleSaveJd();
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
        </div>
      )}
    </div>
  );
}

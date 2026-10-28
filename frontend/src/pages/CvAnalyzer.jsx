import React, { useState, useRef } from "react";
import { useWorkflow } from "../state/WorkflowContext";
import { SKILL_CATEGORIES, SAMPLE_CANDIDATES } from "../data/radixData";
import { extractTextFromResumeFile, parseResumeText } from "../services/careerEngine";

export default function CvAnalyzer() {
  const {
    state,
    selectCandidate,
    uploadCustomCv,
    updateCandidateSkills,
    targetCompany,
  } = useWorkflow();

  const { currentCandidate, cvAudit, talentCheckResult } = state;

  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState("");
  const [uploadSuccessFile, setUploadSuccessFile] = useState(
    currentCandidate?.source_file || null
  );

  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState("");

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentCandidate.name || "");

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCat, setNewSkillCat] = useState("COD");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("improvements"); // 'improvements', 'skills', 'profile'

  // Handle file drop / upload
  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsProcessing(true);
    setProcessStatus(`Reading ${file.name}...`);

    try {
      // Step 1: Extract clean text from file (PDF, DOCX, TXT)
      const text = await extractTextFromResumeFile(file);
      setProcessStatus("Extracting 12 SkillSync Competency Dimensions...");

      setTimeout(() => {
        // Step 2: Run 12-category parser and generate improvements
        const parsedProfile = parseResumeText(text, file.name);
        uploadCustomCv(parsedProfile);

        setUploadSuccessFile(file.name);
        setEditedName(parsedProfile.name);
        setIsProcessing(false);
        setProcessStatus("");
      }, 500);
    } catch (err) {
      console.error("File extraction error:", err);
      // Fallback: create safe candidate record using file name
      const fallbackProfile = parseResumeText("", file.name);
      uploadCustomCv(fallbackProfile);
      setUploadSuccessFile(file.name);
      setEditedName(fallbackProfile.name);
      setIsProcessing(false);
      setProcessStatus("");
    }
  };

  const handlePastedResumeSubmit = (e) => {
    e.preventDefault();
    if (!pastedText.trim()) return;
    setIsProcessing(true);
    setProcessStatus("Analyzing pasted resume text...");

    setTimeout(() => {
      const parsed = parseResumeText(pastedText, "pasted_resume.txt");
      uploadCustomCv(parsed);
      setUploadSuccessFile("Pasted Resume Content");
      setEditedName(parsed.name);
      setIsProcessing(false);
      setProcessStatus("");
      setPasteMode(false);
      setPastedText("");
    }, 400);
  };

  const handleSaveName = () => {
    if (!editedName.trim()) return;
    uploadCustomCv({
      ...currentCandidate,
      name: editedName.trim(),
    });
    setIsEditingName(false);
  };

  const handleCopyRewrite = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const existing = currentCandidate.skills || [];
    if (existing.some((s) => s.skill_name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      setNewSkillName("");
      return;
    }

    const updated = [
      ...existing,
      {
        skill_name: newSkillName.trim(),
        category_code: newSkillCat,
        confidence: "high",
        evidence: "Candidate manually verified & enhanced",
      },
    ];

    updateCandidateSkills(updated);
    setNewSkillName("");
  };

  const handleRemoveSkill = (skillNameToRemove) => {
    const updated = (currentCandidate.skills || []).filter(
      (s) => s.skill_name !== skillNameToRemove
    );
    updateCandidateSkills(updated);
  };

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--violet)",
              background: "var(--violet-subtle)",
              padding: "3px 10px",
              borderRadius: "999px",
              border: "1px solid var(--violet-border)",
            }}
          >
            ROLE 2 & 3 · RESUME PARSING & PROFILE BUILDER
          </span>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            AI CV Audit & Actionable Enhancements
          </span>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "0 0 6px 0", letterSpacing: "-0.03em" }}>
          CV Intelligence & AI Improvement Hub
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "15px" }}>
          Upload your resume or inspect sample candidates to extract competencies across the 12 SkillSync dimensions
          and get quantified Google XYZ bullet rewrites.
        </p>
      </div>

      {/* Prominent Active Upload Status Banner */}
      {uploadSuccessFile && (
        <div
          style={{
            background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
            border: "1px solid var(--emerald-border)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "24px" }}>✅</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--emerald)" }}>
                Active Resume: {uploadSuccessFile}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Candidate: <strong>{currentCandidate.name}</strong> · {currentCandidate.skills?.length || 0} Skills Extracted ·{" "}
                <strong style={{ color: "var(--text-primary)" }}>{talentCheckResult?.readiness_score || 0}% Ready</strong> for {targetCompany}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {!isEditingName ? (
              <button
                onClick={() => {
                  setEditedName(currentCandidate.name);
                  setIsEditingName(true);
                }}
                className="btn-secondary"
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                ✏️ Edit Name
              </button>
            ) : (
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--border-subtle)", fontSize: "12px" }}
                />
                <button onClick={handleSaveName} className="btn-primary" style={{ padding: "4px 10px", fontSize: "12px" }}>
                  Save
                </button>
              </div>
            )}
            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              🔄 Re-upload CV
            </button>
          </div>
        </div>
      )}

      {/* Upload Zone & Quick Sample Picker */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        {/* Clickable Drag & Drop Upload Card */}
        <div
          className="dropzone"
          style={{
            borderColor: dragActive ? "var(--primary)" : isProcessing ? "var(--violet)" : "var(--border-subtle)",
            background: dragActive ? "var(--primary-subtle)" : isProcessing ? "var(--violet-subtle)" : "#ffffff",
            cursor: "pointer",
            position: "relative",
          }}
          onClick={() => {
            if (!isProcessing && !pasteMode) fileInputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileUpload(e.target.files[0]);
                e.target.value = ""; // Reset so same file can be re-uploaded
              }
            }}
          />

          <div style={{ fontSize: "38px", marginBottom: "8px" }}>
            {isProcessing ? "⚙️" : "📤"}
          </div>

          <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
            {isProcessing ? processStatus || "Analyzing CV with AI..." : "Click to Upload or Drag Resume Here"}
          </h3>

          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 16px 0" }}>
            Accepts PDF, DOCX, or TXT formats (Max 10MB)
          </p>

          <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
            <span
              className="btn-primary"
              style={{
                pointerEvents: "none",
                background: isProcessing ? "var(--text-muted)" : "var(--primary)",
              }}
            >
              {isProcessing ? "Processing..." : "Browse Files"}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPasteMode(!pasteMode);
              }}
              className="btn-secondary"
              style={{ fontSize: "13px", padding: "8px 14px" }}
            >
              {pasteMode ? "Hide Paste Area" : "📋 Paste Text Instead"}
            </button>
          </div>
        </div>

        {/* Quick Sample Candidates Picker (Hackathon Deliberately Different Profiles) */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
              ⚡ Or Test with Official Hackathon Profiles
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 14px 0" }}>
              Test how different candidate backgrounds score differently:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {SAMPLE_CANDIDATES.map((cand) => (
                <button
                  key={cand.candidate_id}
                  onClick={() => {
                    selectCandidate(cand);
                    setUploadSuccessFile(null);
                    setEditedName(cand.name);
                  }}
                  style={{
                    padding: "10px",
                    borderRadius: "var(--radius-md)",
                    border: currentCandidate.candidate_id === cand.candidate_id ? "2px solid var(--primary)" : "1px solid var(--border-light)",
                    background: currentCandidate.candidate_id === cand.candidate_id ? "var(--primary-subtle)" : "#ffffff",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "var(--transition-fast)",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>
                    {cand.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {cand.tagline}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "12px", borderTop: "1px solid var(--border-light)", paddingTop: "8px" }}>
            Currently Auditing: <strong>{currentCandidate.name}</strong> ({currentCandidate.skills?.length || 0} skills)
          </div>
        </div>
      </div>

      {/* Optional Paste Resume Box */}
      {pasteMode && (
        <div className="card" style={{ marginBottom: "24px", border: "2px solid var(--violet-border)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 8px 0" }}>
            📋 Paste Resume / CV Text Content
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 12px 0" }}>
            Paste your experience, education, and technical skills below. Our engine will map them to the 12 SkillSync categories.
          </p>
          <form onSubmit={handlePastedResumeSubmit}>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste text here (e.g., Tanish Gupta - tanish@example.com - Skills: Python, SQL, Docker, System Design, DSA...)"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                marginBottom: "12px",
              }}
              required
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="btn-primary" disabled={isProcessing}>
                {isProcessing ? "Analyzing..." : "Parse & Optimize Pasted CV"}
              </button>
              <button type="button" onClick={() => setPasteMode(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sub Navigation: AI Improvements | Verified Skills | Profile Details */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveSubTab("improvements")}
          className={activeSubTab === "improvements" ? "btn-primary" : "btn-secondary"}
          style={{ fontSize: "13px", padding: "8px 16px" }}
        >
          ✨ AI CV Improvement Points ({cvAudit?.actionPoints?.length || 4})
        </button>
        <button
          onClick={() => setActiveSubTab("skills")}
          className={activeSubTab === "skills" ? "btn-primary" : "btn-secondary"}
          style={{ fontSize: "13px", padding: "8px 16px" }}
        >
          🏷️ Extracted Skills ({currentCandidate.skills?.length || 0})
        </button>
        <button
          onClick={() => setActiveSubTab("profile")}
          className={activeSubTab === "profile" ? "btn-primary" : "btn-secondary"}
          style={{ fontSize: "13px", padding: "8px 16px" }}
        >
          👤 Candidate Profile Details
        </button>
      </div>

      {/* Tab 1: AI CV Improvement Points */}
      {activeSubTab === "improvements" && (
        <div>
          {/* Action Points Cards */}
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 14px 0" }}>
              🎯 Specific Action Points for {targetCompany}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
              {(cvAudit?.actionPoints || []).map((point) => (
                <div key={point.id} className="card" style={{ borderLeft: "4px solid var(--violet)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {point.icon} {point.title}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: point.priority === "CRITICAL" ? "var(--rose-subtle)" : "var(--violet-subtle)",
                        color: point.priority === "CRITICAL" ? "var(--rose)" : "var(--violet)",
                      }}
                    >
                      {point.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                    {point.description}
                  </p>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--primary)" }}>
                    ✨ {point.badge}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Point 1: Google XYZ Formula Bullet Rewrites */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>
                  📝 Google XYZ Formula Bullet Rewrites
                </h2>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Transform weak, passive job descriptions into quantified accomplishments:
                  <em>"Accomplished [X] as measured by [Y], by doing [Z]"</em>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {(cvAudit?.bulletRewrites || []).map((rewrite, idx) => (
                <div key={idx} className="ai-audit-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span className="ai-pill-tag">
                      ⚡ {rewrite.tag}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                      {rewrite.rule}
                    </span>
                  </div>

                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                    <strong>Detected Issue:</strong> {rewrite.issue}
                  </div>

                  <div className="rewrite-comparison">
                    <div className="rewrite-box rewrite-before">
                      <span className="rewrite-label">❌ Current / Weak Phrasing</span>
                      "{rewrite.before}"
                    </div>
                    <div className="rewrite-box rewrite-after">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span className="rewrite-label" style={{ color: "var(--emerald)" }}>
                          ✓ Recommended High-Impact Rewrite
                        </span>
                        <button
                          onClick={() => handleCopyRewrite(rewrite.after, idx)}
                          style={{
                            background: "transparent",
                            border: "1px solid var(--emerald-border)",
                            color: "var(--emerald)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {copiedIndex === idx ? "✓ Copied!" : "📋 Copy"}
                        </button>
                      </div>
                      "{rewrite.after}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Point 2: Gap-Bridging Project Blueprint */}
          {cvAudit?.projectSuggestion && (
            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)",
                border: "1px solid var(--violet-border)",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span className="ai-pill-tag">🚀 Gap-Bridging Project Blueprint</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Targeted to close candidate's bottom competency gaps
                </span>
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 6px 0" }}>
                {cvAudit.projectSuggestion.title}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 14px 0" }}>
                {cvAudit.projectSuggestion.description}
              </p>
              <div style={{ background: "#ffffff", padding: "14px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                  Key Engineering Deliverables for Resume:
                </div>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--text-secondary)" }}>
                  {cvAudit.projectSuggestion.specs.map((spec, i) => (
                    <li key={i} style={{ marginBottom: "6px" }}>
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Extracted Skills across 12 Categories */}
      {activeSubTab === "skills" && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                🏷️ Verified Competencies ({currentCandidate.skills?.length || 0})
              </h2>
              <div className="card-subtitle">
                Tagged against the 12 SkillSync categories with evidence quotes
              </div>
            </div>

            {/* Quick Add Skill Form */}
            <form onSubmit={handleAddSkill} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Add skill (e.g., Redis, Kafka)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "13px",
                }}
              />
              <select
                value={newSkillCat}
                onChange={(e) => setNewSkillCat(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "13px",
                  background: "#ffffff",
                }}
              >
                {Object.keys(SKILL_CATEGORIES).map((code) => (
                  <option key={code} value={code}>
                    {code} - {SKILL_CATEGORIES[code].name}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-primary" style={{ padding: "6px 14px", fontSize: "13px" }}>
                + Add
              </button>
            </form>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {(currentCandidate.skills || []).map((skill) => {
              const cat = SKILL_CATEGORIES[skill.category_code] || SKILL_CATEGORIES.OTHER;
              return (
                <div
                  key={skill.skill_name}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 14px",
                    borderRadius: "var(--radius-full)",
                    background: cat.bgColor,
                    border: `1px solid ${cat.borderColor}`,
                  }}
                  title={skill.evidence}
                >
                  <span style={{ fontSize: "14px" }}>{cat.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: "13px", color: cat.color }}>
                    {skill.skill_name}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      background: cat.color,
                      color: "#ffffff",
                      padding: "1px 6px",
                      borderRadius: "999px",
                    }}
                  >
                    {skill.category_code}
                  </span>
                  <button
                    onClick={() => handleRemoveSkill(skill.skill_name)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-light)",
                      cursor: "pointer",
                      fontSize: "14px",
                      padding: 0,
                    }}
                    title="Remove skill"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Candidate Profile Details */}
      {activeSubTab === "profile" && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                👤 Candidate Background & Profile Summary
              </h2>
              <div className="card-subtitle">
                Education, experience, hackathons, and certifications
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                Candidate Name
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
                {currentCandidate.name} ({currentCandidate.email})
              </div>

              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                Education
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                {currentCandidate.education}
              </div>

              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                Preferred Target Roles
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                {(currentCandidate.preferred_roles || []).map((r, i) => (
                  <span key={i} className="skill-chip">
                    💼 {r}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                Hackathons & Competitions
              </div>
              <ul style={{ margin: "0 0 16px 0", paddingLeft: "18px", fontSize: "13px", color: "var(--text-secondary)" }}>
                {(currentCandidate.hackathons || []).map((h, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>
                    {h}
                  </li>
                ))}
              </ul>

              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                Certifications
              </div>
              <ul style={{ margin: "0 0 16px 0", paddingLeft: "18px", fontSize: "13px", color: "var(--text-secondary)" }}>
                {(currentCandidate.certifications || []).map((c, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

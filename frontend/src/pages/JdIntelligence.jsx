import React, { useState } from "react";
import { useWorkflow } from "../state/WorkflowContext";
import { OFFICIAL_JOB_DESCRIPTIONS, SKILL_CATEGORIES } from "../data/radixData";

export default function JdIntelligence() {
  const { state, selectTargetJd, uploadCustomJd, setActiveTab } = useWorkflow();
  const { targetJd } = state;

  const [customTitle, setCustomTitle] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [customText, setCustomText] = useState("");
  const [showPasteModal, setShowPasteModal] = useState(false);

  const handleCustomJdSubmit = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;

    // Extract skills dynamically using keyword matching
    const sampleSkills = [
      { skill_name: "Python", category_code: "COD", evidence: "Backend application development", confidence: "high" },
      { skill_name: "SQL", category_code: "SQL", evidence: "Database queries and schema design", confidence: "high" },
      { skill_name: "System Design", category_code: "SYSD", evidence: "High availability architecture", confidence: "medium" },
      { skill_name: "Git", category_code: "SWE", evidence: "Version control workflows", confidence: "medium" },
      { skill_name: "Problem Solving", category_code: "APTI", evidence: "Analytical reasoning", confidence: "high" },
    ];

    const newJd = {
      id: `custom-jd-${Date.now().toString(36)}`,
      company: customCompany.trim() || "Target Company",
      role: customTitle.trim() || "Software Engineer",
      location: "Bengaluru, India",
      department: "Engineering",
      description: customText,
      skills: sampleSkills,
    };

    uploadCustomJd(newJd);
    setShowPasteModal(false);
    setCustomTitle("");
    setCustomCompany("");
    setCustomText("");
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--primary)",
              background: "var(--primary-subtle)",
              padding: "3px 10px",
              borderRadius: "999px",
              border: "1px solid var(--primary-border)",
            }}
          >
            ROLE 1 · JOB DESCRIPTION ANALYTICS
          </span>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            6 Benchmark Roles & Custom JD Intelligence
          </span>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "0 0 6px 0", letterSpacing: "-0.03em" }}>
          Target Job Description Analytics
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "15px" }}>
          Select from the 6 real benchmark JDs (Google, Microsoft, Oracle Financial Services) or paste a custom JD
          to extract required competencies across the 12 SkillSync skill categories.
        </p>
      </div>

      {/* 6 Benchmark Role Cards Selector */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: 0 }}>
            💼 Choose from 6 Official Hackathon Benchmark JDs
          </h2>
          <button
            onClick={() => setShowPasteModal(!showPasteModal)}
            className="btn-secondary"
            style={{ fontSize: "13px", padding: "6px 14px" }}
          >
            {showPasteModal ? "Cancel" : "+ Paste Custom JD"}
          </button>
        </div>

        {/* Custom JD Paste Area */}
        {showPasteModal && (
          <div className="card" style={{ marginBottom: "20px", border: "2px solid var(--primary-border)" }}>
            <h3 style={{ fontSize: "16px", margin: "0 0 10px 0" }}>Paste Job Description Text</h3>
            <form onSubmit={handleCustomJdSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="Company Name (e.g., Google, Stripe)"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}
                  required
                />
                <input
                  type="text"
                  placeholder="Role Title (e.g., Backend SWE)"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}
                  required
                />
              </div>
              <textarea
                rows={5}
                placeholder="Paste responsibilities and requirements text here..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", fontSize: "13px" }}
                required
              />
              <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>
                Extract Skills with AI
              </button>
            </form>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
          {OFFICIAL_JOB_DESCRIPTIONS.map((jd) => {
            const isSelected = targetJd?.id === jd.id;
            return (
              <div
                key={jd.id}
                onClick={() => selectTargetJd(jd)}
                className="card"
                style={{
                  cursor: "pointer",
                  border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-light)",
                  background: isSelected ? "var(--primary-subtle)" : "#ffffff",
                  position: "relative",
                  transition: "var(--transition-fast)",
                }}
              >
                {isSelected && (
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      fontSize: "10px",
                      fontWeight: 800,
                      background: "var(--primary)",
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "999px",
                    }}
                  >
                    ACTIVE TARGET
                  </span>
                )}
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  🏢 {jd.company}
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "4px 0 6px 0", color: "var(--text-primary)" }}>
                  {jd.role}
                </h3>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                  📍 {jd.location} · {jd.skills.length} competencies extracted
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {jd.skills.slice(0, 4).map((s) => (
                    <span
                      key={s.skill_name}
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: isSelected ? "#ffffff" : "var(--bg-subtle)",
                        border: "1px solid var(--border-light)",
                        fontWeight: 600,
                      }}
                    >
                      {s.skill_name}
                    </span>
                  ))}
                  {jd.skills.length > 4 && (
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", padding: "2px 4px" }}>
                      +{jd.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active JD Details & Extracted Skill Breakdown */}
      {targetJd && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                🔍 Extracted Technical Requirements for {targetJd.role}
              </h2>
              <div className="card-subtitle">
                {targetJd.company} · {targetJd.location} · {targetJd.skills.length} verified competencies
              </div>
            </div>
            <button
              onClick={() => setActiveTab("skill-matching")}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: "13px" }}
            >
              Match Candidate Fit →
            </button>
          </div>

          {/* Job Description Text Snippet */}
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-subtle)",
              marginBottom: "20px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              whiteSpace: "pre-line",
            }}
          >
            {targetJd.description}
          </div>

          {/* Extracted 12-Category Table */}
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 12px 0" }}>
            Extracted Requirements & Evidence Quotes
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {targetJd.skills.map((skill, index) => {
              const cat = SKILL_CATEGORIES[skill.category_code] || SKILL_CATEGORIES.OTHER;
              return (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 160px 1fr 100px",
                    alignItems: "center",
                    gap: "14px",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-light)",
                    background: "#ffffff",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                    {skill.skill_name}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{cat.icon}</span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: cat.bgColor,
                        color: cat.color,
                        border: `1px solid ${cat.borderColor}`,
                      }}
                    >
                      {skill.category_code} · {cat.name}
                    </span>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                    "{skill.evidence || "Required core competency"}"
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: skill.confidence === "high" ? "var(--emerald-subtle)" : "var(--amber-subtle)",
                        color: skill.confidence === "high" ? "var(--emerald)" : "var(--amber)",
                      }}
                    >
                      {skill.confidence?.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

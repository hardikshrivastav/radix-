import React from "react";
import { useWorkflow } from "../state/WorkflowContext";
import { OFFICIAL_JOB_DESCRIPTIONS } from "../data/radixData";

export default function SkillMatching() {
  const { state, selectTargetJd, setActiveTab } = useWorkflow();
  const { currentCandidate, targetJd, matchResult, jdResult } = state;

  const score = matchResult?.match_score || 0;
  const matched = matchResult?.matched_skills || [];
  const missing = matchResult?.missing_skills || [];
  const activeJd = targetJd || OFFICIAL_JOB_DESCRIPTIONS[0];

  // List of candidate jobs: custom analyzed JD (if present) + the 6 benchmark JDs
  const availableJds = [];
  if (jdResult && !OFFICIAL_JOB_DESCRIPTIONS.some((j) => j.id === jdResult.id)) {
    availableJds.push({
      id: jdResult.id,
      role: `${jdResult.role} [Analyzed JD]`,
      company: jdResult.company,
      data: jdResult,
    });
  }
  OFFICIAL_JOB_DESCRIPTIONS.forEach((j) => {
    availableJds.push({
      id: j.id,
      role: j.role,
      company: j.company,
      data: j,
    });
  });

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
            ROLE 5 · SKILL MATCHING
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Posting-Specific Skill Alignment & Gap Analysis
          </span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0", color: "var(--text-primary)" }}>
          Target Job Fit & Skill Matching
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13.5px" }}>
          Evaluates <strong>{currentCandidate.name}</strong> against <strong>{activeJd.role}</strong> at{" "}
          <strong>{activeJd.company}</strong> using explainable deterministic matching logic.
        </p>
      </div>

      {/* Target JD Selection Strip */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "14px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-muted)" }}>
            SELECT TARGET ROLE:
          </span>
          <select
            className="select-input"
            value={activeJd.id}
            onChange={(e) => {
              const selectedItem = availableJds.find((j) => j.id === e.target.value);
              if (selectedItem) selectTargetJd(selectedItem.data);
            }}
            style={{ minWidth: "280px", fontWeight: 600 }}
          >
            {availableJds.map((j) => (
              <option key={j.id} value={j.id}>
                💼 {j.role} ({j.company})
              </option>
            ))}
          </select>
        </div>

        <button onClick={() => setActiveTab("jd-analytics")} className="btn-secondary btn-sm">
          Inspect / Edit JD in JD Analytics →
        </button>
      </div>

      {/* Match Score Hero Card */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          borderLeft: `4px solid ${score >= 75 ? "var(--emerald)" : "var(--primary)"}`,
        }}
      >
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Posting Skill Alignment Score
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", margin: "4px 0" }}>
            <span
              style={{
                fontSize: "42px",
                fontWeight: 900,
                color: score >= 75 ? "var(--emerald)" : score >= 50 ? "var(--amber)" : "var(--rose)",
                letterSpacing: "-0.04em",
              }}
            >
              {score}%
            </span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-secondary)" }}>
              {matchResult?.verdict}
            </span>
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "4px" }}>
            {matched.length} requirements verified in candidate profile · {missing.length} missing skill gaps identified
          </div>
          <div style={{ fontSize: "11px", color: "var(--amber)", fontWeight: 600 }}>
            ℹ️ Notice: The match score is an explainable estimate of technical skill alignment, not a probability or guarantee of being hired.
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => setActiveTab("profile-builder")} className="btn-primary">
            👤 Update Profile in Profile Builder
          </button>
        </div>
      </div>

      {/* Practical Recommendations Card */}
      {missing.length > 0 && (
        <div className="card" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-light)" }}>
          <h2 className="card-title" style={{ fontSize: "14px", marginBottom: "8px", color: "var(--primary)" }}>
            💡 Practical Recommendations for Improving Alignment with {activeJd.company}
          </h2>
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            <li>
              <strong>Prioritize Critical Gaps:</strong> Target highest-weighted missing competencies (
              {missing.filter((m) => m.priority === "critical").map((m) => m.skill_name).join(", ") || "None"}
              ) by implementing a focused repository or technical case study.
            </li>
            <li>
              <strong>Update Profile Terminology:</strong> Verify whether you possess synonymous skills (e.g., if the JD requires "{missing[0]?.skill_name}", ensure your profile explicitly mentions it).
            </li>
            <li>
              <strong>Bridge Preferred Skills:</strong> For nice-to-have requirements, demonstrate familiarity through short-form certifications or hackathon prototypes.
            </li>
          </ul>
        </div>
      )}

      {/* Two Column Grid: Matched Skills vs Missing Skills */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
        {/* Missing Skills (Gap List - Prioritized) */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 className="card-title" style={{ margin: 0, color: "var(--rose)" }}>
              ⚠️ Missing Skills Gap List ({missing.length})
            </h2>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Prioritized by weight</span>
          </div>

          {missing.length === 0 ? (
            <div style={{ fontSize: "13px", color: "var(--emerald)", padding: "12px", background: "var(--emerald-subtle)", borderRadius: "var(--radius-sm)" }}>
              ✓ Outstanding match! All required competencies found in candidate profile.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {missing.map((sk, idx) => (
                <div
                  key={`${sk.skill_name}-${idx}`}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-light)",
                    borderLeft: `3px solid ${sk.priority === "critical" ? "var(--rose)" : "var(--amber)"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>
                      {sk.skill_name}
                    </span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span className="category-tag">{sk.category_code}</span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "1px 5px",
                          borderRadius: "4px",
                          background: sk.priority === "critical" ? "var(--rose-subtle)" : "var(--amber-subtle)",
                          color: sk.priority === "critical" ? "var(--rose)" : "var(--amber)",
                        }}
                      >
                        {sk.priority}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                    {sk.evidence || "Explicit requirement in job posting"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matched Skills */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 className="card-title" style={{ margin: 0, color: "var(--emerald)" }}>
              ✓ Verified Matched Skills ({matched.length})
            </h2>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Verified in profile</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {matched.map((sk, idx) => (
              <div
                key={`${sk.skill_name}-${idx}`}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-light)",
                  borderLeft: "3px solid var(--emerald)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>
                    {sk.skill_name}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <span className="category-tag">{sk.category_code}</span>
                    <span style={{ fontSize: "10px", color: "var(--emerald)", fontWeight: 700 }}>
                      {sk.match_type || "MATCH"}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  {sk.evidence || "Demonstrated in candidate profile"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connected Workflow Actions Bar */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", padding: "16px 20px" }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
            Next Step: Comprehensive Executive Review
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            You have evaluated job alignment ({score}%). See the complete synthesized result across all 5 features in the Unified Report.
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("jd-analytics")}
            className="btn-secondary btn-sm"
          >
            📄 Analyze Different JD (Role 1) →
          </button>
          <button
            onClick={() => setActiveTab("profile-builder")}
            className="btn-secondary btn-sm"
          >
            👤 Refine Profile (Role 3) →
          </button>
          <button
            onClick={() => setActiveTab("talent-check")}
            className="btn-secondary btn-sm"
          >
            🎯 Talent Check (Role 4) →
          </button>
          <button
            onClick={() => setActiveTab("unified-report")}
            className="btn-primary btn-sm"
          >
            📊 View Unified 5-in-1 Report →
          </button>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useWorkflow } from "../state/WorkflowContext";
import { Card, StatusBadge } from "../components/UIComponents";
import CategoryBadge, { CATEGORY_NAMES } from "../components/CategoryBadge";

export default function Dashboard({ onSelectModule }) {
  const { state, resetWorkflow } = useWorkflow();
  const {
    selectedCompany,
    targetRole,
    jdResult,
    resumeResult,
    profile,
    talentCheckResult,
    matchResult,
    completedSteps,
  } = state;

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPct = Math.round((completedCount / 5) * 100);

  const modules = [
    {
      id: "jd-analytics",
      step: 1,
      name: "Role 1: JD Analytics",
      roleOwner: "Team Member #1 (Active)",
      accent: "var(--accent-mod-1)",
      description: "Extract technical requirements and competencies from a Job Description (PDF/DOCX) mapped to the 12 RADIX categories.",
      inputs: ["Job Description (PDF / DOCX / Text)", "Company & Role"],
      outputs: ["12-Category JDSkillList JSON", "Evidence Quotes"],
      isCompleted: Boolean(completedSteps[1]),
      isOwner: true,
      detail: jdResult ? `${jdResult.skills.length} skills extracted for ${jdResult.company || "Target Company"}` : null,
    },
    {
      id: "resume-parsing",
      step: 2,
      name: "Role 2: Resume Parsing",
      roleOwner: "Team Member #2",
      accent: "var(--accent-mod-2)",
      description: "Parse candidate resume document and extract candidate skills, work experience, and educational background.",
      inputs: ["Candidate Resume (.pdf / .docx)"],
      outputs: ["Resume Skills JSON (source_type: 'resume')"],
      isCompleted: Boolean(completedSteps[2]),
      isOwner: false,
      detail: resumeResult ? "Resume analyzed" : "Awaiting Resume upload",
    },
    {
      id: "profile-builder",
      step: 3,
      name: "Role 3: Profile Builder",
      roleOwner: "Team Member #3",
      accent: "var(--accent-mod-3)",
      description: "Synthesize resume skills, hackathons, internships, and role preferences into a unified candidate profile.",
      inputs: ["Parsed Resume Skills", "Candidate Form Inputs"],
      outputs: ["Unified Candidate Profile JSON"],
      isCompleted: Boolean(completedSteps[3]),
      isOwner: false,
      detail: profile ? profile.name : "Awaiting profile synthesis",
    },
    {
      id: "talent-check",
      step: 4,
      name: "Role 4: Talent Check",
      roleOwner: "Team Member #4",
      accent: "var(--accent-mod-4)",
      description: "Assess candidate readiness against benchmarked company hiring expectations across the 12 skill categories.",
      inputs: ["Candidate Profile", "Company Benchmarks"],
      outputs: ["Category Gap Matrix (1-10)", "Readiness Score (0-100)"],
      isCompleted: Boolean(completedSteps[4]),
      isOwner: false,
      detail: talentCheckResult ? `Score: ${talentCheckResult.readiness_score}/100` : "Awaiting assessment",
    },
    {
      id: "skill-matching",
      step: 5,
      name: "Role 5: Skill Matching",
      roleOwner: "Team Member #5",
      accent: "var(--accent-mod-5)",
      description: "Compare candidate profile directly against JD requirements to generate match score and identify upskilling gaps.",
      inputs: ["JD Skills (from Role 1)", "Candidate Profile (from Role 3)"],
      outputs: ["Match Score (0-100)", "Matched Skills", "Missing Skills"],
      isCompleted: Boolean(completedSteps[5]),
      isOwner: false,
      detail: matchResult ? `Match: ${matchResult.match_score}%` : "Awaiting matching",
    },
  ];

  return (
    <div>
      {/* Hero Header */}
      <div
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-xl)",
          padding: "36px 32px",
          marginBottom: "28px",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div className="eyebrow" style={{ color: "var(--primary)" }}>RADIX TALENT MATCH WORKFLOW</div>
            <h1 style={{ fontSize: "32px", margin: "0 0 10px", letterSpacing: "-0.03em" }}>
              Understand how ready you are for a specific job
            </h1>
            <p style={{ margin: "0", color: "var(--text-secondary)", fontSize: "16px", maxWidth: "700px" }}>
              An intelligent 5-stage pipeline mapping candidate capabilities against job requirements
              using the authoritative 12-competency framework.
            </p>
          </div>

          {/* Overall Progress Widget */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius-lg)",
              padding: "16px 20px",
              minWidth: "220px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>Pipeline Progress</span>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--primary)" }}>{progressPct}%</span>
            </div>
            <div style={{ height: "8px", background: "var(--bg-muted)", borderRadius: "9999px", overflow: "hidden", marginBottom: "8px" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, #2563eb, #10b981)",
                  borderRadius: "9999px",
                  transition: "width 300ms ease",
                }}
              />
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
              <span>{completedCount} of 5 steps done</span>
              {completedCount > 0 && (
                <button
                  onClick={resetWorkflow}
                  style={{ background: "none", border: "none", color: "#dc2626", fontSize: "11px", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Target Context Strip */}
      <div className="workflow-strip">
        <div className="strip-item">
          <span className="strip-label">Target Company:</span>
          <span className="strip-value" style={{ color: selectedCompany ? "var(--primary)" : "var(--text-muted)" }}>
            {selectedCompany || "Not selected yet"}
          </span>
        </div>
        <div className="strip-item">
          <span className="strip-label">Target Role:</span>
          <span className="strip-value" style={{ color: targetRole ? "var(--text-primary)" : "var(--text-muted)" }}>
            {targetRole || "Not specified"}
          </span>
        </div>
        <div className="strip-item">
          <span className="strip-label">Active JD Source:</span>
          <span className="strip-value" style={{ color: jdResult ? "#16a34a" : "var(--text-muted)" }}>
            {jdResult ? `✓ ${jdResult.source_file} (${jdResult.skills.length} skills)` : "No JD analyzed"}
          </span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onSelectModule("jd-analytics")}
          style={{ padding: "7px 14px", fontSize: "13px" }}
        >
          {jdResult ? "View JD Skills →" : "Start with Step 1 (JD Analytics) →"}
        </button>
      </div>

      {/* Module Cards Grid */}
      <h2 style={{ fontSize: "20px", margin: "32px 0 16px", fontWeight: 700 }}>
        The 5 Workflow Modules
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        {modules.map((m) => (
          <Card
            key={m.id}
            interactive
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderTop: `4px solid ${m.accent}`,
              position: "relative",
            }}
            onClick={() => onSelectModule(m.id)}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: m.accent, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    STEP {m.step} · {m.roleOwner}
                  </span>
                  <h3 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {m.name.split(": ")[1] || m.name}
                  </h3>
                </div>
                <StatusBadge status={m.isCompleted ? "Completed" : m.isOwner ? "In progress" : "ready"} />
              </div>

              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "16px" }}>
                {m.description}
              </p>

              {/* Data Contracts Hand-off preview */}
              <div style={{ background: "var(--bg-subtle)", padding: "10px 12px", borderRadius: "var(--radius-md)", marginBottom: "16px", fontSize: "12px" }}>
                <div style={{ marginBottom: "4px" }}>
                  <strong style={{ color: "var(--text-muted)" }}>IN: </strong>
                  <span style={{ color: "var(--text-secondary)" }}>{m.inputs.join(", ")}</span>
                </div>
                <div>
                  <strong style={{ color: "var(--text-muted)" }}>OUT: </strong>
                  <span style={{ color: "var(--text-secondary)" }}>{m.outputs.join(", ")}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border-light)" }}>
              <span style={{ fontSize: "13px", color: m.detail ? "#15803d" : "var(--text-muted)", fontWeight: 500 }}>
                {m.detail || "Click to open module"}
              </span>
              <span style={{ color: m.accent, fontWeight: 700, fontSize: "14px" }}>
                Open →
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* 12-Category Reference Bar */}
      <div style={{ background: "#ffffff", border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)", padding: "24px" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700 }}>
          Authoritative 12-Category Competency Framework
        </h3>
        <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--text-secondary)" }}>
          Every skill extracted by Role 1 and assessed across the 5 modules maps directly to one of these standardized categories:
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {Object.entries(CATEGORY_NAMES).map(([code, name]) => (
            <div key={code} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--bg-subtle)", padding: "4px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
              <CategoryBadge code={code} />
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useWorkflow } from "../state/WorkflowContext";
import { COMPANY_BENCHMARKS } from "../data/radixData";

export default function TalentCheck() {
  const { state, selectCompany, setActiveTab } = useWorkflow();
  const { currentCandidate, targetCompany, talentCheckResult } = state;

  const [companySearch, setCompanySearch] = useState("");

  const gaps = (talentCheckResult?.skillset_gap || []).filter((g) => g.gap);
  const meets = (talentCheckResult?.skillset_gap || []).filter((g) => !g.gap);
  const readiness = talentCheckResult?.readiness_score || 0;

  // Additional companies from staging benchmarks for the selector
  const additionalCompanies = [
    { name: "Google LLC", tier: "Tier 1 Big Tech", focus: "Systems & Algorithms" },
    { name: "Microsoft Corporation", tier: "Tier 1 Big Tech", focus: "Cloud & OOP" },
    { name: "Amazon.com, Inc.", tier: "Tier 1 Big Tech", focus: "Scalability & Ownership" },
    { name: "Oracle Financial Services Software", tier: "Enterprise Financial Tech", focus: "SQL & Enterprise Stability" },
    { name: "Accenture plc", tier: "Global Consulting", focus: "Software Engineering & Cloud" },
    { name: "Apple Inc.", tier: "Tier 1 Big Tech", focus: "Hardware-Software & Concurrency" },
    { name: "Swiggy Limited", tier: "High-Growth Unicorn", focus: "Distributed Backend & Speed" },
    { name: "Tata Consultancy Services Limited", tier: "Global IT Services", focus: "Enterprise Engineering & Delivery" },
    { name: "Infosys Limited", tier: "Global IT Services", focus: "Full-Stack & Cloud Architecture" },
    { name: "Cisco Systems, Inc.", tier: "Networking Infrastructure", focus: "Networks, TCP/IP & OS" },
    { name: "Snowflake Inc.", tier: "Data Cloud Leader", focus: "Data Warehousing & SQL Query Performance" },
    { name: "Palantir Technologies", tier: "Enterprise AI & Defense", focus: "Big Data & AI Pipelines" },
  ];

  const filteredCompanies = additionalCompanies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
    c.tier.toLowerCase().includes(companySearch.toLowerCase()) ||
    c.focus.toLowerCase().includes(companySearch.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--amber)",
              background: "var(--amber-subtle)",
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
            }}
          >
            ROLE 4 · TALENT CHECK BENCHMARK
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            SkillSync 12-Skillset Competency Evaluation
          </span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0", color: "var(--text-primary)" }}>
          Company Readiness & Gap Benchmark
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13.5px" }}>
          Evaluates <strong>{currentCandidate.name}</strong>'s competencies against the hiring bars for target employers
          (1.0 - 10.0 scale). Plain deterministic scoring clearly distinguishes unavailable evidence from verified deficiencies.
        </p>
      </div>

      {/* Target Company Selector & Search */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
            Select Target Employer Benchmark
          </div>
          <input
            type="text"
            className="input-text"
            placeholder="Search company (e.g. Google, Amazon, Swiggy)..."
            value={companySearch}
            onChange={(e) => setCompanySearch(e.target.value)}
            style={{ maxWidth: "280px", fontSize: "12px", padding: "6px 10px" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
          {filteredCompanies.map((c) => {
            const isSelected = targetCompany.toLowerCase().includes(c.name.toLowerCase().split(" ")[0]);
            return (
              <div
                key={c.name}
                onClick={() => selectCompany(c.name)}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border-light)",
                  background: isSelected ? "var(--primary-subtle)" : "var(--bg-subtle)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    {c.tier}
                  </span>
                  {isSelected && (
                    <span style={{ fontSize: "9.5px", fontWeight: 800, background: "var(--primary)", color: "#fff", padding: "1px 6px", borderRadius: "999px" }}>
                      ACTIVE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "3px" }}>
                  🏢 {c.name}
                </div>
                <div style={{ fontSize: "11px", color: "var(--primary)", fontWeight: 600 }}>
                  Focus: {c.focus}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Readiness Metric Card */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          borderLeft: `4px solid ${readiness >= 75 ? "var(--emerald)" : "var(--amber)"}`,
        }}
      >
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Candidate Readiness Score for {targetCompany}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", margin: "4px 0" }}>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 900,
                color: readiness >= 75 ? "var(--emerald)" : readiness >= 55 ? "var(--amber)" : "var(--rose)",
                letterSpacing: "-0.04em",
              }}
            >
              {readiness}%
            </span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-secondary)" }}>
              {talentCheckResult?.verdict}
            </span>
          </div>
          <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
            {meets.length} skillsets meet expected standards · {gaps.length} gaps or unverified dimensions
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => setActiveTab("skill-matching")} className="btn-primary">
            ⚡ Run Specific Job Match →
          </button>
          <button onClick={() => setActiveTab("profile-builder")} className="btn-secondary">
            Enrich Profile Skills
          </button>
        </div>
      </div>

      {/* 12-Skillset Comparison Table with Evidence Distinction */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            📊 12-Skillset Benchmark Evaluation Matrix
          </h2>
          <div style={{ display: "flex", gap: "12px", fontSize: "11px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--emerald)" }} />
              Meets Bar
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--amber)" }} />
              Deficiency
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#94a3b8" }} />
              No Evidence
            </span>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)", textAlign: "left", color: "var(--text-muted)" }}>
                <th style={{ padding: "8px 12px" }}>Code</th>
                <th style={{ padding: "8px 12px" }}>Skillset Category</th>
                <th style={{ padding: "8px 12px" }}>Candidate Level</th>
                <th style={{ padding: "8px 12px" }}>Company Bar</th>
                <th style={{ padding: "8px 12px" }}>Evaluation Status</th>
              </tr>
            </thead>
            <tbody>
              {(talentCheckResult?.skillset_gap || []).map((row) => {
                const hasNoEvidence = row.candidate_level <= 1.0;
                return (
                  <tr key={row.category_code} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--text-primary)" }}>
                      <span className="category-tag">{row.category_code}</span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--text-primary)" }}>
                      {row.category_info?.fullName || row.category_code}
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {row.candidate_level} / 10
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>
                      {row.required_level} / 10
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {hasNoEvidence ? (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "var(--radius-full)",
                            color: "#64748b",
                            background: "var(--bg-subtle)",
                            border: "1px solid var(--border-subtle)",
                          }}
                          title="No candidate skills or evidence recorded in this dimension"
                        >
                          ❓ Unavailable Evidence
                        </span>
                      ) : row.gap ? (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "var(--radius-full)",
                            color: "var(--amber)",
                            background: "var(--amber-subtle)",
                            border: "1px solid var(--amber-border)",
                          }}
                        >
                          ⚠️ Skill Deficiency ({row.delta})
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "var(--radius-full)",
                            color: "var(--emerald)",
                            background: "var(--emerald-subtle)",
                            border: "1px solid var(--emerald-border)",
                          }}
                        >
                          ✓ Verified Meets Bar
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actionable Gaps Breakdown */}
      {gaps.length > 0 && (
        <div className="card">
          <h2 className="card-title" style={{ color: "var(--amber)" }}>
            ⚠️ Actionable Improvement Insights ({gaps.length})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
            {gaps.map((gap) => {
              const isNoEvidence = gap.candidate_level <= 1.0;
              return (
                <div
                  key={gap.category_code}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                      {gap.category_info?.fullName || gap.category_code}
                    </span>
                    <span className="category-tag">{gap.category_code}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Candidate Level: <strong>{gap.candidate_level}</strong> vs Target Bar: <strong>{gap.required_level}</strong>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                    {isNoEvidence ? (
                      <span>💡 <em>No evidence currently detected.</em> Add relevant coursework, personal projects, or internship achievements in Profile Builder.</span>
                    ) : (
                      <span>⚡ <em>Partial evidence detected.</em> Deepen hands-on competency to elevate verified score from {gap.candidate_level} to {gap.required_level}.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connected Workflow Actions Bar */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", padding: "16px 20px" }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
            Next Step in Career Pipeline
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Benchmark complete with {readiness}% readiness. Continue to job fit matching or refine your profile.
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("profile-builder")}
            className="btn-secondary btn-sm"
          >
            👤 Update Profile (Role 3) →
          </button>
          <button
            onClick={() => setActiveTab("jd-analytics")}
            className="btn-secondary btn-sm"
          >
            📄 Analyze JD (Role 1) →
          </button>
          <button
            onClick={() => setActiveTab("skill-matching")}
            className="btn-primary btn-sm"
          >
            ⚡ Proceed to Skill Matching (Role 5) →
          </button>
          <button
            onClick={() => setActiveTab("unified-report")}
            className="btn-secondary btn-sm"
            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
          >
            📊 Unified 5-in-1 Report →
          </button>
        </div>
      </div>
    </div>
  );
}

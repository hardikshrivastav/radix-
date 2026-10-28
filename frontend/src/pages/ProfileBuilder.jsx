import React, { useState, useEffect } from "react";
import { useWorkflow } from "../state/WorkflowContext";
import { SKILL_CATEGORIES } from "../data/radixData";

const parseList = (str) =>
  str
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

export default function ProfileBuilder() {
  const { state, updateProfile, setActiveTab } = useWorkflow();
  const { currentCandidate } = state;

  const [formData, setFormData] = useState({
    name: currentCandidate?.name || "",
    email: currentCandidate?.email || "",
    education: currentCandidate?.education || "",
    skillsStr: (currentCandidate?.skills || []).map((s) => s.skill_name).join(", "),
    hackathonsStr: (currentCandidate?.hackathons || []).join("\n"),
    internshipsStr: (currentCandidate?.experience || currentCandidate?.internships || []).join("\n"),
    certificationsStr: (currentCandidate?.certifications || []).join("\n"),
    preferredRolesStr: (currentCandidate?.preferred_roles || []).join(", "),
  });

  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (currentCandidate) {
      setFormData({
        name: currentCandidate.name || "",
        email: currentCandidate.email || "",
        education: currentCandidate.education || "",
        skillsStr: (currentCandidate.skills || []).map((s) => s.skill_name).join(", "),
        hackathonsStr: (currentCandidate.hackathons || []).join("\n"),
        internshipsStr: (currentCandidate.experience || currentCandidate.internships || []).join("\n"),
        certificationsStr: (currentCandidate.certifications || []).join("\n"),
        preferredRolesStr: (currentCandidate.preferred_roles || []).join(", "),
      });
    }
  }, [currentCandidate]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setSaveStatus(null);
  };

  const handleSave = (e) => {
    e.preventDefault();

    // Map skills to categories if existing, or assign default category
    const existingSkillsMap = new Map(
      (currentCandidate?.skills || []).map((s) => [s.skill_name.toLowerCase(), s])
    );

    const skillsNames = parseList(formData.skillsStr);
    const updatedSkills = skillsNames.map((name) => {
      const match = existingSkillsMap.get(name.toLowerCase());
      if (match) return match;
      return {
        skill_name: name,
        category_code: "OTHER",
        confidence: "medium",
        evidence: "Added in SkillSync Profile Builder",
      };
    });

    const updatedProfile = {
      ...currentCandidate,
      name: formData.name.trim() || "Candidate Profile",
      email: formData.email.trim(),
      education: formData.education.trim(),
      skills: updatedSkills,
      hackathons: parseList(formData.hackathonsStr),
      experience: parseList(formData.internshipsStr),
      internships: parseList(formData.internshipsStr),
      certifications: parseList(formData.certificationsStr),
      preferred_roles: parseList(formData.preferredRolesStr),
    };

    updateProfile(updatedProfile);
    setSaveStatus("Profile saved successfully to SkillSync ✓");
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleExportJson = () => {
    const exportObject = {
      name: currentCandidate.name,
      email: currentCandidate.email,
      education: currentCandidate.education,
      skills: currentCandidate.skills,
      hackathons: currentCandidate.hackathons || [],
      internships: currentCandidate.experience || [],
      certifications: currentCandidate.certifications || [],
      preferred_roles: currentCandidate.preferred_roles || [],
      cv_file: currentCandidate.source_file || "candidate_cv.pdf",
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentCandidate.name.toLowerCase().replace(/\s+/g, "_")}_skillsync_profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
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
              ROLE 3 · PROFILE BUILDER
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Career-Ready Profile & Competency Verification
            </span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 4px 0", color: "var(--text-primary)" }}>
            Candidate Profile Builder
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13.5px" }}>
            Enrich your profile with hackathons, certifications, internship achievements, and verified competencies.
            Data directly feeds into Talent Check and Skill Matching.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={handleExportJson} className="btn-secondary btn-sm">
            💾 Export JSON
          </button>
          <button onClick={() => setActiveTab("talent-check")} className="btn-primary btn-sm">
            🎯 Check Readiness →
          </button>
          <button onClick={() => setActiveTab("skill-matching")} className="btn-secondary btn-sm">
            ⚡ Match With Jobs →
          </button>
        </div>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSave} className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, marginBottom: "6px" }}>
              Full Name
            </label>
            <input
              type="text"
              className="input-text"
              value={formData.name}
              onChange={handleChange("name")}
              placeholder="e.g. Rohan Verma"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, marginBottom: "6px" }}>
              Email Address
            </label>
            <input
              type="email"
              className="input-text"
              value={formData.email}
              onChange={handleChange("email")}
              placeholder="e.g. rohan.verma@example.com"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, marginBottom: "6px" }}>
              Education
            </label>
            <input
              type="text"
              className="input-text"
              value={formData.education}
              onChange={handleChange("education")}
              placeholder="e.g. B.Tech Computer Science & Engineering"
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, marginBottom: "6px" }}>
            Technical Skills (comma-separated)
          </label>
          <textarea
            className="textarea-input"
            rows={3}
            value={formData.skillsStr}
            onChange={handleChange("skillsStr")}
            placeholder="Python, Data Structures, SQL, Docker, System Design..."
          />
          <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
            Skills automatically map into the 12 SkillSync framework categories (COD, DSA, OOD, SQL, SYSD, NETW, AI, CLOUD, APTI, COMM, OS, SWE, OTHER)
          </span>
        </div>

        {/* Current Active Categorized Skills Chips */}
        <div style={{ background: "var(--bg-subtle)", padding: "12px", borderRadius: "var(--radius-sm)" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
            Mapped Skill Competencies ({(currentCandidate?.skills || []).length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {(currentCandidate?.skills || []).map((skill, i) => (
              <span key={i} className="skill-badge" style={{ fontSize: "11.5px" }}>
                <span>{skill.skill_name}</span>
                <span className="category-tag">{skill.category_code || "OTHER"}</span>
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, marginBottom: "6px" }}>
              🏆 Hackathons & Competitions (one per line)
            </label>
            <textarea
              className="textarea-input"
              rows={3}
              value={formData.hackathonsStr}
              onChange={handleChange("hackathonsStr")}
              placeholder="Smart India Hackathon Finalist&#10;Kaggle Bronze Medalist"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, marginBottom: "6px" }}>
              📜 Certifications & Licenses (one per line)
            </label>
            <textarea
              className="textarea-input"
              rows={3}
              value={formData.certificationsStr}
              onChange={handleChange("certificationsStr")}
              placeholder="AWS Certified Solutions Architect&#10;Google Professional Data Engineer"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, marginBottom: "6px" }}>
              💼 Internships & Work Experience (one per line)
            </label>
            <textarea
              className="textarea-input"
              rows={3}
              value={formData.internshipsStr}
              onChange={handleChange("internshipsStr")}
              placeholder="Software Engineering Intern at Acme Corp&#10;Research Assistant at University Lab"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, marginBottom: "6px" }}>
              🎯 Preferred Roles (comma-separated)
            </label>
            <textarea
              className="textarea-input"
              rows={3}
              value={formData.preferredRolesStr}
              onChange={handleChange("preferredRolesStr")}
              placeholder="Software Engineer, Backend Developer, Data Analyst..."
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginTop: "12px", paddingTop: "14px", borderTop: "1px solid var(--border-light)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button type="submit" className="btn-primary">
              💾 Save Profile
            </button>
            {saveStatus && (
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--emerald)" }}>
                {saveStatus}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setActiveTab("talent-check")}
              className="btn-secondary btn-sm"
            >
              🎯 Evaluate in Talent Check (Role 4) →
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("skill-matching")}
              className="btn-secondary btn-sm"
            >
              ⚡ Compare in Skill Matching (Role 5) →
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unified-report")}
              className="btn-secondary btn-sm"
              style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
            >
              📊 Unified 5-in-1 Report →
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

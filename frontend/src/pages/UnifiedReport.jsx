import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { useWorkflow } from "../state/WorkflowContext";
import { SKILL_CATEGORIES } from "../data/radixData";

export default function UnifiedReport() {
  const { state, setActiveTab } = useWorkflow();
  const {
    currentCandidate,
    targetJd,
    targetCompany,
    talentCheckResult,
    matchResult,
    resumeResult,
    jdResult,
  } = state;

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const readinessScore = talentCheckResult?.readiness_score || 0;
  const matchScore = matchResult?.match_score || 0;
  const matchedSkills = matchResult?.matched_skills || [];
  const missingSkills = matchResult?.missing_skills || [];
  const skillsetGaps = talentCheckResult?.skillset_gap || [];
  const gapsCount = skillsetGaps.filter((g) => g.gap).length;
  const meetsCount = skillsetGaps.filter((g) => !g.gap).length;

  const handleExportFullReport = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const candidateName = currentCandidate?.name || "Candidate";
      const filename = `SkillSync_Career_Report_${candidateName.replace(/\s+/g, "_")}.pdf`;

      const primary = [37, 99, 235]; // #2563eb
      const dark = [15, 23, 42]; // #0f172a
      const slate = [51, 65, 85]; // #334155
      const muted = [100, 116, 139]; // #64748b
      const light = [248, 250, 252]; // #f8fafc
      const border = [226, 232, 240]; // #e2e8f0
      const emerald = [16, 185, 129];
      const amber = [245, 158, 11];
      const rose = [239, 68, 68];

      let y = 16;
      const margin = 16;
      const pageWidth = 210;
      const contentWidth = pageWidth - margin * 2;

      const checkPageBreak = (neededHeight) => {
        if (y + neededHeight > 275) {
          doc.addPage();
          y = 16;
          // Running header
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...muted);
          doc.text("SkillSync AI Career-Readiness & Competency Report", margin, 10);
          doc.text(`Candidate: ${candidateName}`, pageWidth - margin, 10, { align: "right" });
          doc.setDrawColor(...border);
          doc.line(margin, 12, pageWidth - margin, 12);
        }
      };

      // Header Banner
      doc.setFillColor(...primary);
      doc.roundedRect(margin, y, contentWidth, 24, 3, 3, "F");

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("SkillSync Unified Career Intelligence Report", margin + 8, y + 10);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(219, 234, 254);
      doc.text(`Generated: ${new Date().toLocaleDateString()} · Confidential Career Assessment Document`, margin + 8, y + 18);
      y += 30;

      // Candidate Profile Summary Box
      doc.setFillColor(...light);
      doc.setDrawColor(...border);
      doc.roundedRect(margin, y, contentWidth, 26, 2, 2, "FD");

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text(candidateName, margin + 6, y + 8);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate);
      doc.text(`Email: ${currentCandidate.email || "Not specified"}`, margin + 6, y + 15);
      doc.text(`Education: ${currentCandidate.education || "Bachelor of Technology / Computer Science"}`, margin + 6, y + 21);

      doc.text(`Target Employer: ${targetCompany || "Google LLC"}`, margin + contentWidth / 2, y + 15);
      doc.text(`Target Role: ${targetJd?.role || "Software Engineer"} (${targetJd?.company || targetCompany})`, margin + contentWidth / 2, y + 21);
      y += 32;

      // Scorecards Strip (Readiness & Fit)
      const colWidth = (contentWidth - 6) / 3;

      // Card 1: Verified Skills
      doc.setFillColor(239, 246, 255);
      doc.setDrawColor(191, 219, 254);
      doc.roundedRect(margin, y, colWidth, 20, 2, 2, "FD");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...muted);
      doc.text("VERIFIED COMPETENCIES", margin + 4, y + 6);
      doc.setFontSize(14);
      doc.setTextColor(...primary);
      doc.text(`${(currentCandidate.skills || []).length} Skills`, margin + 4, y + 15);

      // Card 2: Talent Check Readiness
      doc.setFillColor(readinessScore >= 75 ? 236 : 255, readinessScore >= 75 ? 253 : 251, readinessScore >= 75 ? 245 : 235);
      doc.setDrawColor(readinessScore >= 75 ? 167 : 253, readinessScore >= 75 ? 243 : 230, readinessScore >= 75 ? 208 : 138);
      doc.roundedRect(margin + colWidth + 3, y, colWidth, 20, 2, 2, "FD");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...muted);
      doc.text("TALENT CHECK READINESS", margin + colWidth + 5, y + 6);
      doc.setFontSize(14);
      doc.setTextColor(readinessScore >= 75 ? emerald[0] : amber[0], readinessScore >= 75 ? emerald[1] : amber[1], readinessScore >= 75 ? emerald[2] : amber[2]);
      doc.text(`${readinessScore}% Readiness`, margin + colWidth + 5, y + 15);

      // Card 3: Skill Match Fit
      doc.setFillColor(matchScore >= 75 ? 236 : 239, matchScore >= 75 ? 253 : 246, matchScore >= 75 ? 245 : 255);
      doc.setDrawColor(matchScore >= 75 ? 167 : 191, matchScore >= 75 ? 243 : 219, matchScore >= 75 ? 208 : 254);
      doc.roundedRect(margin + (colWidth + 3) * 2, y, colWidth, 20, 2, 2, "FD");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...muted);
      doc.text("JOB FIT ALIGNMENT", margin + (colWidth + 3) * 2 + 4, y + 6);
      doc.setFontSize(14);
      doc.setTextColor(matchScore >= 75 ? emerald[0] : primary[0], matchScore >= 75 ? emerald[1] : primary[1], matchScore >= 75 ? emerald[2] : primary[2]);
      doc.text(`${matchScore}% Match Fit`, margin + (colWidth + 3) * 2 + 4, y + 15);
      y += 26;

      // Section 1: JD Analytics Summary
      checkPageBreak(30);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text("1. Job Description Analytics (Target Role Requirements)", margin, y);
      y += 4;
      doc.setDrawColor(...border);
      doc.line(margin, y, margin + contentWidth, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate);
      doc.text(`Role: ${targetJd?.role} · Employer: ${targetJd?.company} · Experience: ${targetJd?.experience_required || "0-2 Years"} · Total Required: ${(targetJd?.skills || []).length} Competencies`, margin, y);
      y += 6;

      const jdSkills = (targetJd?.skills || []).slice(0, 10);
      jdSkills.forEach((s) => {
        checkPageBreak(6);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...slate);
        doc.text(`• [${s.category_code || "OTHER"}] ${s.skill_name} — Priority: ${s.requirement_type || s.confidence || "required"}`, margin + 3, y);
        y += 5;
      });
      y += 4;

      // Section 2: Resume Parsing & Signal
      checkPageBreak(35);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text("2. Resume Parsing & Candidate Profile Signals", margin, y);
      y += 4;
      doc.setDrawColor(...border);
      doc.line(margin, y, margin + contentWidth, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate);
      doc.text(`Source Document: ${resumeResult?.source_file || currentCandidate?.source_file || "Uploaded Resume"}`, margin, y);
      y += 5;

      const expList = (currentCandidate?.experience || currentCandidate?.internships || []).join("; ");
      if (expList) {
        doc.text(`Experience / Internships: ${doc.splitTextToSize(expList, contentWidth - 40)[0]}`, margin, y);
        y += 5;
      }
      const projList = (currentCandidate?.projects || []).join("; ");
      if (projList) {
        doc.text(`Projects: ${doc.splitTextToSize(projList, contentWidth - 40)[0]}`, margin, y);
        y += 5;
      }
      const certList = (currentCandidate?.certifications || []).join("; ");
      if (certList) {
        doc.text(`Certifications: ${doc.splitTextToSize(certList, contentWidth - 40)[0]}`, margin, y);
        y += 5;
      }
      y += 4;

      // Section 3: Talent Check Benchmark Matrix
      checkPageBreak(40);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text(`3. Talent Check Competency Matrix (${targetCompany} Benchmark)`, margin, y);
      y += 4;
      doc.setDrawColor(...border);
      doc.line(margin, y, margin + contentWidth, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate);
      doc.text(`Readiness: ${readinessScore}% · Meeting Benchmark: ${meetsCount}/12 Dimensions · Deficiencies / Gaps: ${gapsCount}/12 Dimensions`, margin, y);
      y += 7;

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 7, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...muted);
      doc.text("CATEGORY", margin + 3, y + 5);
      doc.text("CANDIDATE LEVEL", margin + 70, y + 5);
      doc.text("REQUIRED BAR", margin + 115, y + 5);
      doc.text("STATUS", margin + 155, y + 5);
      y += 8;

      skillsetGaps.forEach((g) => {
        checkPageBreak(7);
        const isDeficient = g.gap;
        const isNoEvidence = g.candidate_level <= 1.0;
        const statusText = isNoEvidence ? "NO EVIDENCE" : isDeficient ? "DEFICIENCY" : "MEETS BAR";
        const statusColor = isNoEvidence ? muted : isDeficient ? rose : emerald;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...dark);
        doc.text(`${g.category_code} (${g.category_info?.fullName || g.category_code})`, margin + 3, y + 4);
        doc.text(`${g.candidate_level} / 10`, margin + 75, y + 4);
        doc.text(`${g.required_level} / 10`, margin + 120, y + 4);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(...statusColor);
        doc.text(statusText, margin + 155, y + 4);

        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y + 6, margin + contentWidth, y + 6);
        y += 6.5;
      });
      y += 5;

      // Section 4: Skill Matching & Gap Analysis
      checkPageBreak(35);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text(`4. Job Fit & Skill Gap Analysis (${matchScore}% Alignment)`, margin, y);
      y += 4;
      doc.setDrawColor(...border);
      doc.line(margin, y, margin + contentWidth, y);
      y += 6;

      // Matched Skills summary
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...emerald);
      doc.text(`Verified Matched Skills (${matchedSkills.length}):`, margin, y);
      y += 5;

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate);
      const matchedStr = matchedSkills.map((m) => `${m.skill_name} [${m.category_code}]`).join(", ") || "None";
      const matchedLines = doc.splitTextToSize(matchedStr, contentWidth - 6);
      matchedLines.forEach((l) => {
        checkPageBreak(5);
        doc.text(l, margin + 3, y);
        y += 5;
      });
      y += 2;

      // Missing Skills summary
      checkPageBreak(15);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...rose);
      doc.text(`Missing Skills / Competency Gaps (${missingSkills.length}):`, margin, y);
      y += 5;

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate);
      const missingStr = missingSkills.map((m) => `${m.skill_name} [${m.category_code}] (${m.priority || "gap"})`).join(", ") || "None";
      const missingLines = doc.splitTextToSize(missingStr, contentWidth - 6);
      missingLines.forEach((l) => {
        checkPageBreak(5);
        doc.text(l, margin + 3, y);
        y += 5;
      });
      y += 6;

      // Section 5: Integrated 4-Week Action Roadmap
      checkPageBreak(40);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text("5. Integrated 4-Week Career Action Roadmap", margin, y);
      y += 4;
      doc.setDrawColor(...border);
      doc.line(margin, y, margin + contentWidth, y);
      y += 6;

      const roadmap = [
        { w: "Week 1", title: "Core Fundamentals & Algorithm Vocabulary", desc: "Solidify data structures and technical vocabulary alignment for the target role." },
        { w: "Week 2", title: "Architecture & Gap-Bridging Project", desc: "Build a production-grade portfolio project addressing high-priority skill gaps." },
        { w: "Week 3", title: "Database & Cloud Optimization", desc: "Practice system design fundamentals, query tuning, and deployment workflows." },
        { w: "Week 4", title: "Mock Screening & Application Launch", desc: "Run end-to-end technical interview drills and submit targeted job applications." },
      ];

      roadmap.forEach((step) => {
        checkPageBreak(10);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primary);
        doc.text(`${step.w}: ${step.title}`, margin + 3, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...slate);
        doc.text(step.desc, margin + 3, y);
        y += 5.5;
      });

      // Page numbers on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...muted);
        doc.setDrawColor(...border);
        doc.line(margin, 285, pageWidth - margin, 285);
        doc.text("SkillSync AI Career-Readiness Platform · Confidential", margin, 290);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, 290, { align: "right" });
      }

      // Save PDF directly!
      doc.save(filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF: " + err.message);
    }
  };

  return (
    <div className="unified-report-container" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "var(--primary)",
                background: "var(--primary-subtle)",
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--primary-border)",
                letterSpacing: "0.5px",
              }}
            >
              ALL-IN-ONE CONSOLIDATION
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Full 5-Module Result Matrix
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 850, margin: "0 0 6px 0", color: "var(--text-primary)" }}>
            Unified Career Intelligence Report
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px", maxWidth: "700px" }}>
            A single consolidated view aggregating outputs from all 5 core modules: JD Analytics, Resume Parsing,
            Profile Builder, Talent Check benchmark, and Skill Matching fit.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={handleExportFullReport} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>📄</span>
            <span>Export Full Report (PDF)</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div style={{ padding: "10px 16px", borderRadius: "var(--radius-md)", background: "var(--emerald-subtle)", border: "1px solid var(--emerald-border)", color: "var(--emerald)", fontSize: "13px", fontWeight: 600 }}>
          ✓ PDF report generated and downloaded successfully!
        </div>
      )}

      {/* Top Level Scoreboard Strip (Consolidated Health) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
        {/* Metric 1 */}
        <div className="card" style={{ borderLeft: "4px solid var(--primary)", padding: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Candidate Profile
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", margin: "4px 0" }}>
            {currentCandidate.name}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {(currentCandidate.skills || []).length} verified skills active
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card" style={{ borderLeft: "4px solid var(--emerald)", padding: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Talent Check Readiness
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: readinessScore >= 75 ? "var(--emerald)" : "var(--amber)", margin: "2px 0" }}>
            {readinessScore}%
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            vs {targetCompany} Benchmark
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card" style={{ borderLeft: "4px solid var(--violet)", padding: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Target Job Alignment
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: matchScore >= 70 ? "var(--emerald)" : "var(--primary)", margin: "2px 0" }}>
            {matchScore}%
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            for {targetJd?.role || "SWE"}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card" style={{ borderLeft: "4px solid var(--amber)", padding: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Priority Skill Gaps
          </div>
          <div style={{ fontSize: "26px", fontWeight: 900, color: missingSkills.length > 0 ? "var(--amber)" : "var(--emerald)", margin: "2px 0" }}>
            {missingSkills.length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {missingSkills.filter((m) => m.priority === "critical").length} critical gaps to close
          </div>
        </div>
      </div>

      {/* Grid of the 5 Modules Outputs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "18px" }}>
        {/* Module 1: JD Analytics Output */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>📄</span>
              <h2 className="card-title" style={{ margin: 0, fontSize: "15px" }}>
                1. JD Analytics Result
              </h2>
            </div>
            <button onClick={() => setActiveTab("jd-analytics")} className="btn-secondary btn-sm" style={{ padding: "3px 8px", fontSize: "11px" }}>
              Edit JD →
            </button>
          </div>

          <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", background: "var(--bg-subtle)", padding: "10px", borderRadius: "var(--radius-sm)" }}>
            <div><strong>Active Role:</strong> {targetJd?.role}</div>
            <div><strong>Company:</strong> {targetJd?.company}</div>
            <div><strong>Required Competencies:</strong> {(targetJd?.skills || []).length} extracted</div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {(targetJd?.skills || []).slice(0, 6).map((sk, i) => (
              <span key={i} className="skill-badge" style={{ fontSize: "11px" }}>
                <span>{sk.skill_name}</span>
                <span className="category-tag">{sk.category_code}</span>
              </span>
            ))}
            {(targetJd?.skills || []).length > 6 && (
              <span style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "center" }}>
                +{(targetJd?.skills || []).length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Module 2: Resume Parsing Output */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>📑</span>
              <h2 className="card-title" style={{ margin: 0, fontSize: "15px" }}>
                2. Resume Parsing Result
              </h2>
            </div>
            <button onClick={() => setActiveTab("resume-parsing")} className="btn-secondary btn-sm" style={{ padding: "3px 8px", fontSize: "11px" }}>
              Re-parse CV →
            </button>
          </div>

          <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", background: "var(--bg-subtle)", padding: "10px", borderRadius: "var(--radius-sm)" }}>
            <div><strong>Source:</strong> {resumeResult?.source_file || currentCandidate.source_file || "Uploaded Resume"}</div>
            <div><strong>Candidate Email:</strong> {currentCandidate.email || "Extracted"}</div>
            <div><strong>Education:</strong> {currentCandidate.education || "Extracted"}</div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            ✓ Parsed signals automatically normalized into standardized schema categories.
          </div>
        </div>

        {/* Module 3: Profile Builder Output */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>👤</span>
              <h2 className="card-title" style={{ margin: 0, fontSize: "15px" }}>
                3. Profile Builder State
              </h2>
            </div>
            <button onClick={() => setActiveTab("profile-builder")} className="btn-secondary btn-sm" style={{ padding: "3px 8px", fontSize: "11px" }}>
              Update Profile →
            </button>
          </div>

          <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", background: "var(--bg-subtle)", padding: "10px", borderRadius: "var(--radius-sm)" }}>
            <div><strong>Total Skills:</strong> {(currentCandidate.skills || []).length} categorized</div>
            <div><strong>Hackathons:</strong> {(currentCandidate.hackathons || []).length} registered</div>
            <div><strong>Internships/Experience:</strong> {(currentCandidate.experience || []).length} items</div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {(currentCandidate.skills || []).slice(0, 6).map((sk, i) => (
              <span key={i} className="skill-badge" style={{ fontSize: "11px" }}>
                <span>{sk.skill_name}</span>
                <span className="category-tag">{sk.category_code}</span>
              </span>
            ))}
            {(currentCandidate.skills || []).length > 6 && (
              <span style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "center" }}>
                +{(currentCandidate.skills || []).length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Module 4: Talent Check Benchmark */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>🎯</span>
              <h2 className="card-title" style={{ margin: 0, fontSize: "15px" }}>
                4. Talent Check Benchmark
              </h2>
            </div>
            <button onClick={() => setActiveTab("talent-check")} className="btn-secondary btn-sm" style={{ padding: "3px 8px", fontSize: "11px" }}>
              View Matrix →
            </button>
          </div>

          <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", background: "var(--bg-subtle)", padding: "10px", borderRadius: "var(--radius-sm)" }}>
            <div><strong>Target Benchmark:</strong> {targetCompany}</div>
            <div><strong>Readiness Score:</strong> <strong>{readinessScore}%</strong> ({talentCheckResult?.verdict})</div>
            <div><strong>Status:</strong> {meetsCount} Meets Bar · {gapsCount} Deficiencies / Unavailable</div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Scores calculated via authoritative required-weighted coverage formula across 12 skillsets.
          </div>
        </div>

        {/* Module 5: Skill Matching Output */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "10px", gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>⚡</span>
              <h2 className="card-title" style={{ margin: 0, fontSize: "15px" }}>
                5. Job Alignment & Skill Gap Analysis
              </h2>
            </div>
            <button onClick={() => setActiveTab("skill-matching")} className="btn-secondary btn-sm" style={{ padding: "3px 8px", fontSize: "11px" }}>
              Full Match Dashboard →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--emerald)", marginBottom: "6px" }}>
                ✓ Verified Matched Skills ({matchedSkills.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {matchedSkills.map((m, i) => (
                  <span key={i} className="skill-badge" style={{ fontSize: "11px" }}>
                    <span>{m.skill_name}</span>
                    <span className="category-tag">{m.category_code}</span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--rose)", marginBottom: "6px" }}>
                ⚠️ Missing Skills to Bridge ({missingSkills.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {missingSkills.map((m, i) => (
                  <span key={i} className="skill-badge" style={{ fontSize: "11px", borderLeft: `3px solid ${m.priority === "critical" ? "var(--rose)" : "var(--amber)"}` }}>
                    <span>{m.skill_name}</span>
                    <span style={{ fontSize: "9px", fontWeight: 700, color: m.priority === "critical" ? "var(--rose)" : "var(--amber)", textTransform: "uppercase" }}>
                      {m.priority}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

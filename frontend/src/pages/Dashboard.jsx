import React, { useState } from "react";
import { useWorkflow } from "../state/WorkflowContext";
import {
  OFFICIAL_JOB_DESCRIPTIONS,
  COMPANY_BENCHMARKS,
  SKILL_CATEGORIES,
} from "../data/radixData";
import {
  extractTextFromResumeFile,
  parseResumeText,
} from "../services/careerEngine";

export default function Dashboard() {
  const {
    state,
    setActiveTab,
    selectCompany,
    selectTargetJd,
    uploadCustomCv,
    loadDemoSample,
    resetCandidate,
  } = useWorkflow();

  const {
    currentCandidate,
    targetJd,
    targetCompany,
    talentCheckResult,
    matchResult,
    hasUploadedCv,
  } = state;

  const [inputMode, setInputMode] = useState("file");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const readinessScore = talentCheckResult?.readiness_score || 0;
  const matchScore = matchResult?.match_score || 0;
  const skillsetGaps = talentCheckResult?.skillset_gap || [];
  const gapsCount = skillsetGaps.filter((g) => g.gap).length;
  const meetsCount = skillsetGaps.filter((g) => !g.gap).length;

  const profileCompletion = hasUploadedCv ? 80 : 0;
  const jobsAnalyzed = targetJd ? 1 : 0;
  const resumesParsed = hasUploadedCv ? 1 : 0;
  const skillAssessments = talentCheckResult ? 1 : 0;
  const jobMatches = matchResult ? 1 : 0;

  const handleProcessCv = async (e) => {
    if (e) e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    // If in file mode and user hasn't selected a file yet, open the file picker!
    if (inputMode === "file" && !selectedFile) {
      const fileInput = document.getElementById("cv-file-input");
      if (fileInput) {
        fileInput.click();
      } else {
        setUploadError("Please select a resume file (.pdf, .docx, or .txt).");
      }
      return;
    }

    if (inputMode === "text" && (!pastedText.trim() || pastedText.trim().length < 20)) {
      setUploadError("Please paste at least 20 characters of resume content.");
      return;
    }

    let textContent = "";
    let fileName = "candidate_resume.txt";
    setIsProcessing(true);
    try {
      if (inputMode === "file") {
        fileName = selectedFile.name;
        textContent = await extractTextFromResumeFile(selectedFile);
      } else {
        textContent = pastedText;
        fileName = "pasted_resume.txt";
      }
      const parsedProfile = parseResumeText(textContent, fileName);
      uploadCustomCv(parsedProfile);
      setUploadSuccess(`Profile extracted successfully for ${parsedProfile.name || "Candidate"}! ${parsedProfile.skills?.length || 0} skills categorized.`);
      setSelectedFile(null);
      setPastedText("");
    } catch (err) {
      setUploadError(err.message || "Failed to parse resume.");
    } finally {
      setIsProcessing(false);
    }
  };

  const progressCards = [
    { bg: "#dcfce7", icon: "👤", value: `${profileCompletion}%`, title: "Profile Completion", sub: "Complete remaining details to get better recommendations." },
    { bg: "#dbeafe", icon: "💼", value: jobsAnalyzed, title: "Jobs Analyzed", sub: "Job descriptions analyzed and saved." },
    { bg: "#ede9fe", icon: "📄", value: resumesParsed, title: "Resumes Parsed", sub: "Resumes uploaded and processed." },
    { bg: "#ffedd5", icon: "📊", value: skillAssessments, title: "Skill Assessments", sub: "Talent check assessments completed." },
    { bg: "#fce7f3", icon: "🎯", value: jobMatches, title: "Job Matches", sub: "Job match analyses generated." },
  ];

  const quickActions = [
    { color: "#8b5cf6", icon: "📄", title: "JD Analytics", sub: "Analyze a job description and extract key requirements.", tab: "jd-analytics" },
    { color: "#10b981", icon: "📑", title: "Resume Parsing", sub: "Upload your resume and extract structured insights.", tab: "resume-parsing" },
    { color: "#f59e0b", icon: "👤", title: "Profile Builder", sub: "Create or update your career-ready profile.", tab: "profile-builder" },
    { color: "#ec4899", icon: "📊", title: "Talent Check", sub: "Assess your skills against company benchmarks.", tab: "talent-check" },
    { color: "#3b82f6", icon: "🎯", title: "Skill Matching", sub: "Find the best job opportunities based on your profile.", tab: "skill-matching" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* CV Upload first */}
      <div className="card">
        <h2 className="card-title" style={{ margin: "0 0 8px 0" }}>📄 Candidate CV Upload & Analysis</h2>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <button onClick={() => { setInputMode("file"); setUploadError(null); setUploadSuccess(null); }} className={inputMode === "file" ? "btn-primary btn-sm" : "btn-secondary btn-sm"}>📁 File Upload</button>
          <button onClick={() => { setInputMode("text"); setUploadError(null); setUploadSuccess(null); }} className={inputMode === "text" ? "btn-primary btn-sm" : "btn-secondary btn-sm"}>✍️ Paste Text</button>
        </div>

        {inputMode === "file" ? (
          <div className="upload-dropzone" onClick={() => document.getElementById("cv-file-input").click()} style={{ marginBottom: "12px", cursor: "pointer" }}>
            <input
              id="cv-file-input"
              type="file"
              accept=".pdf,.docx,.txt"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  setUploadError(null);
                  setUploadSuccess(null);
                }
              }}
            />
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>{selectedFile ? "📄" : "📥"}</div>
            <div style={{ fontWeight: 700, color: selectedFile ? "var(--primary)" : "var(--text-primary)" }}>
              {selectedFile ? `Selected: ${selectedFile.name}` : "Click to select or drag resume file here"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB · Ready to extract` : "Supports PDF, Word (.docx), or plain text (.txt)"}
            </div>
          </div>
        ) : (
          <textarea
            className="textarea-input"
            rows={4}
            placeholder="Paste candidate resume text..."
            value={pastedText}
            onChange={(e) => { setPastedText(e.target.value); setUploadError(null); }}
            style={{ marginBottom: "12px" }}
          />
        )}

        {uploadError && (
          <div style={{ padding: "8px 12px", borderRadius: "8px", background: "var(--rose-subtle)", border: "1px solid var(--rose-border)", color: "var(--rose)", fontSize: "12.5px", marginBottom: "12px" }}>
            ⚠️ {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div style={{
            padding: "10px 14px",
            borderRadius: "8px",
            background: "var(--emerald-subtle)",
            border: "1px solid var(--emerald-border)",
            color: "var(--emerald)",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
          }}>
            <span>✓ {uploadSuccess}</span>
            <button
              onClick={() => setActiveTab("profile-builder")}
              className="btn-primary btn-sm"
              style={{ padding: "4px 10px", fontSize: "11px" }}
            >
              View Profile Builder →
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleProcessCv}
            disabled={isProcessing}
            className="btn-primary"
          >
            {isProcessing ? "Analyzing..." : "🚀 Upload & Extract Profile"}
          </button>
          <button onClick={loadDemoSample} className="btn-secondary btn-sm">⚡ Demo Resume</button>
          {hasUploadedCv && <button onClick={resetCandidate} className="btn-secondary btn-sm">🔄 Reset</button>}
        </div>
      </div>

      {/* Benchmark Target + assessments FIRST */}
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>BENCHMARK TARGET:</span>
          <select className="select-input" value={targetCompany} onChange={(e) => selectCompany(e.target.value)} style={{ width: "auto", minWidth: "160px" }}>
            {Object.keys(COMPANY_BENCHMARKS).map((c) => <option key={c} value={c}>🏢 {c}</option>)}
          </select>
          <select className="select-input" value={targetJd?.id} onChange={(e) => { const jd = OFFICIAL_JOB_DESCRIPTIONS.find((j) => j.id === e.target.value); if (jd) selectTargetJd(jd); }} style={{ width: "auto", minWidth: "200px" }}>
            {OFFICIAL_JOB_DESCRIPTIONS.map((jd) => <option key={jd.id} value={jd.id}>💼 {jd.role} ({jd.company})</option>)}
          </select>
        </div>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{currentCandidate?.name || "Candidate"} · {currentCandidate?.skills?.length || 0} skills</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        <div className="card" style={{ cursor: "pointer", borderLeft: `4px solid ${readinessScore >= 75 ? "var(--emerald)" : "var(--amber)"}` }} onClick={() => setActiveTab("talent-check")}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>Talent Check Readiness</div>
          <div style={{ fontSize: "32px", fontWeight: 900, color: readinessScore >= 75 ? "var(--emerald)" : "var(--amber)" }}>{readinessScore}%</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{meetsCount} meet · {gapsCount} gaps</div>
        </div>
        <div className="card" style={{ cursor: "pointer", borderLeft: `4px solid ${matchScore >= 75 ? "var(--emerald)" : "var(--primary)"}` }} onClick={() => setActiveTab("skill-matching")}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>Skill Matching Fit</div>
          <div style={{ fontSize: "32px", fontWeight: 900, color: matchScore >= 75 ? "var(--emerald)" : "var(--primary)" }}>{matchScore}%</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{matchResult?.matched_skills?.length || 0} matched · {matchResult?.missing_skills?.length || 0} gaps</div>
        </div>
      </div>

      {/* Your Progress */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Your Progress</h2>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>Track your profile completion and activity across all modules.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-secondary)" }}>
            📅 Last updated: {new Date().toLocaleString()}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
          {progressCards.map((c) => (
            <div key={c.title} className="card" style={{ background: c.bg, padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>{c.icon}</div>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#1e293b" }}>{c.value}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", marginTop: "4px" }}>{c.title}</div>
              <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div style={{ marginBottom: "12px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Quick Actions</h2>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>Jump into any module to continue your journey.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          {quickActions.map((q) => (
            <div key={q.title} className="card" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", padding: "14px" }} onClick={() => setActiveTab(q.tab)}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: q.color + "22", color: q.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{q.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{q.title}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{q.sub}</div>
              </div>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: q.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom panels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        {/* Recent Activity */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Recent Activity</h3>
            <span style={{ fontSize: "12px", color: "var(--primary)", cursor: "pointer" }}>View all</span>
          </div>
          {hasUploadedCv ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📄</span>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>Resume parsed successfully</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{currentCandidate?.name || "candidate"}</div>
                  </div>
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>now</span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>No recent activity yet.</div>
          )}
        </div>

        {/* Profile Checklist */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Profile Completion Checklist</h3>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--emerald)" }}>{profileCompletion >= 80 ? "4/5" : "1/5"}</span>
          </div>
          <div style={{ height: "6px", borderRadius: "3px", background: "var(--bg-surface)", marginBottom: "12px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${profileCompletion}%`, background: "var(--emerald)", borderRadius: "3px" }} />
          </div>
          {[
            { label: "Basic Information", sub: "Name, email, education.", done: hasUploadedCv },
            { label: "Skills", sub: "Add your technical and soft skills.", done: hasUploadedCv },
            { label: "Experience", sub: "Hackathons, internships, certifications.", done: false },
            { label: "Preferred Roles", sub: "Specify your career interests.", done: false },
            { label: "Upload Resume", sub: "Add your latest resume for better insights.", done: hasUploadedCv },
          ].map((item) => (
            <div key={item.label} onClick={() => setActiveTab("profile-builder")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", fontSize: "12px", color: "var(--text-secondary)" }}>
              <span style={{ color: item.done ? "var(--emerald)" : "var(--text-muted)", fontWeight: 800 }}>{item.done ? "✓" : "○"}</span>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.label}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommended Next Steps */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
            <span style={{ fontSize: "16px" }}>✨</span>
            <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>Recommended Next Steps</h3>
          </div>
          {[
            { icon: "👤", title: "Complete your profile", sub: "Add missing information to improve your profile strength.", tab: "profile-builder" },
            { icon: "📄", title: "Analyze a new job description", sub: "Find more relevant opportunities.", tab: "jd-analytics" },
            { icon: "📊", title: "Take a talent check", sub: "Assess your skills against company benchmarks.", tab: "talent-check" },
            { icon: "🎯", title: "Generate more job matches", sub: "Explore roles that fit your profile.", tab: "skill-matching" },
          ].map((r) => (
            <div key={r.title} onClick={() => setActiveTab(r.tab)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "16px" }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{r.title}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{r.sub}</div>
              </div>
              <span style={{ color: "var(--primary)" }}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

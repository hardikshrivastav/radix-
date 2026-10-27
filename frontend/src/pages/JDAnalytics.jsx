import React, { useEffect, useMemo, useState } from "react";
import { useWorkflow } from "../state/WorkflowContext";
import {
  analyzeJdFile,
  analyzeJdText,
  getCompanies,
  getJdResult,
  listJdResults,
} from "../services/api";
import PageHeader from "../components/PageHeader";
import FileDropzone from "../components/FileDropzone";
import SkillChip from "../components/SkillChip";
import CategoryBadge, { CATEGORY_NAMES } from "../components/CategoryBadge";
import ConfidenceBadge from "../components/ConfidenceBadge";
import { Button, Card, ErrorBanner, StatTile } from "../components/UIComponents";

export default function JDAnalytics() {
  const { state, setJdResult, setCompany, setTargetRole, setActiveModule } = useWorkflow();
  const { jdResult, selectedCompany, targetRole } = state;

  // Form State
  const [companies, setCompanies] = useState([]);
  const [companyInput, setCompanyInput] = useState(selectedCompany || "");
  const [roleInput, setRoleInput] = useState(targetRole || "");
  const [isManualCompany, setIsManualCompany] = useState(false);
  const [companiesUnavailableMsg, setCompaniesUnavailableMsg] = useState(null);

  const [inputMode, setInputMode] = useState("file"); // "file" | "text"
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");

  // Loading & Progress
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [selectedConfidenceFilter, setSelectedConfidenceFilter] = useState("ALL");
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // History & Actions
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Load companies & past history on mount
  useEffect(() => {
    loadCompanies();
    loadHistory();
  }, []);

  async function loadCompanies() {
    try {
      const data = await getCompanies();
      if (Array.isArray(data) && data.length > 0) {
        setCompanies(data);
      } else {
        setIsManualCompany(true);
      }
    } catch (err) {
      // Graceful fallback to manual text input
      setIsManualCompany(true);
      setCompaniesUnavailableMsg("Supabase companies table unavailable; using manual company input.");
    }
  }

  async function loadHistory() {
    try {
      const list = await listJdResults();
      if (Array.isArray(list)) {
        setHistory(list);
      }
    } catch {
      // non-blocking
    }
  }

  async function handleAnalyze(e) {
    e.preventDefault();
    setError(null);

    if (inputMode === "file" && !selectedFile) {
      setError("Please select a PDF or DOCX file to analyze.");
      return;
    }
    if (inputMode === "text" && (!pastedText || pastedText.trim().length < 20)) {
      setError("Please paste a job description with at least 20 characters.");
      return;
    }

    setIsLoading(true);
    setProgressMsg("Preparing document and analyzing sections...");

    try {
      let result;
      if (inputMode === "file") {
        setProgressMsg("Invoking LangChain Google Gemini extraction pipeline...");
        result = await analyzeJdFile(selectedFile, {
          company: companyInput,
          role: roleInput,
        });
      } else {
        setProgressMsg("Extracting requirements with LangChain & Gemini...");
        result = await analyzeJdText({
          description: pastedText,
          title: roleInput,
          company: companyInput,
        });
      }

      setJdResult(result);
      if (result.company) setCompany(result.company);
      if (result.role) setTargetRole(result.role);
      loadHistory();
    } catch (err) {
      setError(err.message || "Extraction failed. Please check your document and try again.");
    } finally {
      setIsLoading(false);
      setProgressMsg("");
    }
  }

  async function handleLoadHistoryItem(id) {
    try {
      setIsLoading(true);
      setProgressMsg("Loading saved analysis...");
      const record = await getJdResult(id);
      if (record) {
        setJdResult(record);
        if (record.company) setCompanyInput(record.company);
        if (record.role) setRoleInput(record.role);
        setShowHistory(false);
      }
    } catch (err) {
      setError(err.message || "Failed to load saved analysis.");
    } finally {
      setIsLoading(false);
      setProgressMsg("");
    }
  }

  function handleCopyJson() {
    if (!jdResult) return;
    navigator.clipboard.writeText(JSON.stringify(jdResult, null, 2));
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  }

  function handleDownloadJson() {
    if (!jdResult) return;
    const blob = new Blob([JSON.stringify(jdResult, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(jdResult.company || "jd").toLowerCase().replace(/\s+/g, "_")}_skills_${jdResult.id || "export"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function toggleCategoryCollapse(code) {
    setCollapsedCategories((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  }

  // Filter skills based on user controls
  const filteredSkills = useMemo(() => {
    if (!jdResult || !jdResult.skills) return [];

    return jdResult.skills.filter((item) => {
      // Category filter
      if (selectedCategoryFilter !== "ALL" && item.category_code !== selectedCategoryFilter) {
        return false;
      }
      // Confidence filter
      if (selectedConfidenceFilter !== "ALL" && item.confidence !== selectedConfidenceFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = item.skill_name.toLowerCase().includes(q);
        const inEvidence = (item.evidence || "").toLowerCase().includes(q);
        const inCat = item.category_code.toLowerCase().includes(q);
        if (!inName && !inEvidence && !inCat) return false;
      }
      return true;
    });
  }, [jdResult, selectedCategoryFilter, selectedConfidenceFilter, searchQuery]);

  // Group filtered skills by category
  const groupedSkills = useMemo(() => {
    const groups = {};
    for (const skill of filteredSkills) {
      const cat = skill.category_code || "OTHER";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    }
    return groups;
  }, [filteredSkills]);

  // Category counts across entire active JD (for chart)
  const categoryCounts = useMemo(() => {
    if (!jdResult || !jdResult.skills) return {};
    const counts = {};
    for (const s of jdResult.skills) {
      const code = s.category_code || "OTHER";
      counts[code] = (counts[code] || 0) + 1;
    }
    return counts;
  }, [jdResult]);

  const totalSkills = jdResult?.skills?.length || 0;
  const highConfCount = jdResult?.skills?.filter((s) => s.confidence === "high").length || 0;
  const medConfCount = jdResult?.skills?.filter((s) => s.confidence === "medium").length || 0;
  const lowConfCount = jdResult?.skills?.filter((s) => s.confidence === "low").length || 0;
  const activeCategoriesCount = Object.keys(categoryCounts).length;

  return (
    <div>
      <PageHeader
        eyebrow="STEP 1 OF 5 · ROLE 1 DELIVERABLE"
        title="JD Analytics"
        subtitle="Extract technical requirements and competencies from a Job Description using Google Gemini and LangChain."
        actions={
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              variant="secondary"
              onClick={() => setShowHistory(!showHistory)}
              style={{ fontSize: "13px", padding: "6px 14px" }}
            >
              🕒 History ({history.length})
            </Button>
            {jdResult && (
              <Button
                variant="primary"
                onClick={() => setActiveModule("resume-parsing")}
                style={{ fontSize: "13px", padding: "6px 16px" }}
              >
                Continue to Resume Parsing →
              </Button>
            )}
          </div>
        }
      />

      <ErrorBanner message={error} onRetry={() => setError(null)} />

      {/* History Slide-in / Drawer */}
      {showHistory && (
        <Card style={{ marginBottom: "24px", background: "#f8fafc", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Previously Analyzed JDs</h3>
            <button
              onClick={() => setShowHistory(false)}
              style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--text-muted)" }}
            >
              ✕
            </button>
          </div>
          {history.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>No previously saved analyses found.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleLoadHistoryItem(item.id)}
                  style={{
                    padding: "12px 14px",
                    background: "#ffffff",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    transition: "var(--transition)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-light)")}
                >
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
                    {item.company || "Target Company"} {item.role ? `· ${item.role}` : ""}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    {item.source_file} · <strong>{item.skill_count} skills</strong>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-light)", marginTop: "4px" }}>
                    {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Extraction Input Form */}
      <Card style={{ marginBottom: "28px" }}>
        <form onSubmit={handleAnalyze}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            {/* Company Selection / Input */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Target Company
                </label>
                {companies.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsManualCompany(!isManualCompany)}
                    style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "11px", cursor: "pointer", padding: 0 }}
                  >
                    {isManualCompany ? "Select from list" : "Type manually"}
                  </button>
                )}
              </div>

              {!isManualCompany && companies.length > 0 ? (
                <select
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-light)",
                    background: "#ffffff",
                    fontSize: "14px",
                  }}
                >
                  <option value="">-- Select a company --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Google, Microsoft, Oracle"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-light)",
                    background: "#ffffff",
                    fontSize: "14px",
                  }}
                />
              )}
              {companiesUnavailableMsg && (
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  ℹ️ {companiesUnavailableMsg}
                </div>
              )}
            </div>

            {/* Target Role Input */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                Job Title / Target Role (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Software Engineer III, Data Scientist"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-light)",
                  background: "#ffffff",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-light)", marginBottom: "16px" }}>
            <button
              type="button"
              onClick={() => setInputMode("file")}
              style={{
                padding: "8px 16px",
                background: "none",
                border: "none",
                borderBottom: inputMode === "file" ? "2px solid var(--primary)" : "2px solid transparent",
                color: inputMode === "file" ? "var(--primary)" : "var(--text-secondary)",
                fontWeight: inputMode === "file" ? 700 : 500,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              📁 Upload Document (PDF / DOCX)
            </button>
            <button
              type="button"
              onClick={() => setInputMode("text")}
              style={{
                padding: "8px 16px",
                background: "none",
                border: "none",
                borderBottom: inputMode === "text" ? "2px solid var(--primary)" : "2px solid transparent",
                color: inputMode === "text" ? "var(--primary)" : "var(--text-secondary)",
                fontWeight: inputMode === "text" ? 700 : 500,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              ✍️ Paste JD Text Instead
            </button>
          </div>

          {inputMode === "file" ? (
            <FileDropzone
              file={selectedFile}
              onFileSelect={setSelectedFile}
              onFileRemove={() => setSelectedFile(null)}
              disabled={isLoading}
            />
          ) : (
            <div>
              <textarea
                rows={7}
                placeholder="Paste the complete job description text here (Responsibilities, Requirements, Qualifications)..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-light)",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  lineHeight: 1.5,
                }}
              />
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                Tip: Include the sections containing Qualifications and Responsibilities for optimal extraction.
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px" }}>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              {isLoading && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--primary)", fontWeight: 600 }}>
                  <span className="spinner" />
                  {progressMsg || "Analyzing with Gemini LLM..."}
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
              style={{ padding: "10px 24px", fontSize: "15px" }}
            >
              {isLoading ? "Extracting Skills..." : "Analyze JD with Gemini →"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Results View */}
      {jdResult && (
        <div>
          {/* Overview Header Card */}
          <Card style={{ marginBottom: "24px", background: "linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%)", border: "1px solid var(--primary-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "18px" }}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  EXTRACTION COMPLETE · ROLE 1 RESULT
                </span>
                <h2 style={{ margin: "4px 0 6px", fontSize: "24px", fontWeight: 800 }}>
                  {jdResult.company || "Target Company"} {jdResult.role ? `· ${jdResult.role}` : ""}
                </h2>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  Source: <strong>{jdResult.source_file}</strong>
                  {jdResult.id && ` · ID: ${jdResult.id.substring(0, 8)}...`}
                </div>
              </div>

              {/* JSON Export Buttons */}
              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="secondary" onClick={handleCopyJson} style={{ fontSize: "13px", padding: "6px 12px" }}>
                  {copyFeedback ? "✓ Copied!" : "📋 Copy JSON"}
                </Button>
                <Button variant="outline" onClick={handleDownloadJson} style={{ fontSize: "13px", padding: "6px 12px" }}>
                  💾 Download JSON
                </Button>
                <Button variant="primary" onClick={() => setActiveModule("resume-parsing")} style={{ fontSize: "13px", padding: "6px 14px" }}>
                  Next Step: Resume Parsing →
                </Button>
              </div>
            </div>

            {/* Stat Summary Tiles */}
            <div className="stat-grid" style={{ marginBottom: "16px" }}>
              <StatTile label="Total Skills Extracted" value={totalSkills} subtext="Deduped & normalized" />
              <StatTile label="High Confidence" value={highConfCount} subtext="Explicitly required" />
              <StatTile label="Medium / Implied" value={medConfCount} subtext="Preferred / nice-to-have" />
              <StatTile label="Categories Represented" value={`${activeCategoriesCount} / 12`} subtext="Competency coverage" />
            </div>

            {/* Distribution Bar (CSS/SVG) */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>
                Skills Distribution by Category
              </div>
              <div style={{ display: "flex", height: "18px", borderRadius: "6px", overflow: "hidden", background: "#e2e8f0" }}>
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const pct = Math.max(2, (count / totalSkills) * 100);
                  return (
                    <div
                      key={cat}
                      className={`cat-${cat}`}
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        border: "none",
                        borderRadius: 0,
                        cursor: "pointer",
                      }}
                      title={`${cat} (${CATEGORY_NAMES[cat] || cat}): ${count} skill(s) (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === cat ? "ALL" : cat)}
                    style={{
                      background: selectedCategoryFilter === cat ? "var(--bg-muted)" : "transparent",
                      border: "none",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CategoryBadge code={cat} />
                    <span style={{ fontWeight: 600 }}>{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Interactive Filter Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              padding: "14px 18px",
              background: "#ffffff",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius-lg)",
              marginBottom: "20px",
            }}
          >
            {/* Search Input */}
            <div style={{ flex: 1, minWidth: "220px" }}>
              <input
                type="text"
                placeholder="🔍 Search skills or evidence quotes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-light)",
                  fontSize: "13px",
                }}
              />
            </div>

            {/* Category Dropdown Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>Category:</label>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-light)",
                  fontSize: "13px",
                  background: "#ffffff",
                }}
              >
                <option value="ALL">All Categories ({totalSkills})</option>
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <option key={cat} value={cat}>
                    {cat} - {CATEGORY_NAMES[cat] || cat} ({count})
                  </option>
                ))}
              </select>
            </div>

            {/* Confidence Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>Confidence:</label>
              <select
                value={selectedConfidenceFilter}
                onChange={(e) => setSelectedConfidenceFilter(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-light)",
                  fontSize: "13px",
                  background: "#ffffff",
                }}
              >
                <option value="ALL">All ({totalSkills})</option>
                <option value="high">High ({highConfCount})</option>
                <option value="medium">Medium ({medConfCount})</option>
                <option value="low">Low ({lowConfCount})</option>
              </select>
            </div>
          </div>

          {/* Grouped Skills View by Category */}
          {Object.keys(groupedSkills).length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                No skills match your active filter or search query.
              </p>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {Object.entries(groupedSkills).map(([catCode, skillsList]) => {
                const isCollapsed = Boolean(collapsedCategories[catCode]);
                const catName = CATEGORY_NAMES[catCode] || catCode;

                return (
                  <Card key={catCode} padded={false} style={{ overflow: "hidden" }}>
                    {/* Collapsible Header */}
                    <div
                      onClick={() => toggleCategoryCollapse(catCode)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 20px",
                        background: "#fafcff",
                        borderBottom: isCollapsed ? "none" : "1px solid var(--border-light)",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <CategoryBadge code={catCode} />
                        <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>
                          {catName}
                        </span>
                        <span
                          style={{
                            background: "var(--bg-muted)",
                            color: "var(--text-secondary)",
                            padding: "2px 8px",
                            borderRadius: "9999px",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {skillsList.length}
                        </span>
                      </div>
                      <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>
                        {isCollapsed ? "+ Expand" : "− Collapse"}
                      </span>
                    </div>

                    {/* Skill Cards Grid */}
                    {!isCollapsed && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                          gap: "12px",
                          padding: "16px 20px",
                        }}
                      >
                        {skillsList.map((skill, idx) => (
                          <SkillChip key={`${skill.skill_name}-${idx}`} skill={skill} />
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Bottom Prominent Call to Action */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "32px",
              padding: "20px 24px",
              background: "#ffffff",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "16px" }}>
                Ready to compare with Candidate Resume?
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                The extracted skills ({totalSkills}) are saved and ready to be used by Role 5 (Skill Matching).
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setActiveModule("resume-parsing")}
              style={{ padding: "10px 20px" }}
            >
              Continue to Step 2: Resume Parsing →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

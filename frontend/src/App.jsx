import React, { useState, useEffect, useCallback } from "react";
import { WorkflowProvider, useWorkflow } from "./state/WorkflowContext";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import JDAnalytics from "./pages/JDAnalytics";
import ResumeParsing from "./pages/ResumeParsing";
import ProfileBuilder from "./pages/ProfileBuilder";
import TalentCheck from "./pages/TalentCheck";
import SkillMatching from "./pages/SkillMatching";
import UnifiedReport from "./pages/UnifiedReport";

function AppShell() {
  const { state, setActiveTab, theme, toggleTheme } = useWorkflow();
  const { activeTab, currentCandidate, targetCompany, targetJd, talentCheckResult } = state;

  const readinessScore = talentCheckResult?.readiness_score || 0;

  // Tab history for back navigation
  const [tabHistory, setTabHistory] = useState([]);
  const prevTabRef = React.useRef(activeTab);

  // Track tab changes for back button
  useEffect(() => {
    if (prevTabRef.current !== activeTab && prevTabRef.current !== "home") {
      setTabHistory((prev) => [...prev.slice(-19), prevTabRef.current]);
    }
    prevTabRef.current = activeTab;
  }, [activeTab]);

  const goBack = useCallback(() => {
    if (tabHistory.length > 0) {
      const prev = tabHistory[tabHistory.length - 1];
      setTabHistory((h) => h.slice(0, -1));
      setActiveTab(prev);
    } else {
      setActiveTab("dashboard");
    }
  }, [tabHistory, setActiveTab]);

  // Transition state: controls the cross-fade between landing ↔ app
  const [transitioning, setTransitioning] = useState(false);
  const [displayView, setDisplayView] = useState(activeTab === "home" ? "landing" : "app");

  const isLanding = activeTab === "home";

  // When activeTab changes, trigger the cross-fade
  useEffect(() => {
    const nextView = isLanding ? "landing" : "app";
    if (nextView !== displayView) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayView(nextView);
        setTransitioning(false);
      }, 300); // matches the CSS fade-out duration
      return () => clearTimeout(timer);
    }
  }, [isLanding, displayView]);

  // Smooth navigate with transition
  const navigateToLanding = useCallback(() => {
    setActiveTab("home");
  }, [setActiveTab]);

  const navigateToApp = useCallback((tab) => {
    setActiveTab(tab || "dashboard");
  }, [setActiveTab]);

  // Sidebar nav items — Home is removed, only Dashboard in overview
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "⊞",
      tag: "Overview",
      group: "overview",
    },
    {
      id: "jd-analytics",
      label: "JD Analytics",
      icon: "📄",
      tag: "Role 1",
      group: "modules",
    },
    {
      id: "resume-parsing",
      label: "Resume Parsing",
      icon: "📑",
      tag: "Role 2",
      group: "modules",
    },
    {
      id: "profile-builder",
      label: "Profile Builder",
      icon: "👤",
      tag: "Role 3",
      group: "modules",
    },
    {
      id: "talent-check",
      label: "Talent Check",
      icon: "🎯",
      tag: "Role 4",
      group: "modules",
    },
    {
      id: "skill-matching",
      label: "Skill Matching",
      icon: "⚡",
      tag: "Role 5",
      group: "modules",
    },
    {
      id: "unified-report",
      label: "Unified Report",
      icon: "📊",
      tag: "5-in-1",
      group: "result",
    },
  ];

  // Render Landing Page with cross-fade
  if (displayView === "landing") {
    return (
      <div className={`page-crossfade ${transitioning ? "fading-out" : "fading-in"}`}>
        <LandingPage />
      </div>
    );
  }

  // Render App Shell with cross-fade
  return (
    <div className={`page-crossfade ${transitioning ? "fading-out" : "fading-in"}`}>
      <div className="app-container">
        {/* Left Sidebar */}
        <aside className="sidebar">
          {/* Top Header with Theme Switcher & Brand */}
          <div className="sidebar-header">
            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              <span>{theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>Toggle</span>
            </button>

            {/* SkillSync Brand — click goes back to Landing */}
            <div className="brand-row" onClick={navigateToLanding} style={{ cursor: "pointer" }}>
              <div className="brand-badge" style={{ background: "linear-gradient(135deg, #38bdf8, #2563eb)", color: "#fff", fontWeight: 900 }}>
                S
              </div>
              <div>
                <div className="brand-text-title">SkillSync</div>
                <div className="brand-text-sub">AI Career-Readiness</div>
              </div>
            </div>
          </div>

          {/* Sidebar Nav Items */}
          <div className="sidebar-content">
            {/* Platform Overview */}
            <div>
              <div className="nav-group-title">Platform</div>
              <div className="nav-menu">
                {navItems
                  .filter((item) => item.group === "overview")
                  .map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`nav-link-btn ${isActive ? "active" : ""}`}
                      >
                        <div className="nav-link-left">
                          <span className="nav-link-icon">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        <span className="nav-link-tag">{item.tag}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* The 5 Connected Modules */}
            <div>
              <div className="nav-group-title">Five Core Modules</div>
              <div className="nav-menu">
                {navItems
                  .filter((item) => item.group === "modules")
                  .map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`nav-link-btn ${isActive ? "active" : ""}`}
                      >
                        <div className="nav-link-left">
                          <span className="nav-link-icon">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        <span className="nav-link-tag">{item.tag}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Consolidated Result */}
            <div>
              <div className="nav-group-title" style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Consolidated Result</span>
              </div>
              <div className="nav-menu">
                {navItems
                  .filter((item) => item.group === "result")
                  .map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`nav-link-btn ${isActive ? "active" : ""}`}
                        style={{
                          background: isActive
                            ? "var(--primary-subtle)"
                            : "linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(99, 102, 241, 0.08))",
                          border: "1px solid",
                          borderColor: isActive ? "var(--primary)" : "rgba(56, 189, 248, 0.25)",
                        }}
                      >
                        <div className="nav-link-left">
                          <span className="nav-link-icon">{item.icon}</span>
                          <span style={{ fontWeight: 700 }}>{item.label}</span>
                        </div>
                        <span
                          className="nav-link-tag"
                          style={{
                            background: "var(--primary)",
                            color: "#ffffff",
                            fontWeight: 800,
                          }}
                        >
                          {item.tag}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Sidebar Footer with Active Profile */}
          <div className="sidebar-footer">
            <div className="active-candidate-card">
              <div className="candidate-avatar">
                {currentCandidate?.name ? currentCandidate.name.charAt(0) : "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentCandidate?.name || "Active Candidate"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {currentCandidate?.skills?.length || 0} skills active
                </div>
              </div>
              <button
                onClick={() => setActiveTab("profile-builder")}
                className="btn-secondary btn-sm"
                style={{ padding: "4px 8px", fontSize: "11px" }}
                title="Edit Profile"
              >
                Profile
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Top Header Bar */}
          <header className="top-bar">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                {navItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* ← Back button — always visible, goes to previous tab */}
              <button
                onClick={goBack}
                className="btn-secondary btn-sm"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  padding: 0,
                  borderRadius: "50%",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
                title="Go back to previous page"
              >
                ←
              </button>

              {/* Go Back to Landing Page */}
              <button
                onClick={navigateToLanding}
                className="btn-secondary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                title="Return to Landing Page"
              >
                <span>🏠</span>
                <span>Go Back</span>
              </button>

              {/* Target Company Badge */}
              <div
                onClick={() => setActiveTab("talent-check")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  background: readinessScore >= 75 ? "var(--emerald-subtle)" : "var(--amber-subtle)",
                  border: `1px solid ${readinessScore >= 75 ? "var(--emerald-border)" : "var(--amber-border)"}`,
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
                title="Click to view Talent Check breakdown"
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: readinessScore >= 75 ? "var(--emerald)" : "var(--amber)",
                  }}
                />
                <span>
                  {targetCompany}: {readinessScore}% Ready
                </span>
              </div>

              {/* Target Job Role Badge */}
              <div
                onClick={() => setActiveTab("skill-matching")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--primary-subtle)",
                  border: "1px solid var(--primary-border)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--primary)",
                }}
                title="Click to view Job Fit Match"
              >
                <span>💼 {targetJd?.role || "SWE"}</span>
              </div>
            </div>
          </header>

          {/* Page Container with Smooth Animation Transition */}
          <main className="page-container">
            <div key={activeTab} className="page-transition-wrapper">
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "jd-analytics" && <JDAnalytics />}
              {activeTab === "resume-parsing" && <ResumeParsing />}
              {activeTab === "profile-builder" && <ProfileBuilder />}
              {activeTab === "talent-check" && <TalentCheck />}
              {activeTab === "skill-matching" && <SkillMatching />}
              {activeTab === "unified-report" && <UnifiedReport />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WorkflowProvider>
      <AppShell />
    </WorkflowProvider>
  );
}


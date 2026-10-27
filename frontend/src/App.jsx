import React from "react";
import { WorkflowProvider, useWorkflow } from "./state/WorkflowContext";
import FlowStepper from "./components/FlowStepper";
import Dashboard from "./pages/Dashboard";
import JDAnalytics from "./pages/JDAnalytics";
import ResumeParsing from "./pages/ResumeParsing";
import ProfileBuilder from "./pages/ProfileBuilder";
import TalentCheck from "./pages/TalentCheck";
import SkillMatching from "./pages/SkillMatching";

const MODULE_PAGES = {
  "jd-analytics": JDAnalytics,
  "resume-parsing": ResumeParsing,
  "profile-builder": ProfileBuilder,
  "talent-check": TalentCheck,
  "skill-matching": SkillMatching,
};

function AppShell() {
  const { state, setActiveModule } = useWorkflow();
  const { activeModule } = state;
  const ActivePage = activeModule ? MODULE_PAGES[activeModule] : null;

  return (
    <div className="app-shell">
      {/* Top Site Header */}
      <header className="site-header">
        <a
          className="brand"
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            setActiveModule(null);
          }}
          aria-label="RADIX Talent Match Home"
        >
          <span className="brand-mark" aria-hidden="true">R</span>
          <div className="brand-text">
            RADIX <span>Talent Match</span>
          </div>
        </a>

        <div className="header-right">
          <div className="header-badge">
            <span className="header-badge-dot" />
            <span>12-Skillset Framework v1</span>
          </div>
        </div>
      </header>

      {/* 5-Step Flow Stepper */}
      <FlowStepper />

      {/* Main Content Area */}
      <main className="main-content">
        {ActivePage ? (
          <ActivePage />
        ) : (
          <Dashboard onSelectModule={setActiveModule} />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="site-footer">
        <div>
          RADIX Talent Match · Hackathon Engineering Platform · Powered by FastAPI & Google Gemini LLM
        </div>
        <div style={{ marginTop: "4px", fontSize: "12px", color: "var(--text-light)" }}>
          Role 1 (JD Analytics) Fully Implemented · Shared State & Contracts Active for Roles 2–5
        </div>
      </footer>
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

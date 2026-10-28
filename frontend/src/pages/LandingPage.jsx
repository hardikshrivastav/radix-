import React, { useState } from "react";
import { useWorkflow } from "../state/WorkflowContext";

export default function LandingPage() {
  const { setActiveTab } = useWorkflow();
  const [activeSection, setActiveSection] = useState("home");

  const navSections = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "features", label: "Features" },
    { id: "how-it-works", label: "How it works" },
    { id: "team", label: "Team" },
  ];

  const featureCards = [
    {
      title: "JD Analytics",
      desc: "Extract key requirements from any job description",
      icon: "📋",
      iconClass: "icon-blue",
      tab: "jd-analytics",
    },
    {
      title: "Resume Parsing",
      desc: "Turn your resume into structured insights",
      icon: "📄",
      iconClass: "icon-green",
      tab: "resume-parsing",
    },
    {
      title: "Profile Builder",
      desc: "Create a complete career-ready profile",
      icon: "👤",
      iconClass: "icon-amber",
      tab: "profile-builder",
    },
    {
      title: "Talent Check",
      desc: "Assess your skills against company benchmarks",
      icon: "🎯",
      iconClass: "icon-rose",
      tab: "talent-check",
    },
    {
      title: "Skill Matching",
      desc: "Find the best job opportunities for you",
      icon: "⚡",
      iconClass: "icon-cyan",
      tab: "skill-matching",
    },
  ];

  const scrollTo = (id) => {
    setActiveSection(id);
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 30;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  return (
    <div className="landing-page-root">
      {/* Cosmic Ambient Glows */}
      <div className="landing-ambient-glow glow-top-right" />
      <div className="landing-ambient-glow glow-center" />

      {/* ═══════════════ NAVIGATION ═══════════════ */}
      <header className="landing-nav-header">
        <div className="landing-brand-container" onClick={() => scrollTo("home")}>
          <div className="skillsync-logo-mark">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="url(#logoGrad)" />
              <path d="M12 22c0-3 2-5 6-5s6 2 6 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="13" r="4" stroke="#fff" strokeWidth="2.5" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36">
                  <stop stopColor="#38bdf8" />
                  <stop offset="1" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="skillsync-brand-name">SkillSync</span>
        </div>

        <nav className="landing-nav-links">
          {navSections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`landing-nav-link ${activeSection === s.id ? "active" : ""}`}
            >
              {s.label}
              {activeSection === s.id && <span className="landing-nav-indicator" />}
            </button>
          ))}
        </nav>

        <button onClick={() => setActiveTab("dashboard")} className="landing-launch-btn">
          Launch App
        </button>
      </header>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="landing-hero-section" id="home">
        {/* Left — Headline + CTA */}
        <div className="landing-hero-left">
          <h1 className="landing-hero-title">
            Turn Your Potential
            <br />
            Into <span style={{ color: "#ffffff" }}>Opportunities</span>
          </h1>

          <p className="landing-hero-description">
            SkillSync is an AI-powered career-readiness platform that helps you build a complete
            profile, analyze job descriptions, assess your skills, and find your best job matches.
          </p>

          <div className="landing-cta-wrapper">
            <button onClick={() => setActiveTab("dashboard")} className="landing-get-started-btn">
              Get Started
              <span className="btn-arrow-circle">→</span>
            </button>
          </div>

          <p className="landing-tagline">
            ONE PLATFORM &nbsp;•&nbsp; MULTIPLE INSIGHTS &nbsp;•&nbsp; A BRIGHTER CAREER
          </p>
        </div>

        {/* Right — 3D Perspective App Mockup */}
        <div className="landing-hero-right">
          {/* The Mockup Card */}
          <div className="mockup-perspective-wrapper">
            <div className="mockup-card-body" onClick={() => setActiveTab("dashboard")}>
              {/* Sidebar */}
              <div className="mockup-sidebar">
                <div className="mockup-logo">
                  <div className="mockup-logo-s">S</div>
                  SkillSync
                </div>
                <div className="mockup-nav-list">
                  <div className="mockup-nav-item active">
                    <span className="mockup-icon">🏠</span> Dashboard
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-icon">📄</span> JD Analytics
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-icon">📑</span> Resume Parsing
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-icon">👤</span> Profile Builder
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-icon">🎯</span> Talent Check
                  </div>
                  <div className="mockup-nav-item">
                    <span className="mockup-icon">⚡</span> Skill Matching
                  </div>
                </div>
              </div>

              {/* Main Pane */}
              <div className="mockup-main-pane">
                <div>
                  <h3 className="mockup-welcome-title">Welcome to SkillSync 👋</h3>
                  <p className="mockup-welcome-sub">Let's build your career-ready profile</p>
                </div>

                {/* 3 stat cards */}
                <div className="mockup-stats-grid">
                  {/* Profile Completion */}
                  <div className="mockup-stat-card">
                    <div className="mockup-stat-label">Profile Completion</div>
                    <div className="mockup-gauge-container">
                      <div className="mockup-ring-progress">
                        <span className="mockup-ring-number">80%</span>
                      </div>
                    </div>
                    <div className="mockup-stat-hint">Almost there!</div>
                  </div>

                  {/* Matched Jobs */}
                  <div className="mockup-stat-card">
                    <div className="mockup-stat-label">Matched Jobs</div>
                    <div className="mockup-stat-icon-val">
                      <span className="mockup-briefcase-icon">💼</span>
                      <span className="mockup-stat-number">12</span>
                    </div>
                    <div className="mockup-stat-hint">Based on your skills</div>
                  </div>

                  {/* Score */}
                  <div className="mockup-stat-card">
                    <div className="mockup-stat-label" style={{ visibility: "hidden" }}>_</div>
                    <div className="mockup-stat-icon-val">
                      <span className="mockup-chart-icon">📊</span>
                      <span className="mockup-stat-number">78%</span>
                    </div>
                    <div className="mockup-stat-hint">Keep improving!</div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="mockup-next-steps-card">
                  <div className="mockup-next-steps-header">
                    <span className="mockup-steps-title">Next Steps</span>
                    <span className="mockup-steps-arrow">→</span>
                  </div>
                  <div className="mockup-checklist">
                    <div className="mockup-check-item completed">
                      <span className="check-circle done">✓</span>
                      Analyze a Job Description
                    </div>
                    <div className="mockup-check-item">
                      <span className="check-circle empty" />
                      Upload &amp; Parse Your Resume
                    </div>
                    <div className="mockup-check-item">
                      <span className="check-circle empty" />
                      Complete Your Profile
                    </div>
                    <div className="mockup-check-item">
                      <span className="check-circle empty" />
                      Check Your Skills
                    </div>
                    <div className="mockup-check-item">
                      <span className="check-circle empty" />
                      Find Your Best Job Matches
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 5 FEATURE MODULE CARDS ═══════════════ */}
      <section className="landing-bottom-wave-section" id="features">
        <div className="landing-cards-row">
          {featureCards.map((c) => (
            <div
              key={c.title}
              className="landing-feature-module-card"
              onClick={() => setActiveTab(c.tab)}
            >
              <div className={`module-card-icon ${c.iconClass}`}>
                <span style={{ fontSize: "24px" }}>{c.icon}</span>
              </div>
              <h3 className="module-card-title">{c.title}</h3>
              <p className="module-card-desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ ABOUT SECTION ═══════════════ */}
      <section className="landing-info-section" id="about">
        <div className="landing-info-content">
          <span className="section-pill">ABOUT</span>
          <h2 className="section-heading">What is SkillSync?</h2>
          <p className="section-lead">
            SkillSync is an AI-powered career-readiness platform designed for students and early
            professionals. It bridges the gap between your current skills and what employers actually
            need — giving you a clear, actionable roadmap to your next opportunity.
          </p>
          <div className="about-metrics-row">
            <div className="about-metric">
              <div className="about-num">5</div>
              <div className="about-desc">Connected Modules</div>
            </div>
            <div className="about-metric">
              <div className="about-num">12</div>
              <div className="about-desc">Skill Categories</div>
            </div>
            <div className="about-metric">
              <div className="about-num">AI</div>
              <div className="about-desc">Powered Insights</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="landing-info-section alt-bg" id="how-it-works">
        <div className="landing-info-content">
          <span className="section-pill">HOW IT WORKS</span>
          <h2 className="section-heading">Five Steps to Career Readiness</h2>
          <p className="section-lead">
            Each module feeds into the next, creating an end-to-end pipeline from raw inputs to
            actionable career intelligence.
          </p>
          <div className="pipeline-steps-grid">
            {[
              {
                n: "01",
                t: "Analyze JD",
                d: "Paste a job description to extract required and preferred skills.",
                tab: "jd-analytics",
              },
              {
                n: "02",
                t: "Parse Resume",
                d: "Upload your resume to extract your skills, experience, and education.",
                tab: "resume-parsing",
              },
              {
                n: "03",
                t: "Build Profile",
                d: "Review, edit, and finalize your complete career profile.",
                tab: "profile-builder",
              },
              {
                n: "04",
                t: "Talent Check",
                d: "Assess your competencies against company benchmarks.",
                tab: "talent-check",
              },
              {
                n: "05",
                t: "Skill Match",
                d: "Compare your profile with a specific job to see your fit.",
                tab: "skill-matching",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="pipeline-step-card"
                onClick={() => setActiveTab(step.tab)}
              >
                <div className="step-num">STEP {step.n}</div>
                <h4 className="step-title">{step.t}</h4>
                <p className="step-desc">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TEAM SECTION ═══════════════ */}
      <section className="landing-info-section" id="team">
        <div className="landing-info-content">
          <span className="section-pill">TEAM</span>
          <h2 className="section-heading">Built by Team SkillSync</h2>
          <p className="section-lead">
            A team of passionate developers building AI-powered career tools during RADIX TGL Blitz
            2025. We believe every student deserves clarity on their career path.
          </p>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-brand">
            <div className="skillsync-logo-mark small">
              <span style={{ color: "#38bdf8", fontWeight: 900, fontSize: "13px" }}>S</span>
            </div>
            <span style={{ fontWeight: 700, color: "#f8fafc" }}>SkillSync</span>
          </div>
          <p className="footer-disclaimer">
            SkillSync is a career-readiness tool for self-assessment and skill development. Match
            scores represent estimated skill alignment and are not a guarantee of employment
            outcomes.
          </p>
          <p className="footer-copy">© 2025 SkillSync — AI Career-Readiness Platform</p>
        </div>
      </footer>
    </div>
  );
}

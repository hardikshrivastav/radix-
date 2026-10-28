import React, { createContext, useContext, useEffect, useReducer, useState } from "react";
import {
  SAMPLE_CANDIDATES,
  OFFICIAL_JOB_DESCRIPTIONS,
  COMPANY_BENCHMARKS,
} from "../data/radixData";
import {
  assessTalentCheck,
  matchCandidateWithJd,
  generateCvImprovementAudit,
} from "../services/careerEngine";

const STORAGE_KEY = "skillsync_platform_state_v4";
const THEME_KEY = "skillsync_theme_preference";

// Default starter profile: Rohan Verma as initial candidate
const defaultCandidate = SAMPLE_CANDIDATES[3];
const defaultJd = OFFICIAL_JOB_DESCRIPTIONS[0];
const defaultCompany = "Google LLC";

const defaultTalentCheck = assessTalentCheck(defaultCandidate.skills, defaultCompany);
const defaultMatch = matchCandidateWithJd(defaultJd.skills, defaultCandidate.skills);
const defaultAudit = generateCvImprovementAudit(defaultCandidate, defaultJd, defaultCompany);

const initialState = {
  activeTab: "home", // 'home', 'dashboard', 'jd-analytics', 'resume-parsing', 'profile-builder', 'talent-check', 'skill-matching'
  currentCandidate: defaultCandidate,
  targetJd: defaultJd,
  targetCompany: defaultCompany,
  talentCheckResult: defaultTalentCheck,
  matchResult: defaultMatch,
  cvAudit: defaultAudit,
  resumeResult: null,
  jdResult: null,
  hasUploadedCv: false,
};

function recomputeAll(candidate, jd, company) {
  const skills = candidate?.skills || [];
  const talentCheck = assessTalentCheck(skills, company || "Google LLC");
  const match = matchCandidateWithJd(jd?.skills || [], skills);
  const audit = generateCvImprovementAudit(candidate, jd, company || "Google LLC");
  return {
    talentCheckResult: talentCheck,
    matchResult: match,
    cvAudit: audit,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.payload };

    case "SELECT_CANDIDATE": {
      const candidate = action.payload;
      const recomputed = recomputeAll(candidate, state.targetJd, state.targetCompany);
      return {
        ...state,
        currentCandidate: candidate,
        hasUploadedCv: true,
        ...recomputed,
      };
    }

    case "SELECT_TARGET_JD": {
      const jd = action.payload;
      const company = jd.company || state.targetCompany;
      const recomputed = recomputeAll(state.currentCandidate, jd, company);
      return {
        ...state,
        targetJd: jd,
        targetCompany: company,
        ...recomputed,
      };
    }

    case "SELECT_COMPANY": {
      const company = action.payload;
      const recomputed = recomputeAll(state.currentCandidate, state.targetJd, company);
      return {
        ...state,
        targetCompany: company,
        ...recomputed,
      };
    }

    case "UPLOAD_CUSTOM_CV": {
      const customCandidate = action.payload;
      const recomputed = recomputeAll(customCandidate, state.targetJd, state.targetCompany);
      return {
        ...state,
        currentCandidate: customCandidate,
        hasUploadedCv: true,
        resumeResult: customCandidate,
        ...recomputed,
      };
    }

    case "UPDATE_PROFILE": {
      const updatedProfile = {
        ...state.currentCandidate,
        ...action.payload,
      };
      const recomputed = recomputeAll(updatedProfile, state.targetJd, state.targetCompany);
      return {
        ...state,
        currentCandidate: updatedProfile,
        hasUploadedCv: true,
        ...recomputed,
      };
    }

    case "SET_RESUME_RESULT": {
      const res = action.payload;
      const updatedCandidate = {
        ...state.currentCandidate,
        name: res.name || state.currentCandidate.name,
        email: res.email || state.currentCandidate.email,
        education: res.education || state.currentCandidate.education,
        skills: res.skills?.length ? res.skills : state.currentCandidate.skills,
        projects: res.projects?.length ? res.projects : (state.currentCandidate.projects || []),
        internships: res.internships?.length ? res.internships : (res.experience?.length ? res.experience : (state.currentCandidate.internships || [])),
        experience: res.experience?.length ? res.experience : (res.internships?.length ? res.internships : (state.currentCandidate.experience || [])),
        certifications: res.certifications?.length ? res.certifications : (state.currentCandidate.certifications || []),
      };
      const recomputed = recomputeAll(updatedCandidate, state.targetJd, state.targetCompany);
      return {
        ...state,
        resumeResult: res,
        currentCandidate: updatedCandidate,
        hasUploadedCv: true,
        ...recomputed,
      };
    }

    case "SET_JD_RESULT": {
      const jdResult = action.payload;
      const recomputed = recomputeAll(state.currentCandidate, jdResult, jdResult.company || state.targetCompany);
      return {
        ...state,
        jdResult,
        targetJd: jdResult,
        targetCompany: jdResult.company || state.targetCompany,
        ...recomputed,
      };
    }

    case "RESET_CANDIDATE": {
      return {
        ...state,
        currentCandidate: defaultCandidate,
        hasUploadedCv: false,
        resumeResult: null,
        ...recomputeAll(defaultCandidate, state.targetJd, state.targetCompany),
      };
    }

    default:
      return state;
  }
}

const WorkflowContext = createContext(null);

export function WorkflowProvider({ children }) {
  // Theme state: default to "dark"
  const [theme, setThemeState] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      return savedTheme || "dark";
    } catch {
      return "dark";
    }
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // storage unavailable
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const [state, dispatch] = useReducer(reducer, initialState, () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentCandidate && parsed.targetJd) {
          const recomputed = recomputeAll(
            parsed.currentCandidate,
            parsed.targetJd,
            parsed.targetCompany || defaultCompany
          );
          return {
            ...initialState,
            ...parsed,
            ...recomputed,
            activeTab: "home", // Always open on the Landing Page when loading the website
          };
        }
      }
    } catch (e) {
      console.warn("Could not load persisted candidate platform state:", e);
    }
    return { ...initialState, activeTab: "home" };
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activeTab: "home", // Keep landing page as initial entry point
          currentCandidate: state.currentCandidate,
          targetJd: state.targetJd,
          targetCompany: state.targetCompany,
          hasUploadedCv: state.hasUploadedCv,
        })
      );
    } catch (e) {
      console.warn("Could not save candidate platform state:", e);
    }
  }, [state.currentCandidate, state.targetJd, state.targetCompany, state.hasUploadedCv]);

  const value = {
    state,
    theme,
    toggleTheme,
    setTheme: setThemeState,
    setActiveTab: (tab) => dispatch({ type: "SET_TAB", payload: tab }),
    selectCandidate: (candidate) => dispatch({ type: "SELECT_CANDIDATE", payload: candidate }),
    selectTargetJd: (jd) => dispatch({ type: "SELECT_TARGET_JD", payload: jd }),
    selectCompany: (company) => dispatch({ type: "SELECT_COMPANY", payload: company }),
    uploadCustomCv: (customCand) => dispatch({ type: "UPLOAD_CUSTOM_CV", payload: customCand }),
    updateProfile: (profile) => dispatch({ type: "UPDATE_PROFILE", payload: profile }),
    setResumeResult: (res) => dispatch({ type: "SET_RESUME_RESULT", payload: res }),
    setJdResult: (jd) => dispatch({ type: "SET_JD_RESULT", payload: jd }),
    resetCandidate: () => dispatch({ type: "RESET_CANDIDATE" }),
    loadDemoSample: () => {
      const idx = Math.floor(Math.random() * SAMPLE_CANDIDATES.length);
      dispatch({ type: "SELECT_CANDIDATE", payload: SAMPLE_CANDIDATES[idx] });
    },
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within WorkflowProvider");
  }
  return context;
}

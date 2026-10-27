import React, { createContext, useContext, useEffect, useReducer } from "react";

const STORAGE_KEY = "radix_workflow_state_v1";

const initialState = {
  activeModule: null, // null = Dashboard, 'jd-analytics', 'resume-parsing', 'profile-builder', 'talent-check', 'skill-matching'
  selectedCompany: "",
  targetRole: "",
  jdResult: null,         // Role 1 output
  resumeResult: null,     // Role 2 output
  profile: null,          // Role 3 output
  talentCheckResult: null,// Role 4 output
  matchResult: null,      // Role 5 output
  completedSteps: {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  },
};

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...initialState,
        ...parsed,
        completedSteps: {
          ...initialState.completedSteps,
          ...(parsed.completedSteps || {}),
        },
      };
    }
  } catch (err) {
    console.warn("Could not load persisted workflow state:", err);
  }
  return initialState;
}

function workflowReducer(state, action) {
  switch (action.type) {
    case "SET_ACTIVE_MODULE":
      return { ...state, activeModule: action.payload };

    case "SET_COMPANY":
      return { ...state, selectedCompany: action.payload };

    case "SET_TARGET_ROLE":
      return { ...state, targetRole: action.payload };

    case "SET_JD_RESULT": {
      const result = action.payload;
      return {
        ...state,
        jdResult: result,
        selectedCompany: result?.company || state.selectedCompany,
        targetRole: result?.role || state.targetRole,
        completedSteps: {
          ...state.completedSteps,
          1: Boolean(result && result.skills && result.skills.length > 0),
        },
      };
    }

    case "SET_RESUME_RESULT":
      return {
        ...state,
        resumeResult: action.payload,
        completedSteps: {
          ...state.completedSteps,
          2: Boolean(action.payload),
        },
      };

    case "SET_PROFILE":
      return {
        ...state,
        profile: action.payload,
        completedSteps: {
          ...state.completedSteps,
          3: Boolean(action.payload),
        },
      };

    case "SET_TALENT_CHECK_RESULT":
      return {
        ...state,
        talentCheckResult: action.payload,
        completedSteps: {
          ...state.completedSteps,
          4: Boolean(action.payload),
        },
      };

    case "SET_MATCH_RESULT":
      return {
        ...state,
        matchResult: action.payload,
        completedSteps: {
          ...state.completedSteps,
          5: Boolean(action.payload),
        },
      };

    case "RESET_WORKFLOW":
      return { ...initialState };

    default:
      return state;
  }
}

const WorkflowContext = createContext(null);

export function WorkflowProvider({ children }) {
  const [state, dispatch] = useReducer(workflowReducer, undefined, loadPersistedState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("Failed to persist workflow state to localStorage:", err);
    }
  }, [state]);

  const value = {
    state,
    setActiveModule: (modId) => dispatch({ type: "SET_ACTIVE_MODULE", payload: modId }),
    setCompany: (name) => dispatch({ type: "SET_COMPANY", payload: name }),
    setTargetRole: (role) => dispatch({ type: "SET_TARGET_ROLE", payload: role }),
    setJdResult: (result) => dispatch({ type: "SET_JD_RESULT", payload: result }),
    setResumeResult: (result) => dispatch({ type: "SET_RESUME_RESULT", payload: result }),
    setProfile: (profile) => dispatch({ type: "SET_PROFILE", payload: profile }),
    setTalentCheckResult: (result) => dispatch({ type: "SET_TALENT_CHECK_RESULT", payload: result }),
    setMatchResult: (result) => dispatch({ type: "SET_MATCH_RESULT", payload: result }),
    resetWorkflow: () => dispatch({ type: "RESET_WORKFLOW" }),
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
}

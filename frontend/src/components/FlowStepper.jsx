import React from "react";
import { useWorkflow } from "../state/WorkflowContext";

export const MODULE_STEPS = [
  { id: "jd-analytics", step: 1, name: "JD Analytics", owner: "Role 1" },
  { id: "resume-parsing", step: 2, name: "Resume Parsing", owner: "Role 2" },
  { id: "profile-builder", step: 3, name: "Profile Builder", owner: "Role 3" },
  { id: "talent-check", step: 4, name: "Talent Check", owner: "Role 4" },
  { id: "skill-matching", step: 5, name: "Skill Matching", owner: "Role 5" },
];

export default function FlowStepper() {
  const { state, setActiveModule } = useWorkflow();
  const { activeModule, completedSteps } = state;

  return (
    <nav className="stepper-nav" aria-label="5-Step Talent Match Pipeline">
      <ul className="stepper-list">
        <li className="stepper-item">
          <button
            className={`stepper-btn ${activeModule === null ? "active" : ""}`}
            onClick={() => setActiveModule(null)}
          >
            <span className="stepper-num" style={{ background: activeModule === null ? "var(--primary)" : "" }}>
              ⌂
            </span>
            <span>Dashboard</span>
          </button>
          <span className="stepper-arrow" aria-hidden="true">/</span>
        </li>

        {MODULE_STEPS.map((m, idx) => {
          const isActive = activeModule === m.id;
          const isDone = Boolean(completedSteps[m.step]);

          return (
            <li key={m.id} className="stepper-item">
              <button
                className={`stepper-btn ${isActive ? "active" : ""} ${isDone ? "completed" : ""}`}
                onClick={() => setActiveModule(m.id)}
                title={`${m.name} (${m.owner})`}
              >
                <span className="stepper-num">
                  {isDone ? "✓" : m.step}
                </span>
                <span>{m.name}</span>
              </button>
              {idx < MODULE_STEPS.length - 1 && (
                <span className="stepper-arrow" aria-hidden="true">→</span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

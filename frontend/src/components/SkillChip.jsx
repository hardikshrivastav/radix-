import React, { useState } from "react";
import CategoryBadge from "./CategoryBadge";
import ConfidenceBadge from "./ConfidenceBadge";

export default function SkillChip({ skill }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="skill-card"
      onClick={() => setIsExpanded(!isExpanded)}
      style={{ cursor: "pointer" }}
      title="Click to view evidence quote from JD"
    >
      <div className="skill-card-top">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CategoryBadge code={skill.category_code} />
          <span className="skill-title">{skill.skill_name}</span>
        </div>
        <ConfidenceBadge level={skill.confidence} />
      </div>

      {(isExpanded || skill.evidence) && (
        <div className="skill-evidence" style={{ display: isExpanded ? "block" : "-webkit-box", WebkitLineClamp: isExpanded ? "unset" : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          <strong style={{ color: "var(--text-muted)", fontSize: "11px", display: "block", marginBottom: "2px" }}>
            EVIDENCE QUOTE {isExpanded ? "(click to collapse)" : ""}
          </strong>
          “{skill.evidence || "Mentioned in requirements"}”
        </div>
      )}
    </div>
  );
}

import React from "react";

export default function ConfidenceBadge({ level }) {
  const safeLevel = (level || "medium").toLowerCase();

  return (
    <span className={`conf-badge conf-${safeLevel}`}>
      {safeLevel}
    </span>
  );
}

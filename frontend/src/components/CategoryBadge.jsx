import React from "react";

export const CATEGORY_NAMES = {
  COD: "Coding",
  DSA: "Data Structures",
  OOD: "OO Design",
  APTI: "Aptitude",
  COMM: "Communication",
  AI: "AI & ML",
  CLOUD: "Cloud & DevOps",
  SQL: "Databases & SQL",
  SWE: "Software Eng",
  SYSD: "System Design",
  NETW: "Networking",
  OS: "Operating Systems",
  OTHER: "Other",
};

export default function CategoryBadge({ code }) {
  const safeCode = (code || "OTHER").toUpperCase();
  const label = CATEGORY_NAMES[safeCode] || safeCode;

  return (
    <span className={`cat-badge cat-${safeCode}`} title={`Category: ${label}`}>
      {safeCode}
    </span>
  );
}

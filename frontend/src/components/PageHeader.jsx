import React from "react";

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  backAction,
}) {
  return (
    <div className="page-header">
      {backAction && (
        <button
          onClick={backAction}
          className="btn btn-secondary"
          style={{ marginBottom: "16px", padding: "6px 12px", fontSize: "13px" }}
        >
          ← Back to Dashboard
        </button>
      )}
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <div className="page-header-top">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
}

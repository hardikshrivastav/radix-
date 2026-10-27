import React from "react";

export function Card({ children, className = "", padded = true, interactive = false, ...props }) {
  const classes = [
    "radix-card",
    padded ? "radix-card-paddded" : "",
    interactive ? "interactive" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Spinner({ label = "Loading..." }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 0", color: "var(--text-secondary)" }}>
      <span className="spinner" style={{ borderColor: "rgba(37, 99, 235, 0.2)", borderTopColor: "var(--primary)" }} />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="error-banner" role="alert">
      <span>⚠️ {message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: "transparent",
            border: "1px solid #f87171",
            borderRadius: "4px",
            color: "#991b1b",
            padding: "4px 8px",
            fontSize: "12px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = "📄", title, description, action }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-secondary)" }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>{icon}</div>
      <h3 style={{ margin: "0 0 6px", color: "var(--text-primary)", fontSize: "17px" }}>{title}</h3>
      {description && <p style={{ margin: "0 auto 16px", maxWidth: "440px", fontSize: "14px" }}>{description}</p>}
      {action}
    </div>
  );
}

export function StatTile({ label, value, subtext }) {
  return (
    <div className="stat-tile">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {subtext && <div className="stat-sub">{subtext}</div>}
    </div>
  );
}

export function StatusBadge({ status }) {
  let style = { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" };
  let text = status || "Not started";

  if (status === "done" || status === "Completed") {
    style = { background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" };
    text = "Done ✓";
  } else if (status === "in_progress" || status === "In progress") {
    style = { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" };
    text = "In progress";
  } else if (status === "under_construction") {
    style = { background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" };
    text = "Teammate in progress";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 8px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 600,
        ...style,
      }}
    >
      {text}
    </span>
  );
}

import React, { useRef, useState } from "react";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function FileDropzone({
  file,
  onFileSelect,
  onFileRemove,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);

  function validateAndSelect(selectedFile) {
    setError(null);
    if (!selectedFile) return;

    const lowerName = selectedFile.name.toLowerCase();
    const isValidExt =
      lowerName.endsWith(".pdf") ||
      lowerName.endsWith(".docx") ||
      lowerName.endsWith(".txt");

    if (!isValidExt) {
      setError("Unsupported file format. Please upload a PDF or DOCX file.");
      return;
    }

    if (selectedFile.size > MAX_SIZE_BYTES) {
      setError("File exceeds 10 MB limit.");
      return;
    }

    onFileSelect(selectedFile);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSelect(droppedFile);
  }

  function handleChange(e) {
    const pickedFile = e.target.files?.[0];
    validateAndSelect(pickedFile);
    if (inputRef.current) inputRef.current.value = "";
  }

  function formatSize(bytes) {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (file) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>📄</span>
          <div>
            <div style={{ fontWeight: 600, color: "#166534", fontSize: "15px" }}>
              {file.name}
            </div>
            <div style={{ fontSize: "12px", color: "#15803d" }}>
              {formatSize(file.size)} · Ready for extraction
            </div>
          </div>
        </div>
        {!disabled && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onFileRemove}
            style={{ padding: "6px 12px", fontSize: "13px" }}
          >
            Change File
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        className={`dropzone ${isDragOver ? "dragover" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && inputRef.current) inputRef.current.click();
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload job description document"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          style={{ display: "none" }}
          onChange={handleChange}
          disabled={disabled}
        />
        <div className="dropzone-icon">📁</div>
        <div className="dropzone-title">
          Drag & drop your Job Description here, or <span style={{ color: "var(--primary)", textDecoration: "underline" }}>browse</span>
        </div>
        <div className="dropzone-desc">
          Accepts PDF (.pdf) or Word document (.docx) up to 10 MB
        </div>
      </div>
      {error && (
        <div style={{ color: "#dc2626", fontSize: "13px", marginTop: "8px", fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

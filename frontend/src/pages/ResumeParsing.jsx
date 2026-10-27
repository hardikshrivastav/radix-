import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import { Button, Card, ErrorBanner } from "../components/UIComponents";
import { useWorkflow } from "../state/WorkflowContext";
import { parseResume } from "../services/api";

export default function ResumeParsing() {
  const { state, setActiveModule, setResumeResult } = useWorkflow();
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const r = state.resumeResult;

  async function run() {
    setBusy(true); setError(null);
    try { setResumeResult(await parseResume(file)); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return (
    <div>
      <PageHeader eyebrow="STEP 2 OF 5 · ROLE 2" title="Resume Parsing"
        subtitle="Upload a PDF or DOCX resume and see the skills it shows."
        backAction={() => setActiveModule(null)} />
      <Card style={{ maxWidth: 800, margin: "0 auto 24px" }}>
        <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files[0])} />{" "}
        <Button onClick={run} disabled={!file || busy}>{busy ? "Parsing…" : "Parse resume"}</Button>
        {error && <ErrorBanner message={error} />}
      </Card>
      {r && (
        <Card style={{ maxWidth: 800, margin: "0 auto" }}>
          <h3>{r.name} <small>{r.email}</small></h3>
          <p><b>Education:</b> {r.education || "—"}</p>
          <p><b>{r.skills.length} skills found</b> <small>(method: {r.extraction_method})</small></p>
          {r.skills.map((s) => (
            <span key={s.skill_name} title={s.evidence}
              style={{ display: "inline-block", margin: 3, padding: "3px 10px", borderRadius: 9999, background: "#eef2ff" }}>
              {s.skill_name} · {s.category_code}
            </span>
          ))}
          <p style={{ marginTop: 16 }}><Button onClick={() => setActiveModule("profile-builder")}>Continue to Profile Builder →</Button></p>
        </Card>
      )}
    </div>
  );
}

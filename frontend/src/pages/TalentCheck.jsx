import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { Button, Card, ErrorBanner } from "../components/UIComponents";
import { useWorkflow } from "../state/WorkflowContext";
import { assessTalentCheck, listCompanies } from "../services/api";

export default function TalentCheck() {
  const { state, setActiveModule, setTalentCheckResult, setCompany } = useWorkflow();
  const { profile, talentCheckResult: res } = state;
  const [companies, setCompanies] = useState([]);
  const [company, setCo] = useState(state.selectedCompany || "");
  const [error, setError] = useState(null);
  useEffect(() => { listCompanies().then(setCompanies).catch((e) => setError(e.message)); }, []);

  async function run() {
    setError(null);
    try { setCompany(company); setTalentCheckResult(await assessTalentCheck(profile, company)); }
    catch (e) { setError(e.message); }
  }
  return (
    <div>
      <PageHeader eyebrow="STEP 4 OF 5 · ROLE 4" title="Talent Check"
        subtitle="Readiness vs a company's bar across the 12 skillsets."
        backAction={() => setActiveModule(null)} />
      <Card style={{ maxWidth: 800, margin: "0 auto 24px" }}>
        {!profile?.skills?.length && <ErrorBanner message="Save a profile first (Profile Builder)." />}
        <select value={company} onChange={(e) => setCo(e.target.value)}>
          <option value="">Select company…</option>
          {companies.map((c) => <option key={c}>{c}</option>)}
        </select>{" "}
        <Button onClick={run} disabled={!company || !profile?.skills?.length}>Check readiness</Button>
        {error && <ErrorBanner message={error} />}
      </Card>
      {res && (
        <Card style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2>{res.readiness_score}/100 ready for {res.company}</h2>
          {res.skillset_gap.map((g) => (
            <div key={g.category_code} style={{ margin: "6px 0" }}>
              <b>{g.category_code}</b> — you {g.candidate_level} / needed {g.required_level} {g.gap ? "⚠ gap" : "✓"}
              <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4 }}>
                <div style={{ height: 8, borderRadius: 4, width: `${Math.min(100, (g.candidate_level / Math.max(g.required_level, 1)) * 100)}%`, background: g.gap ? "#b45309" : "#047857" }} />
              </div>
            </div>
          ))}
          <p style={{ marginTop: 16 }}><Button onClick={() => setActiveModule("skill-matching")}>Continue to Skill Matching →</Button></p>
        </Card>
      )}
    </div>
  );
}

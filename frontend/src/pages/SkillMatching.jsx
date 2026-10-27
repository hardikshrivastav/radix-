import React, { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import CategoryBadge, { CATEGORY_NAMES } from "../components/CategoryBadge";
import { Button, Card, ErrorBanner, StatTile } from "../components/UIComponents";
import { useWorkflow } from "../state/WorkflowContext";
import { getJdResult, listJdResults, matchSkills } from "../services/api";

const PRIORITY = {
  critical: { label: "Critical", bg: "#fef2f2", fg: "#b91c1c", bd: "#fecaca" },
  important: { label: "Important", bg: "#fffbeb", fg: "#b45309", bd: "#fde68a" },
  nice_to_have: { label: "Nice to have", bg: "#f8fafc", fg: "#64748b", bd: "#e2e8f0" },
};
const MATCH_LABEL = { exact: "Exact", alias: "Synonym", fuzzy: "Fuzzy", semantic: "AI-inferred" };

function scoreColor(score) {
  if (score >= 80) return "#047857";
  if (score >= 60) return "#1d4ed8";
  if (score >= 40) return "#b45309";
  return "#b91c1c";
}

function Pill({ bg, fg, bd, children }) {
  return (
    <span style={{ background: bg, color: fg, border: `1px solid ${bd}`, borderRadius: 9999, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
      {children}
    </span>
  );
}

function ScoreRing({ score }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <svg width="132" height="132" viewBox="0 0 132 132" role="img" aria-label={`Match score ${score}%`}>
      <circle cx="66" cy="66" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle
        cx="66" cy="66" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${(score / 100) * c} ${c}`} transform="rotate(-90 66 66)"
      />
      <text x="66" y="66" textAnchor="middle" fontSize="30" fontWeight="800" fill={color}>{score}</text>
      <text x="66" y="86" textAnchor="middle" fontSize="11" fill="#64748b">out of 100</text>
    </svg>
  );
}

export default function SkillMatching() {
  const { state, setActiveModule, setMatchResult, setJdResult } = useWorkflow();
  const { jdResult, profile, resumeResult, matchResult } = state;

  const [useLlm, setUseLlm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [savedJds, setSavedJds] = useState([]);
  const [manualSkills, setManualSkills] = useState("");

  // Saved JD analyses (Role 1 history) so the user can pick which posting to match against.
  useEffect(() => {
    let cancelled = false;
    listJdResults()
      .then((rows) => !cancelled && setSavedJds((rows || []).filter((j) => j.skill_count > 0)))
      .catch(() => {});
    return () => { cancelled = true; };
  }, [jdResult?.id]);

  async function handlePickJd(id) {
    if (!id) return;
    setError(null);
    try {
      setJdResult(await getJdResult(id));
      setMatchResult(null);
    } catch (err) {
      setError(err.message || "Could not load that JD analysis.");
    }
  }

  // Candidate comes from Role 3 (profile) or Role 2 (resume); typed skills are a fallback.
  const typedSkills = manualSkills.split(/[,\n;]/).map((s) => s.trim()).filter(Boolean);
  const candidate = profile?.skills?.length ? profile : resumeResult;
  const hasUpstream = Boolean(candidate?.skills?.length);
  const candidateKind = candidate === profile ? "Saved profile" : resumeResult ? "Parsed resume" : null;
  const candidateSkillCount = hasUpstream ? candidate.skills.length : typedSkills.length;
  const canRun = Boolean(jdResult?.skills?.length && candidateSkillCount);

  async function handleRun() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await matchSkills({
        jdId: jdResult.id,
        jd: jdResult,
        profile: hasUpstream && candidate === profile ? profile : null,
        resume: hasUpstream && candidate === resumeResult ? resumeResult : null,
        candidateSkills: hasUpstream ? null : typedSkills,
        useLlm,
      });
      setMatchResult(result);
    } catch (err) {
      setError(err.message || "Skill matching failed.");
    } finally {
      setIsLoading(false);
    }
  }

  const r = matchResult;

  return (
    <div>
      <PageHeader
        eyebrow="STEP 5 OF 5 · ROLE 5"
        title="Skill Matching"
        subtitle="See exactly how well the candidate matches one specific job posting — with the gaps that matter most first."
        backAction={() => setActiveModule(null)}
      />

      <Card style={{ maxWidth: 900, margin: "0 auto 24px", borderTop: "4px solid var(--accent-mod-5)" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Inputs</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <div style={{ background: "var(--bg-subtle)", padding: 14, borderRadius: "var(--radius-md)", fontSize: 13 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>📄 Job description (Role 1)</div>
            {jdResult?.skills?.length ? (
              <span style={{ color: "#15803d", fontWeight: 600 }}>
                {jdResult.company ? `${jdResult.company} · ` : ""}{jdResult.role || jdResult.source_file} — {jdResult.skills.length} skills
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)" }}>No JD analysed yet. Complete Step 1 (JD Analytics).</span>
            )}
            {savedJds.length > 0 && (
              <select
                aria-label="Choose a saved JD analysis"
                value={jdResult?.id || ""}
                onChange={(e) => handlePickJd(e.target.value)}
                style={{ display: "block", marginTop: 8, width: "100%", padding: 6, fontSize: 13 }}
              >
                <option value="">Pick a previously analysed JD…</option>
                {savedJds.map((j) => (
                  <option key={j.id} value={j.id}>
                    {(j.company ? `${j.company} · ` : "") + (j.role || j.source_file)} ({j.skill_count} skills)
                  </option>
                ))}
              </select>
            )}
          </div>
          <div style={{ background: "var(--bg-subtle)", padding: 14, borderRadius: "var(--radius-md)", fontSize: 13 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>👤 Candidate (Role 2 / 3)</div>
            {hasUpstream ? (
              <span style={{ color: "#15803d", fontWeight: 600 }}>
                {(candidate.name || candidate.candidate_name) ? `${candidate.name || candidate.candidate_name} · ` : ""}{candidateKind} — {candidateSkillCount} skills
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)" }}>No profile or resume skills yet. Complete Step 2 or 3.</span>
            )}
            {!hasUpstream && (
              <textarea
                aria-label="Type candidate skills"
                placeholder="Or type skills, comma-separated (Python, SQL, Docker…)"
                value={manualSkills}
                onChange={(e) => setManualSkills(e.target.value)}
                rows={2}
                style={{ display: "block", marginTop: 8, width: "100%", padding: 6, fontSize: 13, boxSizing: "border-box" }}
              />
            )}
          </div>
        </div>

        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, margin: "14px 0", color: "var(--text-secondary)" }}>
          <input type="checkbox" checked={useLlm} onChange={(e) => setUseLlm(e.target.checked)} />
          Use AI to catch skills described differently (falls back to fuzzy matching if unavailable)
        </label>

        <ErrorBanner message={error} onRetry={canRun ? handleRun : undefined} />
        <Button onClick={handleRun} isLoading={isLoading} disabled={!canRun}>
          {r ? "Re-run matching" : "Run skill matching"}
        </Button>
      </Card>

      {r && (
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
          <Card>
            <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
              <ScoreRing score={r.match_score} />
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor(r.match_score) }}>{r.verdict}</div>
                <p style={{ margin: "6px 0 12px", color: "var(--text-secondary)", fontSize: 14 }}>{r.summary}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  <StatTile label="Matched" value={r.matched_skills.length} />
                  <StatTile label="Missing" value={r.missing_skills.length} />
                  <StatTile label="JD skills" value={r.total_jd_skills} />
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
              {r.candidate_name ? `${r.candidate_name} vs ` : ""}{r.company ? `${r.company} · ` : ""}{r.role || r.jd_source_file}
              {r.used_llm ? " · AI-assisted matching" : ""}
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>🎯 Skill gaps — close these first ({r.missing_skills.length})</h3>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--text-muted)" }}>Ordered by how strongly the JD requires each skill.</p>
            {r.missing_skills.length === 0 ? (
              <div style={{ color: "#047857", fontWeight: 600 }}>No gaps — the candidate covers every required skill. 🎉</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {r.missing_skills.map((m) => {
                  const p = PRIORITY[m.priority] || PRIORITY.important;
                  return (
                    <div key={m.skill_name} className="skill-card">
                      <div className="skill-card-top">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <CategoryBadge code={m.category_code} />
                          <span className="skill-title">{m.skill_name}</span>
                        </div>
                        <Pill bg={p.bg} fg={p.fg} bd={p.bd}>{p.label}</Pill>
                      </div>
                      {m.evidence && <div className="skill-evidence">“{m.evidence}”</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>✅ Matched skills ({r.matched_skills.length})</h3>
            {r.matched_skills.length === 0 ? (
              <div style={{ color: "var(--text-muted)" }}>No overlap found.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {r.matched_skills.map((m) => (
                  <div key={m.skill_name} className="skill-card">
                    <div className="skill-card-top">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CategoryBadge code={m.category_code} />
                        <span className="skill-title">{m.skill_name}</span>
                        {m.candidate_skill && m.candidate_skill.toLowerCase() !== m.skill_name.toLowerCase() && (
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>← {m.candidate_skill}</span>
                        )}
                      </div>
                      <Pill bg="#ecfdf5" fg="#047857" bd="#a7f3d0">{MATCH_LABEL[m.match_type] || m.match_type}</Pill>
                    </div>
                    {m.evidence && <div className="skill-evidence">{m.evidence}</div>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {r.category_breakdown?.length > 0 && (
            <Card>
              <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Coverage by category</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {r.category_breakdown.map((c) => (
                  <div key={c.category_code}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 3 }}>
                      <span><strong>{c.category_code}</strong> · {CATEGORY_NAMES[c.category_code] || c.category_code}</span>
                      <span style={{ color: "var(--text-muted)" }}>{c.matched}/{c.required} · {c.score}%</span>
                    </div>
                    <div style={{ height: 8, background: "#e2e8f0", borderRadius: 9999 }}>
                      <div style={{ width: `${c.score}%`, height: "100%", background: scoreColor(c.score), borderRadius: 9999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {r.extra_candidate_skills?.length > 0 && (
            <Card>
              <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>Extra strengths not asked for in this JD</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {r.extra_candidate_skills.map((s) => (
                  <Pill key={s} bg="#f1f5f9" fg="#334155" bd="#cbd5e1">{s}</Pill>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

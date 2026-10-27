import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import { Button, Card, ErrorBanner } from "../components/UIComponents";
import { useWorkflow } from "../state/WorkflowContext";
import { createCandidateProfile, uploadCv, listSampleCandidates } from "../services/api";

const list = (v) => v.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

export default function ProfileBuilder() {
  const { state, setActiveModule, setProfile } = useWorkflow();
  const r = state.resumeResult || {};
  const p = state.profile || {};
  const [f, setF] = useState({
    name: p.name || r.name || "", email: p.email || r.email || "", education: p.education || r.education || "",
    skills: (p.skills || r.skills || []).map((s) => s.skill_name).join(", "),
    hackathons: (p.hackathons || []).join(", "), internships: (p.internships || []).join(", "),
    certifications: (p.certifications || r.certifications || []).join(", "),
    preferred_roles: (p.preferred_roles || []).join(", "),
  });
  const [cv, setCv] = useState(p.cv_file || "");
  const [samples, setSamples] = useState([]);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  React.useEffect(() => { listSampleCandidates().then(setSamples).catch(() => {}); }, []);
  function loadSample(id) {
    const c = samples.find((x) => x.candidate_id === id);
    if (!c) return;
    setProfile(c); setCv(c.cv_file || "");
    setF({ name: c.name, email: c.email, education: c.education, skills: c.skills.map((s) => s.skill_name).join(", "),
      hackathons: "", internships: "", certifications: "", preferred_roles: "" });
  }
  async function onCv(e) {
    try { setCv((await uploadCv(e.target.files[0])).cv_file); } catch (err) { setError(err.message); }
  }
  async function save() {
    setError(null);
    const known = new Map([...(r.skills || []), ...(p.skills || [])].map((s) => [s.skill_name.toLowerCase(), s]));
    const skills = list(f.skills).map((n) => known.get(n.toLowerCase()) || { skill_name: n, category_code: "OTHER", evidence: "added manually", confidence: "medium" });
    try {
      setProfile(await createCandidateProfile({ candidate_id: p.candidate_id, name: f.name, email: f.email,
        education: f.education, skills, hackathons: list(f.hackathons), internships: list(f.internships),
        certifications: list(f.certifications), preferred_roles: list(f.preferred_roles), cv_file: cv }));
      setSaved(true);
    } catch (e) { setError(e.message); }
  }
  const field = (k, label, area) => (
    <label style={{ display: "block", marginBottom: 12 }}>{label}
      {area ? <textarea rows={2} style={{ width: "100%" }} value={f[k]} onChange={set(k)} />
            : <input style={{ width: "100%" }} value={f[k]} onChange={set(k)} />}
    </label>);
  return (
    <div>
      <PageHeader eyebrow="STEP 3 OF 5 · ROLE 3" title="Profile Builder"
        subtitle="A full profile beyond the resume. Pre-filled from Resume Parsing; comma-separate lists."
        backAction={() => setActiveModule(null)} />
      <Card style={{ maxWidth: 800, margin: "0 auto" }}>
        {samples.length > 0 && (
          <select defaultValue="" onChange={(e) => loadSample(e.target.value)} style={{ marginBottom: 12 }}>
            <option value="">Load a sample candidate…</option>
            {samples.map((c) => <option key={c.candidate_id} value={c.candidate_id}>{c.name}</option>)}
          </select>)}
        {field("name", "Name")}{field("email", "Email")}{field("education", "Education")}
        {field("skills", "Skills", true)}{field("hackathons", "Hackathons", true)}
        {field("internships", "Internships", true)}{field("certifications", "Certifications", true)}
        {field("preferred_roles", "Preferred roles", true)}
        <label style={{ display: "block", marginBottom: 12 }}>CV upload (PDF/DOCX) {cv && <small>— {cv}</small>}<br /><input type="file" accept=".pdf,.docx" onChange={onCv} /></label>
        <Button onClick={save}>Save profile</Button>
        {error && <ErrorBanner message={error} />}
        {saved && <p>Saved ✓ (id {state.profile?.candidate_id}) <Button onClick={() => setActiveModule("talent-check")}>Run Talent Check →</Button></p>}
      </Card>
    </div>
  );
}

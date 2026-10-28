/**
 * Centralized API service for SkillSync Career-Readiness Platform.
 * Role 1 (JD Analytics) functions are fully implemented.
 * Roles 2-5 functions are clearly-marked stubs matching docs/api-contracts.md.
 */

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

/**
 * Robust fetch wrapper handling JSON and FormData payloads, and surfacing
 * backend `detail` error messages.
 */
export async function apiRequest(path, options = {}) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(!isFormData && options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `API request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch {
      // Non-JSON error body fallback
    }
    const error = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getHealth() {
  return apiRequest("/health");
}

// ==========================================
// ROLE 1: JD Analytics Endpoints
// ==========================================

/**
 * Fetch available companies from Supabase (read-only).
 */
export function getCompanies() {
  return apiRequest("/api/companies");
}

/**
 * Upload a PDF or DOCX file to extract skills.
 */
export function analyzeJdFile(file, { company = "", role = "" } = {}) {
  const formData = new FormData();
  formData.append("file", file);
  if (company) formData.append("company", company);
  if (role) formData.append("role", role);

  return apiRequest("/api/jd-analytics", {
    method: "POST",
    body: formData,
  });
}

/**
 * Submit plain text job description to extract skills.
 */
export function analyzeJdText({ description, title = "", company = "" }) {
  return apiRequest("/api/jd-analytics/text", {
    method: "POST",
    body: JSON.stringify({
      description,
      title: title || undefined,
      company: company || undefined,
    }),
  });
}

/**
 * List all saved JD analyses (history).
 */
export function listJdResults() {
  return apiRequest("/api/jd-analytics");
}

/**
 * Retrieve a specific saved JD analysis by ID.
 * Consumed by Role 5 (Skill Matching).
 */
export function getJdResult(id) {
  return apiRequest(`/api/jd-analytics/${id}`);
}

// ==========================================
// ROLES 2-5: Stubs for Teammates
// ==========================================

/**
 * [STUB] Role 2: Resume Parsing
 * Handled by Teammate #2.
 */
export function parseResume(resumeFile) {
  const formData = new FormData();
  formData.append("file", resumeFile);
  return apiRequest("/api/resume-parsing", {
    method: "POST",
    body: formData,
  });
}

/**
 * [STUB] Role 3: Profile Builder
 * Handled by Teammate #3.
 */
export function createCandidateProfile(profileData) {
  return apiRequest("/api/profiles", {
    method: "POST",
    body: JSON.stringify(profileData),
  });
}

export function getCandidateProfile(candidateId) {
  return apiRequest(`/api/profiles/${candidateId}`);
}

export function listCompanies() {
  return apiRequest("/api/talent-check/companies");
}

export function assessTalentCheck(profile, company) {
  return apiRequest("/api/talent-checks", { method: "POST", body: JSON.stringify({ profile, company }) });
}

/**
 * Role 5: Skill Matching.
 * Pass the saved JD analysis id (or inline jd) plus the candidate profile or
 * parsed resume object. Returns match_score, matched_skills, missing_skills.
 */
export function matchSkills({ jdId, jd, profile, resume, candidateSkills, candidateName, useLlm = true }) {
  return apiRequest("/api/skill-matches", {
    method: "POST",
    body: JSON.stringify({
      jd_id: jdId || undefined,
      jd: jdId ? undefined : jd,
      profile: profile || undefined,
      resume: profile ? undefined : resume || undefined,
      candidate_skills: candidateSkills?.length ? candidateSkills : undefined,
      candidate_name: candidateName || undefined,
      use_llm: useLlm,
    }),
  });
}

export function uploadCv(file) {
  const fd = new FormData();
  fd.append("file", file);
  return apiRequest("/api/profiles/cv", { method: "POST", body: fd });
}

export function listSampleCandidates() {
  return apiRequest("/api/samples/candidates");
}

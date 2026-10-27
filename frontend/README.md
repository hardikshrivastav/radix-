# RADIX Talent Match – Frontend Application

Light-theme React frontend shell built with Vite, plain modern CSS, and shared workflow state.
Designed as a plug-and-play foundation for all 5 team roles:

1. **Role 1 – JD Analytics** (Fully Implemented)
2. **Role 2 – Resume Parsing** (Placeholder ready for teammate)
3. **Role 3 – Profile Builder** (Placeholder ready for teammate)
4. **Role 4 – Talent Check** (Placeholder ready for teammate)
5. **Role 5 – Skill Matching** (Placeholder ready for teammate)

---

## 1. Running Locally (PowerShell)

```powershell
cd frontend
npm install
npm run dev
```

The Vite dev server will start at `http://localhost:5173`.
By default, the API service connects to `http://127.0.0.1:8000`. To override, set `VITE_API_BASE_URL` in `frontend/.env`.

To create a production bundle:
```powershell
npm run build
```

---

## 2. Shared State (`useWorkflow`)

Shared workflow state is managed via React Context in `frontend/src/state/WorkflowContext.jsx` and persisted to browser `localStorage`.

### How to use in any page or component:
```javascript
import { useWorkflow } from "../state/WorkflowContext";

export default function MyModulePage() {
  const { state, setResumeResult, setActiveModule } = useWorkflow();

  // Read data from previous steps:
  const activeJd = state.jdResult;           // Role 1 output
  const activeCompany = state.selectedCompany; // Target company name
  const candidateProfile = state.profile;    // Role 3 output

  // Save your module's output into shared state:
  function onExtractionDone(myOutput) {
    setResumeResult(myOutput); // Automatically marks Step 2 as completed
    setActiveModule("profile-builder"); // Advance flow to Step 3
  }

  return (/* JSX */);
}
```

### Available State Fields:
- `state.selectedCompany`: Target company string
- `state.targetRole`: Target job title
- `state.jdResult`: Role 1 output (`JDSkillList` with `skills`, `company`, `role`, `id`)
- `state.resumeResult`: Role 2 output (`skills`, `source_type: "resume"`)
- `state.profile`: Role 3 output (`name`, `email`, `education`, `skills`, etc.)
- `state.talentCheckResult`: Role 4 output (`readiness_score`, `skillset_gap`)
- `state.matchResult`: Role 5 output (`match_score`, `matched_skills`, `missing_skills`)
- `state.completedSteps`: `{ 1: bool, 2: bool, 3: bool, 4: bool, 5: bool }`

---

## 3. Shared Design System & Components

Use the existing reusable components in `frontend/src/components/` to maintain visual consistency:

- **`PageHeader`**: Consistent top header with title, subtitle, eyebrow, and back button.
- **`FlowStepper`**: 5-step interactive navigation with active highlights and completion checkmarks.
- **`Card`**: Standard 14px rounded card with subtle shadows and border tokens.
- **`Button`**: Primary, secondary, outline buttons with built-in loading spinner.
- **`CategoryBadge`**: Pre-styled pill badge for the 12 RADIX categories (`COD`, `DSA`, `OOD`, `APTI`, `COMM`, `AI`, `CLOUD`, `SQL`, `SWE`, `SYSD`, `NETW`, `OS`, `OTHER`).
- **`ConfidenceBadge`**: Pill badge for `high`, `medium`, and `low` confidence levels.
- **`FileDropzone`**: Drag-and-drop file upload supporting PDF and DOCX with 10MB validation.
- **`SkillChip`**: Compact card showing skill title, category, confidence badge, and expandable quote.
- **`ErrorBanner`**: Alert banner with retry support.
- **`StatTile`**: Stat summary tile.

---

## 4. API Helpers (`src/services/api.js`)

Centralized helper supporting both JSON bodies and `FormData` uploads:

```javascript
import {
  analyzeJdFile,
  analyzeJdText,
  getCompanies,
  listJdResults,
  getJdResult,
  parseResume,        // Role 2 stub
  createCandidateProfile, // Role 3 stub
  assessTalentCheck,  // Role 4 stub
  matchSkills,        // Role 5 stub
} from "../services/api";
```

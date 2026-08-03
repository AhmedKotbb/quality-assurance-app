# Cement Quality Evaluation System — Architecture & Design

A system that takes raw cement test readings, evaluates them against ASTM C150 / EN 197-1, flags defects, and generates optimization recommendations. Designed for a Node.js/NestJS stack.

---

## 1. Requirements

### Functional

- Accept raw oxide chemistry, Bogue phases, and physical/mechanical test data for a specified cement type.
- Derive any missing ratios (LSF, SR, AR, Bogue compounds if only oxides given).
- Classify every parameter as **PASS / MARGIN / FAIL** against the relevant standard's limits.
- Explain the practical impact of any flagged parameter.
- Produce prioritized, actionable optimization steps (raw mix, kiln, grinding).
- Persist the evaluation and trigger alerts on FAIL.

### Non-functional

- **Determinism & auditability are the dominant constraint.** This is a quality-control decision for a structural material — a PASS/FAIL verdict must be reproducible, explainable, and traceable to a specific standard/version, not a model's best guess.
- Low latency for the rule-based verdict (sub-second); the narrative/recommendation step can be slower (LLM round-trip, 1–5s) without blocking the verdict.
- Auditable history of every evaluation (regulatory/QA trail).
- Horizontally scalable, stateless compute.

### Key assumption / architecture decision

The diagram you shared puts the LLM (or ML model) directly in the critical path deciding pass/fail. **I'd change that.** The PASS/MARGIN/FAIL determination should come from a deterministic rule engine (real formulas, real standard tables) — the LLM should never be the thing that decides whether cement is safe to use. The LLM's job is narration: turning a structured set of flags into readable impact explanations and prioritized recommendations, always grounded in numbers the rule engine already computed. This eliminates hallucinated verdicts and gives you a system where the AI enriches the output rather than gatekeeping it.

---

## 2. Revised High-Level Architecture

```
[ Frontend / UI ]
        |
        | 1. POST /api/cement/evaluate  (JSON: readings + cement type)
        v
[ NestJS API Layer ]  ── class-validator DTO validation, range sanity checks
        |
        | 2. Sanitized input
        v
[ Chemistry/Standards Engine ]  ◄── DETERMINISTIC. No AI here. This is the source of truth.
        |   - Derive missing ratios: LSF, SR, AR, Bogue compounds
        |   - Look up standard limits (ASTM C150 Type I/II/V, EN 197-1 CEM I/II/III...)
        |   - Classify each parameter: PASS / MARGIN / FAIL
        |   - Emit a structured "EvaluationFindings" object (JSON)
        |
        | 3. EvaluationFindings (verdicts + raw values + limits, no prose yet)
        v
[ AI Narration Service ]  ◄── LLM lives HERE ONLY, as an enrichment step
        |   - Input: EvaluationFindings (already decided)
        |   - Prompt forbids re-deciding PASS/FAIL; only explain + recommend
        |   - Output validated against a strict JSON schema (zod)
        |   - On failure/timeout: degrade gracefully, return findings without prose
        v
[ Persistence & Business Logic ]
        |   - Store full report (raw input + findings + recommendations + standard version)
        |   - Trigger alerts (queue) if overall verdict = FAIL
        v
[ Response to Frontend ]
```

---

## 3. NestJS Module Breakdown

```
src/
  cement-evaluation/
    dto/
      evaluate-cement-request.dto.ts
      evaluation-report.dto.ts
    cement-evaluation.controller.ts
    cement-evaluation.service.ts        # orchestrates the pipeline below
  chemistry/
    bogue.util.ts                       # C3S/C2S/C3A/C4AF calculations
    ratios.util.ts                      # LSF, SR, AR
    chemistry.module.ts
  standards/
    standards.module.ts
    standards.service.ts                # loads limit tables (ASTM/EN), versioned
    data/
      astm-c150.json
      en-197-1.json
  rule-engine/
    rule-engine.module.ts
    rule-engine.service.ts              # PASS/MARGIN/FAIL classification, this is the "brain"
    impact-rules.ts                     # static mapping: parameter+direction -> practical impact text
  ai-narration/
    ai-narration.module.ts
    ai-narration.service.ts             # LLM call, prompt template, schema validation, fallback
    schemas/
      recommendation.schema.ts          # zod schema for LLM output
  reports/
    report.entity.ts
    reports.module.ts
    reports.service.ts                  # persistence + alert trigger
  alerts/
    alerts.module.ts                    # BullMQ producer for FAIL notifications
```

---

## 4. API Contract

### `POST /api/cement/evaluate`

**Request**

```json
{
  "cementType": "ASTM_TYPE_I",
  "oxides": {
    "CaO": 64.5, "SiO2": 21.0, "Al2O3": 5.2, "Fe2O3": 3.1,
    "MgO": 2.1, "SO3": 2.8, "LOI": 1.8, "IR": 0.5, "freeLime": 1.1
  },
  "boguePhases": {
    "C3S": null, "C2S": null, "C3A": null, "C4AF": null
  },
  "physical": {
    "blaineFineness": 350,
    "initialSettingTimeMin": 110,
    "finalSettingTimeMin": 220,
    "soundnessMm": 1.2,
    "compressiveStrengthMPa": { "day3": 22, "day7": 31, "day28": 46 }
  }
}
```

- If `boguePhases` fields are `null`, the Chemistry Engine derives them from oxides.
- `class-validator` enforces types, ranges (e.g. 0–100 for %), and that oxide percentages sum to a plausible 95–100%.

**Response**

```json
{
  "overallVerdict": "MARGIN",
  "standardApplied": "ASTM C150-22, Type I",
  "computedRatios": { "LSF": 0.92, "SR": 2.53, "AR": 1.68 },
  "boguePhases": { "C3S": 54.1, "C2S": 18.3, "C3A": 8.4, "C4AF": 9.4 },
  "parameterResults": [
    {
      "parameter": "freeLime",
      "value": 1.1,
      "limit": "<= 1.5",
      "status": "PASS"
    },
    {
      "parameter": "SO3",
      "value": 2.8,
      "limit": "<= 3.0 (C3A < 8%)",
      "status": "MARGIN"
    }
  ],
  "recommendations": [
    {
      "priority": 1,
      "issue": "SO3 near upper limit relative to C3A",
      "action": "Reduce gypsum addition at grinding by ~0.2–0.3% and re-check setting time; risk of false set if unchanged.",
      "category": "grinding"
    }
  ],
  "reportId": "uuid",
  "createdAt": "2026-08-02T10:00:00Z"
}
```

---

## 5. Evaluation Engine Logic (deterministic core)

### Derived ratios

```ts
// ratios.util.ts
export function calcLSF(CaO: number, SiO2: number, Al2O3: number, Fe2O3: number) {
  return CaO / (2.8 * SiO2 + 1.2 * Al2O3 + 0.65 * Fe2O3);
}
export function calcSR(SiO2: number, Al2O3: number, Fe2O3: number) {
  return SiO2 / (Al2O3 + Fe2O3);
}
export function calcAR(Al2O3: number, Fe2O3: number) {
  return Al2O3 / Fe2O3;
}
```

### Bogue compounds (when not supplied directly)

```ts
// bogue.util.ts
export function calcBogue({ CaO, SiO2, Al2O3, Fe2O3 }: Oxides) {
  const C3S = 4.071 * CaO - 7.600 * SiO2 - 6.718 * Al2O3 - 1.430 * Fe2O3;
  const C2S = 2.867 * SiO2 - 0.7544 * C3S;
  const C3A = 2.650 * Al2O3 - 1.692 * Fe2O3;
  const C4AF = 3.043 * Fe2O3;
  return { C3S, C2S, C3A, C4AF };
}
```

### Classification

The rule engine looks up each parameter against the `StandardsService` table for the requested cement type, then applies a **margin band** (e.g. within 5% of the limit → `MARGIN` instead of a hard `PASS`/`FAIL`) so borderline mixes get flagged for review rather than silently passing. `overallVerdict` = worst of all parameter statuses (`FAIL` > `MARGIN` > `PASS`).

Standard tables (`astm-c150.json`, `en-197-1.json`) are plain versioned JSON, not hardcoded in logic — this lets you update limits (e.g. a new ASTM revision) without touching the rule engine, and lets `EvaluationReport` record exactly which table version produced a given verdict (important for audits).

### Impact mapping

`impact-rules.ts` is a static, hand-authored dictionary — not AI-generated — because impact statements are established metallurgical/cement-chemistry facts (e.g. "high free lime → delayed expansion/unsoundness"; "low C3S → weak early strength"; "high C3A → high heat of hydration, poor sulfate resistance"). This is fed to the AI Narration step as _context_, not something the LLM invents.

---

## 6. AI Narration Service — the only place the LLM appears

```ts
// ai-narration.service.ts
async narrate(findings: EvaluationFindings): Promise<Recommendation[]> {
  const prompt = buildPrompt(findings); // includes ONLY findings already decided by rule engine
  const raw = await this.llmClient.complete({
    system: NARRATION_SYSTEM_PROMPT, // explicitly: "Do not alter or re-derive PASS/FAIL. Only explain and recommend."
    messages: [{ role: 'user', content: prompt }],
    responseFormat: 'json',
  });

  const parsed = RecommendationArraySchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    this.logger.warn('AI narration failed schema validation, degrading gracefully');
    return []; // report still returns with verdicts + limits, just no prose
  }
  return parsed.data;
}
```

Guardrails:

- **Schema-validated output** (zod) — malformed or off-spec responses are discarded, not passed through.
- **Timeout + graceful degradation** — if the LLM is slow/unavailable, the report still ships with the deterministic verdict; recommendations are simply omitted (never block the core answer on the AI call).
- **No numeric authority** — the system prompt explicitly instructs the model it is not permitted to change a status or invent a value; it only explains and prioritizes fixes for statuses it's given.

---

## 7. Data Model (sketch, Prisma-style)

```prisma
model EvaluationReport {
  id               String   @id @default(uuid())
  cementType       String
  standardVersion  String
  inputPayload     Json
  computedRatios   Json
  boguePhases      Json
  parameterResults Json
  overallVerdict   String   // PASS | MARGIN | FAIL
  recommendations  Json?
  createdAt        DateTime @default(now())
}
```

Storing `inputPayload` + `standardVersion` alongside the verdict means any report can be independently re-verified later — important for QA/compliance disputes.

---

## 8. Error Handling & Validation

- **Input**: `class-validator` DTOs — type/range checks, oxide sum sanity check (95–100%), reject if `cementType` isn't a known standard.
- **Rule engine**: pure functions, unit-tested against known reference mixes (this is your highest-value test suite — get a cement chemist or published worked examples to validate the Bogue/LSF numbers before shipping).
- **AI step**: isolated behind a circuit breaker; failures never surface as 500s to the client, they just reduce the response.

---

## 9. Scale & Reliability

- Stateless NestJS service behind a load balancer — horizontal scaling is trivial since the rule engine has no shared state.
- Standards tables loaded once at boot and cached in memory (they change rarely).
- BullMQ (Redis-backed) queue for FAIL alerts, decoupled from the request/response cycle.
- Structured logging of every verdict decision (which limit table, which values, which classification) for audit trail — this matters more here than in a typical CRUD app.

---

## 10. Trade-offs

|Approach|Pros|Cons|
|---|---|---|
|**Rule engine (verdict) + LLM (narration)** — recommended|Deterministic, auditable, cheap for the critical path, LLM failure is non-fatal|Slightly more upfront engineering to build/maintain standard tables|
|LLM decides everything (original diagram)|Fastest to prototype|Non-deterministic verdicts, no audit trail, hallucination risk on a safety-relevant decision|
|Custom ML model (XGBoost) for verdict|Could outperform fixed rules if trained on real plant data with strength outcomes|Needs a labeled historical dataset you likely don't have yet; opaque without SHAP-style explainability work|

---

## 11. What I'd revisit as this grows

- Replace/augment the Bogue heuristic with a regression model trained on your own plant's historical mix-to-strength data once you have enough samples — Bogue is a well-known approximation, not ground truth.
- Version the standards tables explicitly (ASTM C150-22 vs -24) and let requests pin a version for reproducibility.
- Multi-tenant support if this serves multiple plants with different default standards/margins.
- Consider making the narration step async (return verdict immediately, stream recommendations via websocket/polling) if LLM latency becomes noticeable under load.
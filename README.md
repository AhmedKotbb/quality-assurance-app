# Cement Quality Evaluation API

API-only NestJS demo that evaluates ASTM C150 Type I cement oxide readings against standard limits, persists reports in PostgreSQL, and returns PASS / MARGIN / FAIL verdicts with process recommendations.

## How to run

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with user/password/db `qa` / `qa` / `qa_cement`.

### 2. Configure environment

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=qa
DATABASE_PASSWORD=qa
DATABASE_NAME=qa_cement
NARRATION_MODE=llm
LLM_BASE_URL=placeholder
LLM_API_KEY=placeholder
LLM_MODEL=placeholder
MARGIN_PCT=5
```

- `NARRATION_MODE=template` — recommendations from deterministic templates (default for local demos)
- `NARRATION_MODE=llm` — optional LLM enrichment via an OpenAI-compatible API; falls back to templates on failure

### 3. Install and start

```bash
npm install
npm run start:dev
```

The app listens at:

- API: [http://localhost:3000/api](http://localhost:3000/api)
- Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### Other commands

```bash
npm run start        # one-shot start
npm run start:prod   # production (after npm run build)
npm run test         # unit tests
```

---

## What this app does

Given laboratory oxide readings for **ASTM C150 Type I** cement, the service runs a fixed evaluation pipeline:

1. **Validate** the request (oxide ranges and a ~95–105% oxide sum sanity check)
2. **Derive chemistry** — LSF, SR, AR ratios and Bogue phases (C₃S, C₂S, C₃A, C₄AF)
3. **Rule engine** — compare oxides, ratios, and phases against ASTM C150 Type I limits; each parameter gets PASS, MARGIN (near the limit), or FAIL
4. **Narration** — build structured recommendations (template or optional LLM)
5. **Persist** the full report in PostgreSQL for later retrieval

Overall verdict is the worst status across all evaluated parameters. Responses use a unified envelope:

```json
{ "message": "...", "statusCode": 200, "data": { ... }, "timestamp": "..." }
```

---

## APIs

Base path: `/api`. Interactive docs: `/api/docs`.

### 1. Create evaluation

`POST /api/evaluations`

Evaluates oxide readings, generates recommendations, and stores the report.

**Request body example:**

```json
{
  "cementType": "ASTM_TYPE_I",
  "oxides": {
    "CaO": 64.5,
    "SiO2": 21.0,
    "Al2O3": 5.2,
    "Fe2O3": 3.1,
    "MgO": 2.1,
    "SO3": 2.8,
    "LOI": 1.8,
    "IR": 0.5,
    "freeLime": 1.1
  }
}
```

**Response `data` includes:** `reportId`, `overallVerdict`, `standardApplied`, `computedRatios`, `boguePhases`, `parameterResults`, `recommendations`, `narrationMode`, `createdAt`.

### 2. List evaluations

`GET /api/evaluations`

Returns a paginated list of stored reports.

| Query param       | Description                          | Default |
| ----------------- | ------------------------------------ | ------- |
| `overallVerdict`  | Filter by `PASS`, `MARGIN`, or `FAIL` | —       |
| `page`            | Page number (≥ 1)                    | `1`     |
| `limit`           | Page size (1–100)                    | `20`    |

Example: `GET /api/evaluations?overallVerdict=FAIL&page=1&limit=20`

### 3. Get evaluation by id

`GET /api/evaluations/:id`

Fetches a single stored evaluation report by UUID (`reportId` from create).

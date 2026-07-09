# AI-Powered CSV CRM Importer 🚀

An enterprise-grade, high-performance monorepo application to parse, validate, and normalize lead contact list exports into standardized CRM structures using OpenAI or Gemini LLMs. Built using Next.js 15, Node.js + Express 5, TypeScript, and Turborepo.

---

## 🏗️ Architecture Overview

The system runs a distributed, decoupled processing pipeline:

```
[CSV Contact File Upload] 
         │ (PapaParse Stream Parsing - 100K+ rows support)
         ▼
[Local Data Quality & Warnings Check]
         │ 
         ▼
[Confirm Import API payload (POST /uploads/confirm)]
         │ 
         ▼
[Backend Data Quality Guard & Batches (size 20)]
         │ 
         ▼
[Parallel AI Extraction Pipeline (Concurrency limit = 3)]
   ├── OpenAI Provider (gpt-4o Struct JSON)
   └── Gemini Provider (gemini-1.5-flash JSON Schema)
         │
         ▼
[Zod Schema Verification & Mapping Insights]
         │ (Normalized CRM Records)
         ▼
[Vercel-style Result Dashboard Dashboard]
```

---

## ⚡ Tech Stack

*   **Monorepo Tooling**: pnpm Workspace, Turborepo
*   **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS, shadcn/ui, PapaParse, Lucide Icons
*   **Backend**: Node.js, Express 5, Multer, Zod, OpenAI SDK, `@google/generative-ai` SDK, Pino Logger, express-rate-limit
*   **Shared Contract**: Zod schemas shared directly across frontend and backend packages for type safety.

---

## 🔑 Environment Variables

### Backend (`apps/api/.env`)
```env
PORT=3001
NODE_ENV=production
LOG_LEVEL=info
LLM_PROVIDER=openai # 'openai' or 'gemini'
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-1.5-flash
MAX_UPLOAD_SIZE_BYTES=10485760 # 10MB
ALLOWED_MIME_TYPES=text/csv,application/vnd.ms-excel,text/plain
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🛠️ Installation & Running Locally

Ensure Node.js v20+ and pnpm are installed.

```bash
# Install workspace dependencies
pnpm install

# Build shared package structures
pnpm build

# Start both services in development mode
pnpm dev
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:3001`.

---

## 🐳 Docker Deployment

To build and run production Docker containers locally:

```bash
# Spin up production orchestrated multi-containers
docker-compose up --build
```

---

## 📖 API Documentation

### 1. Upload CSV File
*   **Method**: `POST`
*   **Endpoint**: `/api/v1/uploads`
*   **Content-Type**: `multipart/form-data`
*   **Payload**: `file` (binary CSV)
*   **Response (202 Accepted)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "7876a445-562a-464a-9357-12845cba2a32",
        "filename": "leads.csv",
        "fileSize": 10485,
        "status": "pending",
        "createdAt": "2026-07-09T18:00:00.000Z",
        "updatedAt": "2026-07-09T18:00:00.000Z"
      }
    }
    ```

### 2. Confirm CSV Mapping (AI Extraction Pipeline)
*   **Method**: `POST`
*   **Endpoint**: `/api/v1/uploads/confirm`
*   **Content-Type**: `application/json`
*   **Payload**:
    ```json
    {
      "filename": "leads.csv",
      "fileSize": 10485,
      "rows": [
        { "Customer Name": "Alice", "Contact": "alice@gmail.com" }
      ]
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "7876a445-562a-464a-9357-12845cba2a32",
        "filename": "leads.csv",
        "status": "done",
        "recordsExtracted": 1,
        "recordsSkipped": 0,
        "processingTimeMs": 1250,
        "batchCount": 1
      }
    }
    ```

### 3. Retrieve CRM Results
*   **Method**: `POST`
*   **Endpoint**: `/api/v1/crm-records/:jobId?page=1&limit=100`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "jobId": "7876a445-562a-464a-9357-12845cba2a32",
        "total": 1,
        "page": 1,
        "limit": 100,
        "records": [
          {
            "id": "b1b11b11-b1b1-b1b1-b1b1-b1b11b11b1b1",
            "created_at": "2026-07-09T18:00:00.000Z",
            "name": "Alice",
            "email": "alice@gmail.com",
            "mobile_without_country_code": "",
            "crm_status": "GOOD_LEAD_FOLLOW_UP",
            "warnings": [],
            "mappings": { "Customer Name": "name", "Contact": "email" }
          }
        ],
        "skippedRecords": [],
        "mappingInsights": [
          { "sourceColumn": "Customer Name", "crmField": "name", "sampleValues": ["Alice"] }
        ]
      }
    }
    ```

---

## 🎯 WOW Features & Insights
*   **AI Confidence Score & Warnings**: Highlights records with potential duplicates or anomalies using visual badges.
*   **Processing Timeline**: Renders complete lifecycle diagnostics (Pending $\rightarrow$ Stream Parsing $\rightarrow$ Chunk Extraction $\rightarrow$ Normalization $\rightarrow$ Completion).
*   **Interactive Mappings explanation**: Outlines exactly which original CSV columns translated to standard keys.
*   **Double-Exporter**: Export processed records as a raw CSV or full-detail JSON report.

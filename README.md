# MeetMinGenerator

AI-powered meeting minutes generator that transforms raw meeting transcripts into structured, actionable intelligence — summaries, action items, risks, decisions, and deadlines — powered by Google Gemini.

---

## Overview

MeetMinGenerator takes meeting transcripts (TXT, DOCX, PDF, SRT, VTT) and uses an LLM to extract structured insights: executive summaries, bullet points, timelines, action items with owners and deadlines, risks with severity and mitigation, and decisions with impact analysis. Results are stored in Supabase, visualized on a dashboard, and exportable in multiple formats.

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Next.js UI  │────▶│  Supabase (Postgres)  │◀──│ Gemini LLM API  │
│  (App Router)│     │  Auth + RLS + Tables │    │ (Edge Function) │
└──────────────┘     └──────────────────┘     └─────────────────┘
        │                        │
        ▼                        ▼
  Client fetches           Edge Function invokes
  Supabase directly        Gemini, persists results
```

**Flow:**

1. User uploads a transcript file via the Upload page.
2. The file content is stored in the `meetings` table (`raw_transcript`).
3. The client calls the `process-meeting` Supabase Edge Function.
4. The Edge Function cleans the transcript, sends it to Gemini with a structured JSON schema prompt, and parses the response.
5. Extracted data is persisted across `meeting_summaries`, `action_items`, `risks`, `decisions`, and `deadlines` tables.
6. The user is redirected to a processing page, then the meeting detail view with full results.

---

## Technology Stack

| Layer        | Technology                                      |
| ------------ | ------------------------------------------------ |
| Frontend     | Next.js 13 (App Router), React 18, TypeScript    |
| UI           | Tailwind CSS, shadcn/ui, Radix UI, Framer Motion |
| Charts       | Recharts                                         |
| Backend      | Supabase (PostgreSQL, Auth, Edge Functions)      |
| AI / LLM     | Google Gemini (`gemini-2.0-flash`)               |
| Auth         | Supabase email/password with RLS policies         |
| Deployment   | Netlify                                          |
| Testing      | Vitest                                           |

---

## Installation

### Prerequisites

- Node.js 18+
- npm
- A Supabase project
- A Google Gemini API key

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/charan10096/minGenerator.git
cd minGenerator

# 2. Install dependencies
npm install

# 3. Configure environment variables
#    Create a .env.local file (see Configuration below)

# 4. Run database migrations
#    Apply the SQL files in database/migrations/ to your Supabase project
#    via the Supabase dashboard SQL editor or MCP tools

# 5. Set the Gemini API key as an Edge Function secret
#    In Supabase dashboard: Edge Functions → Secrets → add GEMINI_API_KEY

# 6. Start the dev server
npm run dev

# 7. Run tests
npm test
```

### Configuration

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

The following are used server-side in the Edge Function (set as Supabase secrets, not in `.env.local`):

```
GEMINI_API_KEY=<your-gemini-api-key>
SUPABASE_URL=<your-project-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## Usage

### Uploading a Meeting

1. Sign in or create an account.
2. Navigate to **Upload** from the dashboard or sidebar.
3. Drag & drop or browse for a transcript file (TXT, DOCX, PDF, SRT, VTT — max 100MB).
4. Enter a meeting title (auto-filled from filename).
5. Click **Upload & Process** — the AI analysis begins immediately.

### Viewing Results

- **Dashboard** — overview stats, charts, recent meetings and action items.
- **Meeting Detail** (`/meetings/[id]`) — full summary, participants, agenda, highlights, action items, risks, and decisions.
- **Action Items** — all action items across meetings, filterable by priority and status.
- **Risks** — risk register with severity and mitigation strategies.
- **Decisions** — decision log with decision makers and impact.
- **Deadlines** — upcoming deadlines sorted by due date.
- **History** — chronological list of all processed meetings.
- **Reports** — aggregate analytics and trends.
- **Search** — full-text search across meetings, actions, risks, and decisions.

### Exporting

From any meeting detail page, results can be exported as:
- Markdown (`.md`)
- JSON (`.json`)
- CSV (`.csv`)
- PDF (`.pdf`)
- DOCX (`.docx`)

---

## API Documentation

### Supabase Edge Function: `process-meeting`

**Endpoint:**
```
POST /functions/v1/process-meeting
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <user-access-token>
apikey: <supabase-anon-key>
```

**Request Body:**
```json
{
  "meetingId": "uuid-of-the-meeting"
}
```

**Response (success):**
```json
{
  "success": true,
  "result": {
    "title": "Q3 Product Strategy Review",
    "participants": ["Alice", "Bob"],
    "executive_summary": "...",
    "action_items": [...],
    "risks": [...],
    "decisions": [...]
  }
}
```

**Response (error):**
```json
{
  "error": "Description of what went wrong"
}
```

**Status codes:**

| Code | Meaning                          |
| ---- | -------------------------------- |
| 200  | Processing completed             |
| 400  | Missing `meetingId` or empty transcript |
| 404  | Meeting not found                 |
| 422  | LLM response failed validation    |
| 500  | Server error or missing API key   |
| 502  | Gemini API request failed         |

### Database Schema

| Table                | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `meetings`           | Core meeting record with transcript and status       |
| `meeting_summaries`  | AI-generated summaries (executive, detailed, bullet) |
| `action_items`       | Extracted tasks with owner, priority, deadline       |
| `risks`              | Identified risks with category, severity, mitigation |
| `decisions`          | Decisions with maker, reason, impact                 |
| `deadlines`          | Action items that have due dates                     |
| `exports`            | Export history records                               |
| `notifications`      | User notifications                                   |
| `audit_logs`         | Audit trail of user actions                          |
| `api_usage`          | LLM token usage and cost tracking                    |
| `profiles`           | User profile data                                    |

All tables use Row Level Security (RLS) with per-user ownership policies (`auth.uid() = user_id`).

---

## Screenshots

> Add screenshots here after deployment:
>
> - Dashboard overview with stats and charts
> - Upload page with drag-and-drop
> - Meeting detail with AI-generated summary
> - Action items board
> - Risk register
> - Reports and analytics

---

## Future Improvements

- [ ] Real-time collaboration on meeting notes
- [ ] Audio/video file support with automatic transcription (Whisper API)
- [ ] Calendar integration for automatic deadline syncing
- [ ] Slack / email notifications for upcoming deadlines
- [ ] Multi-language transcript support with translation
- [ ] Custom prompt templates per organization
- [ ] Meeting comparison and trend analysis across time periods
- [ ] Webhook API for third-party integrations
- [ ] Bulk upload and batch processing
- [ ] Role-based access control for teams

---

## Project Structure

```
project/
├── app/                          # Next.js App Router pages
│   ├── (app)/                    # Authenticated app routes
│   │   ├── dashboard/            # Main dashboard with stats & charts
│   │   ├── upload/               # Transcript upload (drag & drop)
│   │   ├── meetings/[id]/        # Meeting detail + processing view
│   │   ├── action-items/         # Action items board
│   │   ├── risks/                # Risk register
│   │   ├── decisions/            # Decision log
│   │   ├── deadlines/            # Deadline tracker
│   │   ├── history/              # Meeting history
│   │   ├── reports/              # Analytics and reports
│   │   ├── search/               # Full-text search
│   │   ├── settings/             # User settings
│   │   ├── profile/              # User profile
│   │   └── admin/                # Admin panel
│   ├── login/                    # Sign in
│   ├── register/                 # Sign up
│   ├── forgot-password/          # Password reset
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── backend/                      # Supabase Edge Functions (Deno runtime)
│   └── process-meeting/          # Gemini-powered meeting analysis function
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── dashboard/                # Dashboard-specific components
│   └── providers/                # Auth, theme, and guard providers
├── database/                     # Database schema & migrations
│   └── migrations/               # SQL migration files
├── extractor/                    # Entity extraction (actions, risks, decisions, deadlines)
├── hooks/                        # React hooks (dashboard data, table data, toast)
├── lib/                          # Shared utilities & types
│   ├── api.ts                    # Client-side API helpers
│   ├── export.ts                 # Export utilities (MD, JSON, CSV)
│   ├── format.ts                 # Date & file formatting utilities
│   ├── types.ts                  # TypeScript interfaces
│   ├── utils.ts                  # General utilities (cn, etc.)
│   └── supabase/                 # Supabase client/server
├── parsers/                      # Transcript parsers (VTT, SRT, TXT cleaning)
├── prompts/                      # LLM prompt templates
│   ├── meeting-analysis.ts       # Main Gemini analysis prompt
│   └── index.ts                  # Re-exports
├── reports/                      # Report generation (Markdown, CSV, JSON exports)
├── summarizer/                   # LLM response parsing & summary building
├── tests/                        # Unit tests (Vitest)
│   ├── parsers.test.ts           # Transcript parser tests
│   ├── validators.test.ts        # LLM response validation tests
│   └── extractor.test.ts         # Entity extraction tests
├── uploads/                      # Upload handling (dev placeholder)
├── validators/                   # LLM response schema validation
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── README.md
```

### Module Responsibilities

| Module       | Responsibility                                          |
| ------------ | -------------------------------------------------------- |
| `parsers/`   | Cleans raw transcripts — strips timestamps, VTT/SRT markers, normalizes whitespace |
| `prompts/`   | Defines the structured JSON schema prompt sent to Gemini |
| `summarizer/`| Builds the prompt from a transcript, parses the LLM JSON response |
| `extractor/` | Extracts & deduplicates action items, risks, decisions, deadlines from LLM output |
| `validators/`| Validates the LLM response against the expected schema before persistence |
| `reports/`   | Generates exportable reports (Markdown, CSV, JSON) from meeting data |
| `backend/`   | Supabase Edge Function that orchestrates the full pipeline server-side |
| `database/`  | SQL migrations defining tables, RLS policies, indexes, triggers |
| `tests/`     | Unit tests for parsers, validators, and extractor modules |

---

## License

This project is proprietary. All rights reserved.

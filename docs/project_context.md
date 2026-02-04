# AI Medical Agent - Project Context

## Project Overview

**AI Medical Agent** is a medical assistant application that generates daily improvement recommendations based on patient clinical data. The system analyzes patient information (age, weight, height, medical history, medications) and provides personalized recommendations for nutrition, lifestyle improvements, and non-critical alerts.

### Integration Options
- External platform integration via widget or connector
- Standalone PWA (Progressive Web App)
- Native mobile apps (iOS/Android via Capacitor)

## Tech Stack

### Backend
- **Framework:** NestJS with Fastify adapter
- **Database:** MongoDB
- **Vector Search:** MongoDB Vector Search, Pinecone, or OpenSearch (for context/embeddings)
- **AI Provider:** OpenAI or Google Gemini

### Frontend
- **Framework:** Next.js
- **Mobile:** Capacitor (for iOS/Android apps)

## Development Phases

### Phase 1: Initial Backend Setup
- Setup NestJS project structure
- Configure MongoDB database
- Implement initial tests

### Phase 2: Integration
- Implement authentication system
- Define API endpoints and database schema
- Create data ingestion pipeline for patient data
- Implement data normalization
- Build data interpretation layer

### Phase 3: AI Agent ✅
- Create system prompts with defined rules (language, context, limits, etc.) ✅
- Implement external context injection (specialized medical areas like cardiology or nutrition - may be client-defined) ✅ (RAG stub ready)
- Build orchestrator for daily suggestions/improvements based on current patient data ✅
- Create unit tests ✅
- Provider-agnostic LLM layer (OpenAI, Gemini stub) ✅

### Phase 4: Widget Development
- Create embeddable widget component
- Widget should consume current patient information
- Display suggestions (nutritional plans, exercise plans, etc.)

### Phase 5: PWA + Mobile App
- Initial setup (Next.js + Capacitor)
- User registration and login
- Collect initial user data (age, height, weight, etc.)
- Create simple home page - daily summary + recommendations
- Patient data editing (height, age, etc.)
- PDF ingestion for patient data (medical reports, prescriptions)
- Suggestions display + history

### Phase 6: Polish & Testing
- Bug fixes
- Comprehensive testing

## Key Features

### Patient Data Management
- Store and manage patient clinical data:
  - Demographics (age, weight, height)
  - Medical history
  - Current medications
  - Medical documents (PDF ingestion)

### AI Recommendations
- Daily personalized recommendations:
  - Nutritional plans
  - Lifestyle improvements
  - Exercise plans
  - Non-critical health alerts

### Context-Aware System
- Support for specialized medical contexts (cardiology, nutrition, etc.)
- External context injection capabilities
- Vector search for relevant medical information

## Project structure (folders and files)

Current layout of the repository:

```
MedicalAgent/
├── .cursorrules
├── .github/
│   └── workflows/
│       ├── backend-build.yml
│       ├── deploy-BE.yml
│       ├── deploy-FE.yml
│       ├── health-check.yml
│       └── README.md
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── .prettierrc
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── examples/
│   │   └── api-examples.md
│   ├── scripts/
│   │   ├── README.md
│   │   ├── seed-fake-data.ts
│   │   └── seed-jane-vitals.ts
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.controller.ts
│   │   ├── app.controller.spec.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   └── public.decorator.ts
│   │   │   ├── dto/
│   │   │   │   ├── index.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── local-auth.guard.ts
│   │   │   ├── schemas/
│   │   │   │   └── user.schema.ts
│   │   │   └── strategies/
│   │   │       ├── jwt.strategy.ts
│   │   │       └── local.strategy.ts
│   │   ├── common/
│   │   │   ├── health/
│   │   │   │   ├── health.controller.ts
│   │   │   │   ├── health.module.ts
│   │   │   │   └── health.service.ts
│   │   │   └── utils/
│   │   │       ├── date.utils.ts
│   │   │       └── index.ts
│   │   ├── infra/
│   │   │   └── database/
│   │   │       ├── database.module.ts
│   │   │       └── mongo-connection.logger.ts
│   │   ├── patients/
│   │   │   ├── patients.controller.ts
│   │   │   ├── patients.module.ts
│   │   │   ├── patients.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── index.ts
│   │   │   │   ├── create-vital.dto.ts
│   │   │   │   ├── update-profile.dto.ts
│   │   │   │   └── patient-snapshot.dto.ts
│   │   │   └── schemas/
│   │   │       ├── index.ts
│   │   │       ├── user-exam.schema.ts
│   │   │       ├── user-medication.schema.ts
│   │   │       └── user-vital.schema.ts
│   │   ├── llm/                            # Provider-agnostic LLM layer
│   │   │   ├── interfaces/
│   │   │   │   ├── text.ts                 # TextGenerator, LLM_TEXT_GENERATOR token
│   │   │   │   ├── audio.ts
│   │   │   │   └── images.ts
│   │   │   ├── providers/
│   │   │   │   ├── openai/
│   │   │   │   │   ├── client.ts
│   │   │   │   │   ├── config.ts
│   │   │   │   │   ├── openai-llm-service.ts
│   │   │   │   │   ├── text/ (gpt, gpt-4o, gpt-4.1-mini)
│   │   │   │   │   └── audio/whisper/
│   │   │   │   └── gemini/
│   │   │   │       ├── client.ts
│   │   │   │       ├── gemini-llm-service.ts
│   │   │   │       └── text/gemini-pro/
│   │   │   ├── prompts/
│   │   │   │   ├── prompts.config.ts
│   │   │   │   ├── system-prompt.builder.ts
│   │   │   │   ├── patient-snapshot.formatter.ts
│   │   │   │   └── index.ts
│   │   │   ├── llm-service.types.ts
│   │   │   ├── llm-provider-factory.ts
│   │   │   ├── llm.module.ts
│   │   │   └── index.ts
│   │   ├── rag/                            # RAG retrieval (stub)
│   │   │   ├── rag.interface.ts
│   │   │   ├── rag.service.ts
│   │   │   ├── rag.module.ts
│   │   │   └── index.ts
│   │   └── recommendations/                # Daily recommendations API
│   │       ├── dto/
│   │       │   ├── daily-recommendation.dto.ts
│   │       │   └── index.ts
│   │       ├── recommendations.controller.ts
│   │       ├── recommendations.service.ts
│   │       ├── recommendations.service.spec.ts
│   │       ├── recommendations.module.ts
│   │       └── index.ts
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   └── README.md
├── docs/
│   ├── ai_agent.md
│   ├── ai_agent_implementation_plan.md
│   ├── auth_env.md
│   ├── data_model.md
│   ├── frontend_structure.md
│   ├── initial_thoughts.md
│   ├── project_context.md
│   └── technologies_overview.md
└── frontend/
    ├── .env.example
    ├── .eslintrc.json
    ├── .gitignore
    ├── next.config.mjs
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── globals.css
    │   │   ├── (app)/
    │   │   │   ├── layout.tsx
    │   │   │   ├── loading.tsx
    │   │   │   ├── error.tsx
    │   │   │   ├── add/
    │   │   │   │   └── page.tsx
    │   │   │   ├── dashboard/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── loading.tsx
    │   │   │   └── profile/
    │   │   │       ├── page.tsx
    │   │   │       └── loading.tsx
    │   │   └── login/
    │   │       └── page.tsx
    │   ├── components/
    │   │   ├── Add.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Profile.tsx
    │   │   ├── Widget.tsx
    │   │   ├── add/
    │   │   │   └── AddVitalsForm.tsx
    │   │   ├── layout/
    │   │   │   ├── AboutModal.tsx
    │   │   │   ├── AppNav.tsx
    │   │   │   ├── AppShell.tsx
    │   │   │   ├── Footer.tsx
    │   │   │   ├── Header.tsx
    │   │   │   └── nav-config.tsx
    │   │   └── ui/
    │   │       ├── Field.tsx
    │   │       ├── PageLoading.tsx
    │   │       └── Spinner.tsx
    │   ├── lib/
    │   │   ├── api.ts
    │   │   ├── config.ts
    │   │   ├── format.ts
    │   │   └── vital-format.ts
    │   ├── pages/
    │   │   └── LoginForm.tsx
    │   └── types/
    │       ├── profile.ts
    │       └── vital.ts
    └── README.md
```

## Architecture Notes

- Backend uses NestJS with Fastify for performance
- MongoDB for primary data storage
- Vector search capabilities for semantic medical context retrieval
- Multi-platform frontend (web PWA + native mobile apps)
- Widget-based integration for external platforms
- **LLM layer**: Provider-agnostic architecture (Template Method + Strategy)
  - `llm/providers/` holds OpenAI and Gemini implementations; consumers use `TextGenerator` via `LLM_TEXT_GENERATOR`
  - Config-driven model selection via `LLM_PROVIDER` and `OPENAI_CHAT_MODEL`
  - Patient snapshot DTO lives in **patients** (output of getPatientSnapshotForAgent); daily recommendation DTO in **recommendations** (API response shape)
  - See [ai_agent_implementation_plan.md](ai_agent_implementation_plan.md) for details
- **Common utils**: Shared helpers (e.g. `common/utils/date.utils.ts` for `calculateAge`) live under `common/utils`

### Frontend routing and layout

- **PWA / full app**: Uses **Next.js routes** with real URLs (`/dashboard`, `/add`, `/profile`). The shared layout (header “Healthia”, footer “About Healthia”, bottom nav) is in `components/layout/` and composed by `AppShell`; `app/(app)/layout.tsx` wraps app pages with it.
- **Widget** (floating panel): The widget is a **shell only** (rectangle + close button + iframe). The iframe loads the **full app** at `/dashboard`, so the same layout and routes run inside the iframe. One code path; no duplicate chrome or nav.
- **Component structure**: Layout pieces live under `components/layout/` (Header, Footer, AppNav, AboutModal, AppShell, nav-config) and are reusable. Page content lives under `components/views/` (DashboardView, AddView, ProfileView). Names are layout-agnostic so they can be used by any layout (PWA, widget iframe, etc.).

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

### Phase 3: AI Agent
- Create system prompts with defined rules (language, context, limits, etc.)
- Implement external context injection (specialized medical areas like cardiology or nutrition - may be client-defined)
- Build orchestrator for daily suggestions/improvements based on current patient data
- Create unit tests

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

## Architecture Notes

- Backend uses NestJS with Fastify for performance
- MongoDB for primary data storage
- Vector search capabilities for semantic medical context retrieval
- Multi-platform frontend (web PWA + native mobile apps)
- Widget-based integration for external platforms

### Frontend routing and layout

- **PWA / full app**: Uses **Next.js routes** with real URLs (`/dashboard`, `/add`, `/profile`). The shared layout (header “Healthia”, footer “About Healthia”, bottom nav) is in `components/layout/` and composed by `AppShell`; `app/(app)/layout.tsx` wraps app pages with it.
- **Widget** (floating panel): The widget is a **shell only** (rectangle + close button + iframe). The iframe loads the **full app** at `/dashboard`, so the same layout and routes run inside the iframe. One code path; no duplicate chrome or nav.
- **Component structure**: Layout pieces live under `components/layout/` (Header, Footer, AppNav, AboutModal, AppShell, nav-config) and are reusable. Page content lives under `components/views/` (DashboardView, AddView, ProfileView). Names are layout-agnostic so they can be used by any layout (PWA, widget iframe, etc.).

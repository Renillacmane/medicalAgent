# Technologies Overview

## NestJS (with Fastify)

### What NestJS is
NestJS is a TypeScript-first Node.js backend framework focused on scalable architecture and maintainability. It promotes a consistent structure using:
- Modules (feature boundaries)
- Controllers (HTTP layer)
- Providers/Services (business logic)
- Dependency Injection (testability + swap implementations)
- Pipes/Guards/Interceptors/Filters (validation, auth, logging/metrics, error handling)

### What “with Fastify” means
NestJS can run on different HTTP server adapters. Using Fastify means you run Nest on the `@nestjs/platform-fastify` adapter instead of the default Express adapter.

In practice:
- You keep Nest’s architecture and programming model.
- Your underlying HTTP engine is Fastify (routing/serialization/requests), which can improve throughput and resource usage.

## Why choose NestJS + Fastify

- **Structure at scale**: Helpful for projects that naturally grow into multiple domains (auth, patient data, ingestion, AI orchestration, integrations).
- **Performance**: Fastify is commonly faster and more memory-efficient than Express, especially under higher concurrency and JSON-heavy APIs.
- **Validation & serialization**: Fastify has strong JSON schema capabilities, which pairs well with DTO-based validation patterns.
- **Production-friendly ecosystem**: Solid plugin ecosystem for CORS, cookies, rate limiting, compression, etc. (Fastify plugins vs Express middleware).

### How Fastify is typically faster than Express (what changes under the hood)
- **Precompiled JSON serialization**: Fastify can use JSON Schema to compile fast serializers (often via `fast-json-stringify`), reducing CPU spent on response JSON. Express typically uses `res.json()` → `JSON.stringify` without precompiled schemas.
- **Lower per-request overhead**: Fastify’s lifecycle is designed to minimize work and allocations per request; Express middleware chains can add overhead as they “walk” the stack for each request.
- **Routing performance**: Fastify’s router is optimized for speed (commonly radix-tree style matching). Express routing is flexible but older and can do more work per match.
- **Validation built-in**: With schemas, Fastify validation can be compiled and tightly integrated. In Express, validation is usually added via extra middleware (more hops + more allocations).
- **Better tail latency under load**: Lower allocation rate can reduce GC pressure, which helps p95/p99 latency when concurrency increases.

> Note: If your endpoint is dominated by DB calls, AI calls, or PDF parsing, framework-level speed matters less. The main gain is usually higher throughput and more stable tail latency for JSON APIs.

## Tradeoffs

- **More abstraction**: Nest adds conventions and layers; for tiny APIs it can feel “heavy.”
- **Compatibility differences**: Some libraries assume Express middleware patterns. With Fastify you often prefer Fastify-native plugins.
- **Learning curve**: Teams need familiarity with Nest concepts (DI, modules, guards, pipes).

## Alternatives and when they fit better

### NestJS + Express
- **Pros**: Maximum compatibility with existing middleware and common examples/tutorials.
- **Cons**: Typically lower performance than Fastify under load.
- **Use when**: You rely on Express-specific middleware or want the most “plug-and-play” compatibility.

### Fastify (without Nest)
- **Pros**: Minimal abstraction, very fast, full control over architecture.
- **Cons**: You must design your own structure (DI, module boundaries, conventions, testing patterns).
- **Use when**: You want a lean codebase and your team is comfortable enforcing architecture without a framework.

### Express (without Nest)
- **Pros**: Simple, ubiquitous, lots of examples.
- **Cons**: Easy to become inconsistent as a project grows; architecture discipline is on the team.
- **Use when**: Small/medium APIs or prototyping where long-term structure is less critical.

### Koa / Hapi
- **Pros**: Solid frameworks with good design ideas.
- **Cons**: Less common today than Nest/Fastify/Express; smaller ecosystem mindshare.
- **Use when**: Team preference and existing codebase justify it.

### Serverless-first frameworks
- **Pros**: Great for spiky workloads and event-driven functions.
- **Cons**: Long-running processes (queues/orchestrators/schedulers) can be more complex depending on platform.
- **Use when**: Your deployment model is primarily serverless and your workload maps well to it.

## Quick recommendation for this project
For an AI medical agent backend (auth + patient data + PDF ingestion + daily recommendation orchestration + integrations), **NestJS + Fastify** is a strong default:
- Nest provides consistent architecture and testability for multi-domain systems.
- Fastify provides better performance characteristics for API traffic from PWA/mobile/widget clients.

## MongoDB (with Vector Search)

### What it is
MongoDB is a document database (JSON-like BSON documents). “Vector search” means MongoDB can also store **embedding vectors** (arrays of numbers) and run **similarity search** (nearest-neighbor search) to retrieve documents that are closest in meaning to a query.

This is commonly used for **RAG (Retrieval-Augmented Generation)**:
- **Retrieve** relevant context from your data via vector similarity
- **Generate** recommendations/answers with an LLM grounded in that retrieved context

### How it works (practical flow)
- **Ingest**: extract text (e.g., from PDFs), chunk it, compute embeddings for each chunk.
- **Store**: save chunks as MongoDB documents, including `text`, `metadata`, and `embedding: number[]`.
- **Index**: create a **vector index** on the embedding field.
- **Query**: embed the user query (or “daily check-in prompt”) and run vector search to get top-k most similar chunks.
- **Use**: pass those chunks into the LLM prompt to generate grounded, patient-relevant recommendations.

### Where it helps in this project
- **PDF ingestion**: retrieve the most relevant chunks from medical reports/prescriptions instead of stuffing entire documents into prompts.
- **External context injection**: store specialty knowledge (nutrition/cardiology/etc.) and retrieve only what’s relevant.
- **Better recommendations**: the LLM sees targeted, evidence-like snippets, improving relevance and reducing hallucination risk.

### Benefits vs a separate vector DB (early on)
- **Lower operational complexity**: one primary database for app data + embeddings/chunks.
- **Simple joins-by-metadata**: filter retrieval by `patientId`, `docType`, `source`, date range, etc.

### Tradeoffs / gotchas
- **Embedding cost & latency**: generating embeddings is an extra step with real cost.
- **Chunking strategy matters**: too small loses context; too big hurts retrieval precision.
- **Safety/accuracy**: vector retrieval improves context, but medical-ish recommendations still need strict prompting, guardrails, and “non-critical alert” constraints.

## Typical NestJS + Fastify project structure

This is a common layout that keeps domain logic separated from shared cross-cutting concerns and external integrations.

```text
medical-agent-backend/
  package.json
  tsconfig.json
  nest-cli.json

  src/
    main.ts                  # bootstrap; uses Fastify adapter; global pipes/filters
    app.module.ts            # root module that composes/imports feature modules

    config/
      config.module.ts       # config setup (env validation, typed config)
      configuration.ts       # config factory (db, ai, auth, etc.)

    common/
      decorators/            # e.g., @CurrentUser()
      filters/               # exception filters (consistent error responses)
      guards/                # auth/role guards
      interceptors/          # logging/metrics/response shaping
      pipes/                 # validation/transforms
      utils/                 # small shared utilities
      types/                 # shared types/interfaces
      constants.ts

    infra/
      database/              # Mongo connection/providers and DB setup
      ai/                    # OpenAI/Gemini clients + wrappers
      vector/                # embeddings + vector search helpers

    modules/
      auth/                  # login/register/refresh; JWT strategies; auth rules
      patients/              # patient CRUD, normalization, access rules
      documents/             # PDF upload/extract/chunk/embed pipeline
      recommendations/       # daily recommendation orchestration + endpoints

  test/                      # e2e/integration tests
  scripts/                   # seed/migrations/one-off tasks
```

### Structuring notes
- **`src/main.ts`**: Where you select Fastify (`@nestjs/platform-fastify`) and configure global validation + exception handling.
- **`modules/`**: Organize by domain/feature; each module owns its controller/service/DTOs and any persistence model it needs.
- **`common/`**: Shared building blocks that cut across domains (auth guards, validation pipes, interceptors, filters).
- **`infra/`**: External systems and vendor integrations; helps keep your domain modules independent from implementation details.

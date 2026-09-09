# Elasticware

### Real-Time AI Customer Support Platform

Elasticware is a multi-tenant customer support platform that combines an AI support agent with a real-time human dashboard and an embeddable customer chat widget.

The project was engineered around a difficult real-world requirement: **the customer-facing widget must work when embedded inside an arbitrary third-party website**, while keeping tenant data isolated and allowing human agents to take over conversations in real time.

**Live Demo:** [Elasticware](https://next-js-version-of-elasticware.vercel.app/)
**GitHub:** [Repository](https://github.com/Alexandredark-glitch/next-js-version-of-elasticware)

---

## Why Elasticware?

Most customer-support demos stop at a chat interface.

Elasticware goes further:

* AI answers customer questions using a tenant-specific knowledge base.
* Low-confidence or unanswered questions can be escalated to a human agent.
* Agents receive conversations in real time through a dedicated dashboard.
* The customer widget is framework-independent and distributed as a CDN script.
* Customer, agent, and server access use different authentication boundaries.
* PostgreSQL Row-Level Security isolates tenant data at the database layer.
* The same repository produces both the Next.js application and the standalone widget.

This makes Elasticware less of a CRUD dashboard and more of an end-to-end systems project.

---

## Core Features

### AI support with RAG

Customer messages are processed through a retrieval-augmented generation pipeline:

```text
Customer message
      ↓
Knowledge-base retrieval
      ↓
pgvector similarity search
      ↓
Relevant tenant documents
      ↓
Gemini generation
      ↓
AI response
```

The bot is designed to avoid confidently fabricating answers. When the knowledge base does not provide enough evidence, the conversation can remain available for human intervention.

### Real-time agent dashboard

Agents work from a dedicated support queue with:

* Open and resolved ticket views
* Real-time message updates
* Ticket selection and conversation history
* Optimistic ticket resolution
* Optimistic agent messaging
* Ticket deletion
* Knowledge Base administration
* Supabase authentication and authorization

The dashboard treats the database as the source of truth and uses Supabase Realtime primarily as an invalidation/synchronization signal.

### Embeddable CDN widget

The customer chat interface is distributed as a standalone JavaScript bundle:

```html
<script
  src="https://next-js-version-of-elasticware.vercel.app/widget.js"
  data-org-key="your-organization"
></script>
```

The widget:

* Runs independently of the host site's framework
* Uses Shadow DOM isolation for UI and style boundaries
* Creates anonymous customer sessions
* Authenticates with short-lived signed JWTs
* Communicates with the platform through public API endpoints
* Receives agent and ticket updates through Supabase Realtime
* Supports multiple conversations in the same browser session

The widget is built separately with Vite while remaining part of the same repository and deployment pipeline.

---

## Architecture

```text
                         ┌──────────────────────────┐
                         │      Third-party Site     │
                         │                          │
                         │   <script src="...">     │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │       widget.js           │
                         │                          │
                         │  Vanilla JS + Shadow DOM │
                         └────────────┬─────────────┘
                                      │
                     ┌────────────────┼────────────────┐
                     │                │                │
                     ▼                ▼                ▼
               /api/widget-auth   /api/tickets   /api/messages
                     │                │                │
                     └────────────────┼────────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │         Next.js           │
                         │                          │
                         │ Route Handlers           │
                         │ Server Actions            │
                         │ Auth / validation         │
                         └────────────┬─────────────┘
                                      │
                   ┌──────────────────┼──────────────────┐
                   │                  │                  │
                   ▼                  ▼                  ▼
              Supabase Auth       PostgreSQL         Gemini
                   │              + pgvector             │
                   │                  │                  │
                   │                  ▼                  │
                   │             RLS / Realtime          │
                   │                  │                  │
                   └──────────────────┼──────────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │    Agent Dashboard       │
                         │                          │
                         │ React + TanStack Query   │
                         └──────────────────────────┘
```

---

## Authentication model

Elasticware uses separate trust boundaries for different actors.

### Customer widget

Anonymous customers receive a short-lived signed JWT scoped to:

* customer session
* organization

The widget does not receive the Supabase service-role key.

### Agent dashboard

Agents authenticate through Supabase Auth using secure server-managed session cookies.

Protected dashboard operations pass through the application authentication boundary and organization membership checks.

### Trusted server operations

Server-side operations that require elevated database access use the Supabase service-role client from trusted server code only.

This separation keeps public widget access, authenticated agents, and privileged database operations from sharing the same trust model.

---

## Multi-tenancy and database security

Tenant isolation is enforced at the PostgreSQL layer using **Row-Level Security (RLS)**.

The application therefore does not rely solely on frontend filtering or route-level checks to prevent cross-tenant access.

Conceptually:

```text
Organization A
   ├── Tickets
   ├── Messages
   └── Knowledge Base

Organization B
   ├── Tickets
   ├── Messages
   └── Knowledge Base
```

Each tenant's data remains isolated through database policies.

---

## AI / RAG pipeline

Elasticware uses Gemini for generation and embeddings, with PostgreSQL + pgvector for semantic retrieval.

The general request path is:

```text
Customer
   ↓
Ticket / Message API
   ↓
RAG bot engine
   ↓
Embedding / semantic retrieval
   ↓
pgvector cosine similarity search
   ↓
Relevant KB context
   ↓
Gemini generation
   ↓
Persist response
   ↓
Supabase Realtime
   ↓
Customer widget + Agent dashboard
```

The architecture keeps retrieval and generation behind server-side boundaries rather than exposing AI credentials to the browser.

---

## Realtime model

Realtime synchronization follows a deliberately simple rule:

> **Database first. Realtime second.**

A database write is the source of truth.

Supabase Realtime then notifies connected clients, which update or invalidate their local query state.

For example:

```text
Agent resolves ticket
        ↓
PostgreSQL UPDATE
        ↓
Supabase Realtime event
        ↓
Widget receives "resolved"
        ↓
Conversation state is cleared
        ↓
Fresh conversation can create a new client/session lifecycle
```

This prevents Realtime events from becoming a second competing source of truth.

---

## Tech Stack

### Frontend

* React 19
* Next.js 16 App Router
* TypeScript
* Tailwind CSS v4
* TanStack Query


### Backend / Data

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Realtime
* Row-Level Security
* pgvector
* REST APIs
* JWT

### AI

* Google Gemini
* Retrieval-Augmented Generation (RAG)
* Embeddings
* Semantic similarity search

### Widget

* Vanilla JavaScript
* Shadow DOM
* Vite
* CDN distribution

### Observability & Testing

* Sentry
* Playwright

---

## Project structure

```text
elasticware/
├── app/
│   ├── login/
│   ├── signup/
│   ├── dashboard/
│   ├── sandbox/
│   ├── mock-shop/
│   └── api/
│       ├── widget-auth/
│       ├── tickets/
│       └── messages/
│
├── features/
│   ├── dashboard/
│   ├── kb-admin/
│   ├── chat-widget/
│   ├── mock-shop/
│   ├── sandbox/
│   └── error/
│
├── hooks/
│   ├── useSupabaseRealtime.ts
│   ├── useTickets.ts
│   ├── useTicketMessages.ts
│   ├── useWidgetSession.ts
│   └── useWidgetSupabase.ts
│
├── lib/
│   ├── supabase/
│   ├── bot/
│   ├── ai/
│   ├── db/
│   ├── services/
│   └── cors.ts
│
├── widget/
│   ├── entry.ts
│   └── styles.css
│
├── public/
│   └── widget.js
│
├── supabase/
│
├── playwright.config.ts
├── next.config.ts
├── vite.widget.config.ts
└── package.json
```


## Observability

Sentry is integrated across the Next.js runtime.

The project includes:

```text
sentry.client.config.ts
sentry.server.config.ts
sentry.edge.config.ts
instrumentation.ts
```

Explicitly handled exceptions can also be captured through:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.captureException(error);
```

Source maps are uploaded during production builds through the Sentry build integration.

---

## Security considerations

Elasticware deliberately keeps privileged credentials out of the client.

### Never exposes

```text
SUPABASE_SERVICE_ROLE_KEY
SENTRY_AUTH_TOKEN
GEMINI_API_KEY
```

### Public browser-safe configuration

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

The independent Vite widget also requires its own `VITE_*` build-time variables.

Additional protection includes:

* PostgreSQL Row-Level Security
* Zod request validation
* Separate customer and agent authentication models
* CORS handling for public widget endpoints
* API rate limiting
* Server-side AI execution
* Sentry error monitoring

---

## Deployment

The project is designed for deployment through Vercel with Git-based continuous deployment.

The production build command is:

```bash
npm run build
```

This is intentional because the build must produce both:

```text
Next.js application
+
public/widget.js
```

### Production architecture

```text
GitHub
   ↓
Vercel
   ↓
npm run build
   ├── Vite → public/widget.js
   └── Next.js → application
```

Production environment variables should be configured in Vercel rather than committed to the repository.

After deployment, the widget can be embedded from the production domain:

```html
<script
  src="https://next-js-version-of-elasticware.vercel.app/widget.js"
  data-org-key="your-org-slug"
></script>
```

---

## Engineering highlights

Elasticware was built around several problems that show up in real production systems rather than tutorial projects:

**Multi-tenancy:** tenant isolation is enforced at the PostgreSQL/RLS layer.

**Multiple trust boundaries:** anonymous customers, authenticated agents, and privileged server operations use different credentials and access patterns.

**AI reliability:** the RAG pipeline retrieves tenant-specific knowledge before generation and supports escalation when confidence is insufficient.

**Real-time synchronization:** database writes remain authoritative while Realtime provides synchronization signals.

**Framework-independent distribution:** the support widget is a standalone CDN artifact rather than a React component that assumes control over the host application.

**Build orchestration:** one repository produces both the Next.js application and the independently consumable widget.

**Production observability:** Sentry captures runtime failures and provides source-map-backed debugging.

**End-to-end verification:** Playwright covers the critical user and agent workflows.

---

## Roadmap

Potential future improvements include:

* Distributed rate limiting
* Agent presence and typing indicators
* Richer conversation analytics
* AI confidence scoring dashboards
* File / attachment support
* More granular organization and role management
* Automated CI test pipelines
* Expanded Playwright coverage for the third-party widget environment

---

## Author

**Hitantsoa Alexandre Fortunat**

Full-Stack Developer · AI Engineering (RAG / LLM Integration)

* GitHub: [Alexandredark-glitch](https://github.com/Alexandredark-glitch)
* Email: [fortunathitantsoa@gmail.com](mailto:fortunathitantsoa@gmail.com)
* Open to remote opportunities


## License

This project is provided for portfolio and demonstration purposes.



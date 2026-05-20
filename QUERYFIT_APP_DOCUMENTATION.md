
# QueryFit: Application Documentation

**Version:** 1.1.0  
**Stack:** React 19, TypeScript, Tailwind CSS  
**Theme:** Deep Amethyst (Dark Mode)

---

## 1. Executive Summary

**QueryFit** is a B2B SaaS platform designed for **AI Visibility Optimization (AIVO)**. 

As search behavior shifts from traditional search engines (Google, Bing) to Generative AI Answer Engines (ChatGPT, Perplexity, Claude), brands lose visibility into how they are perceived. QueryFit solves this by tracking, scoring, and optimizing brand mentions within Large Language Models (LLMs).

Unlike traditional SEO tools that track keywords and links, QueryFit tracks **Questions and Answers**, measuring the "Share of Voice" a brand possesses within AI-generated responses.

---

## 2. Core Concepts & Business Logic

### A. The Visibility Index (0–100)
The central metric of the platform. It aggregates performance across 5 AI engines.
*   **Mention Rate:** Does the brand appear in the answer?
*   **Citation Authority:** Does the AI provide a clickable citation/link?
*   **Sentiment:** Is the mention positive, neutral, or negative?
*   **Ranking:** For list-based answers (e.g., "Top 10 CRMs"), where does the brand sit?

### B. The Credit Economy
QueryFit operates on a consumption-based model.
*   **1 Scan = 5 Credits** (per engine).
*   **Managed Infrastructure:** Users pay credits to use QueryFit's pre-configured access to AI models, avoiding the need for their own API keys (unless using "Direct Mode").
*   **Auto-Refill:** Configurable triggers to purchase credits when balances run low.

### C. Workspace & Agency Model
*   **Workspaces:** Isolated environments for different companies or clients.
*   **Agency Tier:** Allows managing multiple workspaces, white-labeling reports, and accessing advanced tools like Heatmaps.

---

## 3. Feature Modules (The "What")

### 1. Mission Control (Dashboard)
**Goal:** Executive summary of AI performance and immediate workspace.
*   **Executive Hero:** Large proprietary **Visibility Index** display paired with a 7-day trend Area Chart.
*   **Tracked Questions List:** The central focus area. Displays top priority queries with "Competitive Gap" visualization (You vs. Market Leader).
*   **Action Context:** Sidebar widgets for "Next Best Actions" (Strategy Backlog) and "Top Rivals".
*   **ROI Correlation:** Dual-axis chart plotting Visibility Score against Organic Clicks (requires GSC connection).
*   **The Pulse:** Real-time activity feed showing competitor moves, score drops, and system alerts.

### 2. Tracked Questions (Monitoring)
**Goal:** Granular monitoring of specific high-intent queries.
*   **Multi-Engine Matrix:** Shows scores for specific engines (ChatGPT, Claude, Gemini, etc.) per query.
*   **Competitive Gap:** A visual progress bar comparing the user against the specific "Market Leader" for that question.
*   **Live Scanning:** Users can trigger ad-hoc scans using the "Zap" button (deducts credits).
*   **Drill-Down:** Clicking a row opens the **Query Detail View**, featuring historical charts, content audits, and rival analysis.

### 3. Opportunity Feed (Discovery)
**Goal:** Proactive market expansion.
*   **Surge Detection:** Identifies queries trending in AI usage logs that the user is *not* currently tracking.
*   **One-Click Capture:** Users can add these queries to their tracking list.
*   **ROI Forecast:** Estimates the visibility lift potential if these opportunities are captured.

### 4. Strategy Planner (Optimization)
**Goal:** Converting data into action.
*   **AI-Generated Tasks:** Specific instructions (e.g., "Add Schema Markup," "Get cited on G2").
*   **Kanban/List View:** Organizes tasks by status (Todo, In Progress, Optimized).
*   **Verification Loop:** When a task is marked "Done," the system prompts a re-scan to measure the impact on the Visibility Index.

### 5. Content Intelligence & Performance
**Goal:** On-page technical optimization.
*   **Content Audit:** Checks landing pages for semantic structure (H1, Meta) relevant to AI readability.
*   **Core Web Vitals:** Tracks LCP, INP, and CLS metrics (Mobile/Desktop) to ensure ranking eligibility.
*   **Trend Analysis:** Historical charts for speed metrics.

### 6. SEO Opportunity Heatmap (GSC Integration)
**Goal:** Identify organic search "Quick Wins."
*   **GSC Connection:** Direct integration with Google Search Console.
*   **Opportunity Classification:**
    *   **Low CTR:** High impressions, low clicks (needs Title/Meta fix).
    *   **Quick Win:** Ranking pos 4-15 (needs content boost).
    *   **Mismatch:** Wrong page ranking for intent.
    *   **Rising:** Momentum queries.

### 7. Traffic Proof (Results)
**Goal:** Prove ROI.
*   **Snapshot System:** Compares metrics (Clicks, Sessions) from a "Baseline" date (when a task started) vs "Latest" date.
*   **Attribution:** Links specific Strategy Tasks to specific lift in traffic.

### 8. Competitor Hub (Benchmarking)
**Goal:** Spy on rivals.
*   **Rival Discovery:** Suggests competitors based on shared semantic territory.
*   **Citation Leaderboard:** Shows which websites (e.g., TechCrunch, Reddit) are powering the competitor's AI visibility.
*   **Gap Analysis:** Identifies where a competitor is winning, and the user is invisible.

### 9. Heatmaps (Microsoft Clarity Integration)
**Goal:** User behavior analytics (Agency Tier).
*   **BYOK (Bring Your Own Key):** Integrates directly with the user's Microsoft Clarity project.
*   **Embed & Deep-Link:** Tries to embed heatmaps directly in the UI via iframe; provides smart fallbacks if CSP headers block embedding.

---

## 4. Technical Architecture (The "How")

### Frontend Stack
*   **Framework:** React 19 (Functional Components, Hooks).
*   **Language:** TypeScript (Strict typing for all entities).
*   **Styling:** Tailwind CSS v3 (Utility-first, Custom "Deep Amethyst" config).
*   **Icons:** `lucide-react`.
*   **Charts:** `recharts`.

### State Management
*   **Context API:** `WorkspaceContext.tsx` is the single source of truth. It manages the global state for Workspaces, Queries, Competitors, GSC Data, and Credits.
*   **Persistence:** State is persisted in memory via the `MockDataService`. In a real production build, this would connect to a REST/GraphQL API.

### Data Service Layer (`mockDataService.ts`)
*   **Simulation:** Mimics a backend by adding artificial latency (300-1500ms) to async operations.
*   **Logic:** Handles complex business logic like credit deduction, score calculation, and filtering locally.
*   **Factory Methods:** Generates realistic mock data (e.g., `generateBacklinks`) to populate the UI.

### Integration Patterns
*   **Engine Adapter:** (`services/engineAdapter.ts`) The interface for communicating with AI models. It abstracts the differences between calling OpenAI, Anthropic, or Google APIs.
*   **GSC Client:** (`services/gscClient.ts`) Abstraction for Google Search Console API.
*   **Deep Links:** (`services/ClarityDeepLinks.ts`, `GscDeepLinks.ts`) Helper classes for generating external URLs for third-party tools.

---

## 5. UI/UX Design System

### Color Palette
*   **Primary:** Indigo/Violet (`#8b5cf6`, `#a78bfa`) - Represents Intelligence/AI.
*   **Background:** Deep Black/Zinc (`#0a0a0a`, `#18181b`) - Reduces eye strain, premium feel.
*   **Functional Colors:**
    *   **Emerald:** Growth, Success, Optimization.
    *   **Rose:** Alert, Drop, Danger.
    *   **Amber:** Warning, Opportunity, Credits.

### Signature Components
*   **Scoring Ring:** A custom SVG component used to visualize the 0-100 Visibility Index.
*   **InfoTooltip:** Custom, high-z-index tooltips providing context for technical terms.
*   **Glassmorphism:** Extensive use of `backdrop-blur-md` and `bg-opacity` to create depth.

---

## 6. Directory Structure

```text
/
├── components/           # Reusable UI elements (Modals, Charts, Inputs)
│   ├── ScoringRing.tsx   # Core visualization
│   ├── Sidebar.tsx       # Main navigation
│   ├── CoreWebVitalsStrip.tsx
│   └── ...
├── context/              # Global State
│   └── WorkspaceContext.tsx
├── pages/                # Main Application Views
│   ├── Overview.tsx      # Dashboard
│   ├── Queries.tsx       # Tracked Questions Table
│   ├── Strategy.tsx      # Task Board
│   ├── SeoOpportunityHeatmapPage.tsx # GSC Integration
│   ├── PerformancePage.tsx # Core Web Vitals
│   ├── Results.tsx       # Traffic Proof
│   └── ...
├── services/             # Business Logic
│   ├── mockDataService.ts # Data layer simulation
│   ├── engineAdapter.ts   # AI scanning logic
│   ├── seoOpportunityEngine.ts # GSC Logic
│   └── ...
├── types.ts              # Canonical TypeScript interfaces
├── clarityTypes.ts       # Specific types for Clarity integration
├── gscTypes.ts           # Specific types for GSC integration
├── App.tsx               # Main entry & Routing
├── index.html            # Tailwind config & Global styles
└── index.tsx             # React Mount point
```


# QueryFit: AI Visibility Optimizer - System Documentation

## 1. Executive Summary
**QueryFit** is a production-ready SaaS platform designed for the "AI-First" era of search. Unlike traditional SEO tools that focus on domain authority or keyword rankings in SERPs, QueryFit measures **Visibility & Share of Voice** within AI Answer Engines (ChatGPT, Claude, Gemini, Perplexity, and Copilot).

## 2. Core Philosophy
- **Query-Centric, Not Domain-Centric:** Scores are calculated based on how specific brand properties are mentioned or cited in response to specific user prompts (queries).
- **Non-Technical Accessibility:** Designed for marketers and business owners. Technical metrics are translated into "Plain English" tasks and visual "Scoring Rings."
- **Visibility Index:** A proprietary 0–100 score aggregating mention frequency, citation presence, and sentiment across all supported AI engines.

## 3. Technical Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS.
- **Visualizations:** Recharts (Area, Line, Bar charts), Custom SVG Scoring Rings.
- **Icons:** Lucide-React.
- **State Management:** React Context API (`WorkspaceContext`) for global state, local state for UI transitions.
- **Mocking Layer:** `mockDataService.ts` simulates a high-performance backend with credit-based consumption logic.

## 4. Architecture & Data Model

### A. Key Entities
- **Workspaces:** The root container (Agency-ready). Tracks industry, timezone, and credit balance.
- **Queries:** The primary unit of tracking. Includes `Market` (Region/Language), `Priority`, and `Engine Scores`.
- **Competitors:** Tracked entities used to calculate relative "Market Standing" and "Share of Voice."
- **Tasks (Action Plan):** AI-generated optimization steps (e.g., "Add a comparison table to your vs-page").
- **Engines:** Supports `ChatGPT`, `Claude`, `Gemini`, `Perplexity`, and `Copilot`.

### B. Engine Adapter Pattern
The system uses an `EngineAdapter` interface located in `services/engineAdapter.ts`.
- **Managed Mode:** Uses platform infrastructure; costs credits.
- **Direct Mode:** Users "Bring Your Own API Key" (BYOAK).
- **Proxy Support:** Handles engines without public APIs via SERP proxies.

## 5. UI/UX Implementation
- **Dark-First Design:** Default theme is a custom "Deep Amethyst" dark mode (`bg-[#0a0a0a]` to `bg-[#1a1c2e]`).
- **Sidebar Navigation:** Persistent left sidebar with workspace switcher and credit HUD.
- **Scoring Rings:** The signature UI element. A large primary ring shows the Overall Index, with nested/segmented inner rings showing individual engine performance.
- **Help System:** Reusable `InfoTooltip` component with high z-index and non-shouting (sentence case) descriptions to guide non-technical users.
- **Full-Width Layout:** No centered containers; the app utilizes the 12-column grid to maximize data visibility.

## 6. Key Workflows
1. **Onboarding:** User adds a domain, industry, and initial "Seed Queries."
2. **Scanning:** A scan triggers the `EngineConnector`. Credits are deducted. Data is synthesized into the `ScanResult` table.
3. **Analysis:** The "Overview" dashboard highlights "Winners & Losers" and "Market Standing."
4. **Optimization:** The "Strategy Planner" (Kanban or List view) presents AI-generated tasks to close the gap between the user and the top competitor.
5. **Reporting:** Automated PDF and Email digests provide stakeholders with visibility deltas.

## 7. Business Logic & Scoring
- **Scoring Formula (v1):** `(Mention (0/1) * 40) + (Citation (0/1) * 40) + (Top 3 Position * 20)`. 
- **Sentiment:** Simple classifier (Positive/Neutral/Negative) derived from answer text analysis.
- **Volatility:** Calculated based on the variance of scores over the last 7 days.
- **Opportunity Score:** Calculated based on queries where a competitor is cited but the user is only mentioned (or missing).

## 8. Pricing & Gating
- **Starter ($99):** 1 Workspace, 50 queries, 2 engines.
- **Pro ($249):** 5 Workspaces, 200 queries, all engines, 5 seats.
- **Agency ($499):** Unlimited workspaces, White-labeling, API Access, BYOAK mode.

## 9. File Directory Map
- `/components`: Reusable UI elements (`ScoringRing`, `InfoTooltip`, `Sidebar`).
- `/pages`: Primary views (`Overview`, `Queries`, `Strategy`, `Billing`, `Competitors`).
- `/services`: Business logic (`mockDataService.ts`, `engineAdapter.ts`).
- `/context`: Global state management (`WorkspaceContext.tsx`).
- `/types.ts`: Canonical TypeScript interfaces for the entire system.
- `index.html`: Global CSS variables, fonts, and theme definitions.

## 10. AI Analysis Prompt Suggestion
*To analyze this app in depth, provide this file and ask:*
> "Analyze this architecture for a SaaS called QueryFit. Identify potential scaling bottlenecks in the Engine Adapter pattern, suggest 3 more advanced 'AI Visibility' metrics based on the current data model, and review the UI/UX consistency for a non-technical marketing persona."

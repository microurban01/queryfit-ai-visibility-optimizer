# QueryFit: Comprehensive Platform Blueprint

## 1. Platform Vision
**QueryFit** is the definitive "AI-First" Visibility Management Platform. As user behavior shifts from traditional search engines (Google, Bing) to generative AI platforms (ChatGPT, Gemini, Perplexity), brands are facing a massive data gap. QueryFit closes this gap by providing real-time tracking, benchmarking, and optimization tools for the age of generative search.

---

## 2. Core Metrics: The Visibility Index
At the heart of the platform is the **Visibility Index**, a proprietary 0–100 score that quantifies brand authority within AI models.

### A. Component Weights
- **Mention Rate (40%):** How frequently the brand appears in long-form AI responses for high-intent queries.
- **Citation Trust (40%):** The presence of direct web links (proof) provided by the AI as source material.
- **Sentiment & Tone (10%):** Whether the AI describes the brand as "highly recommended," "reliable," or "expensive."
- **Positioning (10%):** The rank order of the brand when compared to competitors in list-based answers.

---

## 3. Strategic Modules

### 1. Unified Overview (The Control Room)
The `Overview` page provides an executive summary of the brand's standing.
- **Momentum Charts:** Historical area charts tracking the Visibility Index over time.
- **Market Standing:** A relative share-of-voice bar chart comparing "You" against top industry rivals.
- **Live Snapshot:** A real-time log of a sample AI answer, showing exactly how the brand is being described *today*.

### 2. Global Question Monitoring
The `Tracked Queries` page is the engine room where users manage specific high-intent search patterns.
- **Localization Mapping:** Tracking visibility across different regions (US, UK, DE, etc.) and languages.
- **Competitive Gaps:** A dual-progress bar system that highlights "Trailing" or "Leading" status versus a specific rival leader for every query.
- **Intelligence Scans:** A granular "Zap" system to trigger manual data refreshes using the Global Infrastructure.

### 3. Strategy Planner (Optimization)
The `Strategy` page transforms raw AI data into a Kanban-style roadmap of fixes.
- **Action Plans:** Step-by-step instructions (e.g., "Add FAQ Schema," "Update Vs-Page Comparison Table").
- **Impact vs. Effort:** AI-assigned tags that help marketers prioritize "Quick Wins" over high-effort content overhauls.
- **Verification Loop:** Once a task is marked "Optimized," the system prompts a re-scan to verify if the Visibility Index increased.

### 4. Opportunity Feed (Discovery)
The `Suggested` page is a proactive research engine that identifies emerging trends.
- **Discovery Engine:** Scans LLM mention logs to find high-growth queries the user isn't yet tracking.
- **Surge Patterns:** Highlights queries with a week-over-week popularity increase (e.g., "+22% Surge").
- **Capture Logic:** One-click conversion from "Suggested" to "Tracked" query.

### 5. Rival Intelligence Hub
The `Competitor Hub` allows for deep-dive analysis of competitors.
- **Citation Leaderboards:** Identifies the exact domains (TechCrunch, G2, Reddit) that AI models trust most for a specific niche.
- **Growth Comparison:** Line charts overlaying the user's growth against a rival's trajectory.

---

## 4. Technical Infrastructure

### A. Engine Adapters
QueryFit handles connections to the "Big 5" AI models through a flexible adapter pattern:
- **ChatGPT (OpenAI)**
- **Claude (Anthropic)**
- **Gemini (Google)**
- **Perplexity (Search AI)**
- **Copilot (Microsoft/Bing)**

### B. Connection Modes
1. **Managed Mode (Standard):** Uses QueryFit's global mesh infrastructure. Bypasses the need for individual API keys and handles all rate-limiting and formatting.
2. **Direct Mode (BYOAK):** Enterprise users can "Bring Their Own API Key" to waive platform credit fees and use their own quotas.

---

## 5. UI/UX Design Language
- **Amethyst Aesthetic:** A palette of Deep Amethyst (`#a78bfa`), Emerald Green for growth, and Carbon Black for a premium SaaS feel.
- **Glow & Glass:** Extensive use of `backdrop-blur`, `shadow-glow`, and radial gradients (`bg-aurora`) to emphasize the "Intelligence" and "Modernity" of the platform.
- **Accessibility:** High-contrast text, clear `InfoTooltip` components for non-technical users, and a responsive layout that adapts to large-screen data density.

---

## 6. SaaS Model & Credit Logic
- **Subscription Tiers:** Starter, Pro, and Agency levels gate features like workspace count, scan frequency, and white-labeling.
- **Consumption:** Every engine scan for a specific query costs **5 credits**. 
- **Auto-Refill:** A safety mechanism to ensure automated scanning never stops when credit balances run low.

---

## 7. Developer's Guide to Files
- `types.ts`: The source of truth for all data structures.
- `WorkspaceContext.tsx`: Manages the global platform state and user actions.
- `mockDataService.ts`: Simulates high-performance backend logic for the frontend environment.
- `engineAdapter.ts`: Defines the scanning logic for various AI models.

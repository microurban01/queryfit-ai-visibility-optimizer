
# Tracked Questions: AI Visibility Monitoring

## 1. Page Overview
The **Tracked Questions** page (implemented in `pages/Queries.tsx`) is the tactical engine room of QueryFit. It provides a granular, high-density interface for monitoring specific high-intent search queries. Unlike traditional SEO rank trackers, this view focuses on **Share of Voice**, **Competitive Gaps**, and **Citation Authority** within Generative AI responses.

## 2. Core Features & Architecture

### A. Intelligence Scan System
*   **Global Scan ("Scan All"):** A master action that triggers a fresh analysis for every active query in the workspace.
*   **Granular Refresh:** Individual "Zap" actions (lightning icon) per row allow users to update specific high-priority questions without draining credits on the entire list.
*   **Cost Transparency:** Integrated with `CreditConfirmationModal` to calculate and display the exact credit cost (typically 5 credits × Active Engines) before execution.

### B. The Visibility Matrix (Data Table)
The table is designed for rapid skimming and prioritization, utilizing the "Deep Amethyst" design language to highlight outliers.

#### 1. Market & Context
*   **Localization:** Displays the region flag (e.g., 🇺🇸) and language code (e.g., EN) to ensure context.
*   **Priority Badges:** Color-coded tags (`High` = Rose, `Medium` = Amber) help teams triage optimization efforts.
*   **Engine Coverage:** A series of color-coded dots representing the health/presence of the brand across the 5 major engines (ChatGPT, Claude, Gemini, Perplexity, Copilot).

#### 2. Competitive Gap Analysis
This column is the primary driver of action.
*   **Rival Benchmarking:** Automatically compares the user's score against the specific "Market Leader" for that query.
*   **Visual Bar:** A dual-layer progress bar. The background represents the Leader's score, and the foreground (colored) represents the User's score.
*   **Status Indicators:**
    *   **Trailing (Rose):** "Trailing by 15%" – Signals an urgent need for optimization.
    *   **Leading (Accent/Teal):** "Leading by 10%" – Signals dominance to be defended.

#### 3. Citation Authority
*   **Score:** Displays the count of verified links (citations) found in AI responses.
*   **Interactive Leaderboard:** Clicking this cell opens the `CitationLeaderboardModal`, revealing exactly which domains (e.g., G2, TechCrunch) are citing the market leader, providing a clear "Link Building" target list.

#### 4. Action Engine
*   **"Fix Next":** A calculated recommendation button that routes the user to the `QueryDetail` view with a specific focus (e.g., "High Impact" or "15 min Effort").
*   **Reasoning:** Displays the AI's summary of *why* the score is low (e.g., "Competitor mentioned for pricing, you are absent").

### C. Smart Filtering
Located above the table, the filter bar allows for rapid segmenting:
*   **Losing:** Filters for queries where `User Score < Leader Score`.
*   **No Citations:** Identifies queries where the brand is mentioned but not linked (high risk of hallucination).
*   **Errors:** Highlights rows where engine API connections failed.
*   **Unstable:** Shows queries with high volatility in the last 7 days.

## 3. User Experience (UX) Strategy

### A. Progressive Disclosure
*   **Tooltips:** Extensive use of `InfoTooltip` on column headers to explain complex AI metrics to non-technical users.
*   **Drill-Down:** Clicking any row navigates to `QueryDetail.tsx`, offering deep diagnostics, historical charts, and content audits.

### B. Visual Hierarchy
*   **Scoring Rings:** The "Performance" column uses the signature SVG `ScoringRing` component to provide an at-a-glance 0-100 health check.
*   **Glassmorphism:** The interface uses semi-transparent backgrounds (`bg-muted/20`) and subtle borders to maintain a lightweight, modern feel despite the data density.

## 4. Technical Implementation
*   **Component:** `pages/Queries.tsx`
*   **State Management:** Local state handles search filtering and selection; Global `WorkspaceContext` provides the raw `Query[]` data.
*   **Mock Integration:** Interactions with the scan system trigger `mockService.deductCredits` to simulate the SaaS consumption model.

## 5. Strategic Goal
The specific goal of this page is to move the user from **Passive Monitoring** to **Active Defense**. By visualizing the "Gap" between the user and their rival, the UI creates a psychological urge to "Close the Gap" via the Strategy Planner.

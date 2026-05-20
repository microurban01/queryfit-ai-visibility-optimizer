
# GSC AI Recommendations & Experiments - Feature Documentation

## 1. Executive Summary
The **AI Recommendations & Experiments** module is the "Action Layer" built on top of the SEO Opportunity Heatmap. While the Heatmap identifies *where* problems exist (Low CTR, Mismatched Intent), this new module determines *what to do* about them and provides a scientific framework to measure the impact of those changes.

## 2. Core Workflows

### A. Recommendation Engine (Deterministic Logic)
The system uses a rule-based engine (`GscRecommendationEngine.ts`) to convert raw GSC opportunities into structured recommendations. This ensures trust by relying on hard data first, rather than hallucinating issues.

| Trigger Type | Logic | Recommended Action Category |
| :--- | :--- | :--- |
| **LOW_CTR** | High Impressions + Good Rank + Low CTR | **Title & Meta Optimization** (Focus on CRO) |
| **QUICK_WIN** | Position 4–15 | **Content Update** (Add depth, internal links) |
| **RISING** | High Velocity / High CTR for Pos | **Content Expansion** (Create dedicated sub-page) |
| **MISMATCH** | Target URL ≠ Actual Ranking URL | **Intent Match** (Canonical/De-optimize) |

### B. AI Variant Generation
Users can interact with specific recommendations to generate creative assets using the `GscVariantGenModal`.
*   **Input:** Current Query, Current Page, Opportunity Context.
*   **Output:** 3 distinct Title/Meta variations with specific rationales (e.g., "Focus on emotional hook," "Focus on clarity").
*   *Note:* Currently simulated in `mockDataService` with a 1.5s latency.

### C. Experiment Tracker (The Scientific Loop)
Once a user applies a change (e.g., updates a Title Tag), they "Deploy" it to an Experiment.
1.  **Baseline:** The system snapshots the GSC metrics (Clicks, CTR, Pos) at the moment of deployment.
2.  **Monitoring:** The experiment enters a `measuring` state.
3.  **Result:** After the window (7/14/28 days), current metrics are compared to the baseline to declare a "Winner" or "No Change."

## 3. Technical Architecture

### Data Models (`types/gscRecommendationsTypes.ts`)
*   `AiRecommendation`: The actionable object containing priority, estimated impact, and step-by-step instructions.
*   `SeoExperiment`: The tracking object linking a specific recommendation to a specific query and variant, storing `baselineMetrics` and `currentMetrics`.
*   `GscTrigger`: The distinct data event (e.g., "CTR is 2% below baseline") that spawned the recommendation.

### UI Components
*   **`GscRecommendationsPage`**: A card-based feed of open opportunities, filterable by Priority.
*   **`GscRecommendationCard`**: Displays the "Why," the "What," and the "Estimated Impact" with distinct visual badges.
*   **`GscVariantGenModal`**: A specialized modal for AI content generation and selection.
*   **`GscExperimentsPage`**: A dashboard showing active tests and their live performance delta (e.g., "+1.5% CTR").

### Integration Points
*   **Strategy Planner**: Users can click "Create Task" on a recommendation to push it directly into the main Kanban board (`Strategy.tsx`).
*   **Workspace Context**: New actions (`deployExperiment`, `dismissRecommendation`) added to the global state.

## 4. User Experience (UX) Philosophy
*   **"Do This Next":** The interface hides the complexity of GSC data tables, presenting simple cards with clear instructions.
*   **Trust But Verify:** Every recommendation shows the "Proof" (metric data) that triggered it.
*   **Impact Quantification:** We estimate potential click lift (e.g., "+50-150 Clicks") to help users prioritize high-value tasks.

## 5. Future Roadmap
*   **Real AI Integration:** Connect `generateTitleMetaVariants` to the real `EngineAdapter` (OpenAI/Gemini).
*   **Automated Verification:** A cron job to automatically check experiments after 14 days and update their status.
*   **SERP Preview:** A visual component showing how the new Title/Meta will look in Google Search results.

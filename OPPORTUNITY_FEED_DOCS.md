
# Opportunity Feed: AI Discovery & Market Expansion

## 1. Executive Summary
The **Opportunity Feed** (implemented in `pages/Suggested.tsx`) is the proactive growth engine of QueryFit. While the "Tracked Questions" page focuses on defending existing territory, this module focuses on **Market Expansion**. It identifies high-intent questions that are trending across AI engines (ChatGPT, Claude, Gemini) but are not yet being tracked by the user.

## 2. Core Philosophy: "Search Pattern Detection"
Unlike traditional SEO tools that rely on keyword volume, QueryFit’s Opportunity Feed simulates **LLM Log Analysis**. It identifies:
1.  **Surge Patterns:** Questions receiving a sudden spike in frequency within AI prompts.
2.  **Competitor Dominance:** Queries where a rival is consistently cited, but the user is absent.
3.  **Documentation Gaps:** Technical questions where AI models are "hallucinating" or struggling to find a definitive source.

## 3. Key Features

### A. The Opportunity Stream (Left Panel)
A scrollable feed of `SuggestedQuery` cards.
*   **Surge Badges:** Visual indicators (e.g., `+22% Surge`) highlighting velocity.
*   **Tags:** Semantic categorization (e.g., "Integration," "Pricing," "Comparison").
*   **Quick ROI Metrics:**
    *   **ROI Potential:** Estimated visibility lift (Green).
    *   **Rival Gap:** The deficit compared to the current market leader (Rose).

### B. Deep Intelligence Panel (Right Panel)
Clicking a card opens a detailed analysis pane (`w-[500px] slide-in`).
*   **Competitive Standing:** A specific breakdown of *who* is currently winning this query and *why* (e.g., "Models prioritize this competitor's documentation").
*   **Strategy to Win:** A generated checklist of requirements to rank (e.g., "Schema Data Alignment," "Technical Citation Push").
*   **AI ROI Forecast:** A narrative explanation of the traffic potential (e.g., "24k monthly AI-led searches").

### C. Capture Workflow
*   **One-Click Track:** The primary call-to-action ("Capture Opportunity").
*   **Credit Consumption:** Tracking a new opportunity triggers an immediate baseline scan, consuming **5 Credits**.
*   **Feedback Loop:** Successful tracking moves the query to the `Queries.tsx` dashboard and triggers a toast notification.

## 4. UI/UX Design Language
*   **Sparkles & Indigo:** Uses the `Sparkles` icon and indigo/violet gradients to signify "AI Intelligence" and "New Discovery," differentiating it from the standard monitoring views.
*   **Glassmorphism:** The feed sits on a semi-transparent background (`bg-background/50`) with backdrop blurs to emphasize depth.
*   **Empty States:** A specific "Ghost" state (`Ghost` icon) appears when the feed is empty, reassuring the user they are up-to-date.

## 5. Technical Implementation

### Components
*   **`pages/Suggested.tsx`**: The main container handling the split-view layout.
*   **`components/CreditConfirmationModal.tsx`**: Intercepts the "Track" action to verify credit spend.
*   **`mockDataService.ts`**: Generates the `suggestedQueries` array with realistic "reasoning" text.

### Data Model
*   **`SuggestedQuery`**: Extends the base `Query` interface.
    *   `surge`: number (Percentage growth).
    *   `reason`: string (AI-generated explanation).
    *   `leaderScore`: number (Benchmark score of the current winner).

## 6. Strategic Value
For **Agency** users, this page is a critical retention tool. It provides a constant stream of "New Work" to pitch to clients ("We found 5 new high-growth questions your competitors are winning; let's target them").

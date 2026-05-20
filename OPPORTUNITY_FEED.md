# Opportunity Feed: AI Discovery & Market Expansion

## 1. Executive Summary
The **Opportunity Feed** (implemented in `Suggested.tsx`) is QueryFit's proactive discovery engine. While the "Tracked Questions" page focuses on maintaining and defending existing visibility, the Opportunity Feed is designed for **Market Expansion**. It identifies high-intent questions that are trending across AI engines (ChatGPT, Claude, etc.) but are not yet part of the user's tracking perimeter.

## 2. The "Intelligence" Layer
The feed isn't just a list of keywords; it is a synthesized stream of "Search Patterns" detected by our mock backend (`mockDataService.ts`). Each suggestion includes three critical data points:
*   **Surge Volume:** A percentage indicating how quickly a specific question is growing in popularity among AI users.
*   **Competitor Dominance:** Identifies if rivals are currently being mentioned for this query while the user is absent.
*   **Strategic Gap:** Highlights a "Documentation Mismatch"—where AI models are looking for specific info (like "Slack Integration") that the user has but hasn't optimized for AI indexing.

## 3. Core Features

### A. Opportunity Intelligence Cards
Each card is a high-fidelity container that provides the "Why" behind the suggestion:
*   **Growth Badges:** Labeled as "+22% Surge" or "High Growth" to create urgency.
*   **Pattern Detection:** Icons like `Search` and `Bot` signify that this query was harvested from real AI response logs, not just traditional SEO search volume.
*   **Analyst Insight:** A human-readable summary (e.g., *"Rivals currently dominate mentions, but lack direct documentation links"*) that explains the specific tactical advantage of tracking this query.

### B. Tracking Workflow
*   **One-Click Track:** Clicking "Start Tracking Query" moves the item from the Suggested pool into the active `Queries` table. This immediately triggers a fresh scan (deducting credits) to establish a baseline score.
*   **Dismissal:** Users can clear the feed of irrelevant suggestions, allowing the AI to re-calibrate its discovery algorithm based on their preferences.
*   **Empty State:** When all opportunities are cleared, a "Feed is up to date" ghost state appears, reassuring the user that they are currently at the "Edge" of their market's AI visibility.

### C. Market Reach Potential
Located at the bottom of the feed, this analytics component provides an ROI forecast. It estimates the cumulative impact on **Global AI Awareness** if the user successfully optimizes for the suggested queries (e.g., *"Increase global AI awareness by 14.5% this quarter"*).

## 4. UI/UX Implementation
*   **Visual Language:** Utilizes the `Sparkles` icon as a primary visual anchor for "AI-generated" content.
*   **Glassmorphism:** Insights are housed in cards with `bg-muted/50` and `backdrop-blur` to differentiate "Research Data" from "Actionable Buttons."
*   **Premium Aesthetic:** Uses indigo and amethyst gradients to signify "Growth" and "Intelligence," contrasting with the rose-themed "Alerts" or the green "Optimized" states.

## 5. Strategic Business Value
For **Agency-tier** users, this page is the primary source of "Client Growth Reports." Agencies use these suggestions to prove to their clients that new search patterns are emerging and that proactive content creation is required to maintain a first-mover advantage.

## 6. Technical Directory
*   **Component:** `pages/Suggested.tsx`
*   **Data Structure:** `SuggestedQuery` (extending `Query` in `types.ts`)
*   **State Hook:** `useWorkspace()` for `trackSuggestedQuery` and `dismissSuggestedQuery` actions.
*   **Logic:** Filtered by `QueryStatus.SUGGESTED`.

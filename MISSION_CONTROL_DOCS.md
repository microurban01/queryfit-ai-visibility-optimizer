
# Mission Control: The Command Center

## 1. Executive Summary
**Mission Control** (`pages/Overview.tsx`) is the landing dashboard for QueryFit. It is designed to answer three critical questions for the user within 5 seconds of logging in:
1.  **"Am I winning or losing today?"** (Visibility Index & Trend)
2.  **"Are there any immediate threats?"** (Scan-Based Risk Monitor)
3.  **"What should I do next?"** (Action Widgets)

## 2. Core Modules

### A. The Executive Hero
Located at the top, this section provides the high-level health metrics.
*   **Visibility Index:** The aggregate score (0-100) across all tracked queries and engines.
*   **Trend Chart:** A 7, 28, or 90-day area chart visualizing momentum.
*   **Market Leader Gap:** Automatically calculates the distance between the User and the #1 Rival.
*   **Experience Signals:** Integrates Core Web Vitals (LCP, CLS, INP) directly into the dashboard to show technical health alongside visibility.

### B. Scan-Based Risk Monitor (New)
The **Scan-Based Risk Monitor** (`components/missionControl/GeoAlertsSection.tsx`) surfaces issues **detected in the latest scan** and **changes since the previous scan**. These alerts are scan-based (not real-time) and include confidence + evidence to reduce noise.

| Alert Type | Trigger Condition | Confidence Logic |
| :--- | :--- | :--- |
| **Tone Shift Detected** | AI tone shifts from 'Positive' to 'Negative' (or clearly worse). | High only if confirmed in 2 consecutive scans OR 2+ engines. |
| **Possible Misinformation** | Current scan output conflicts with known facts. | Always "Needs verification" until user confirms. |
| **Citation Change** | A domain present in previous citations is missing in current citations. | Mark "Lost" only if missing in 2 consecutive scans. |
| **Access/Crawl Issue** | Engine returns 403/401/timeout OR robots prevent access. | Always include concrete evidence (e.g., HTTP status). |
| **Competitor Gained** | Leader score increased while your score decreased. | Only show when supported by measured scores. |

**Display Rules**
- Show max **5** alerts on Mission Control (highest severity first).
- Provide "View all alerts" to see the full list if > 5.
- Each alert shows: confidence badge + short evidence snippet + timestamp + "Review" action.

### C. Intelligence Widgets
The dashboard utilizes a modular 12-column grid layout with specialized widgets:

#### 1. Tracked Questions (`TrackedQuestionsWidget`)
*   **Purpose:** Monitors high-priority queries.
*   **Visual:** Displays a dual-progress bar (You vs. Leader) for immediate gap analysis.
*   **Action:** Click-through to Query Detail for deep diagnostics.

#### 2. Top Movers (`TopMoversWidget`)
*   **Purpose:** Highlights volatility.
*   **Tabs:** Toggle between "Top Gains" and "Top Drops" to identify weekly winners and losers.

#### 3. Query Discovery (`OpportunitiesWidget`)
*   **Purpose:** Proactive market expansion.
*   **Logic:** Displays high-velocity queries where the user is currently invisible but competitors **appear in AI answers** (mentioned/cited).
*   **Visual:** Cards highlighting "Surge" percentage and "Rival Gap."
*   **Action:** Direct link to the full Query Discovery feed.

#### 4. Next Best Actions (`NextBestActionsWidget`)
*   **Purpose:** Operationalize the strategy.
*   **Logic:** Surfaces "High Impact" or "Quick Win" tasks from the Strategy Planner.
*   **Sorting:** Prioritizes tasks that yield the highest visibility lift with the lowest effort.

#### 5. Top Rivals (`TopRivalsWidget`)
*   **Purpose:** Competitive benchmarking.
*   **Modes:**
    *   *Global Leaders:* Aggregates mentions from all queries to find who *actually* dominates the market (even if you aren't tracking them).
    *   *My Rivals:* Shows performance of manually added competitors.
*   **Interaction:** Scrollable list with "See All" navigation to the Competitor Hub.

#### 6. The Pulse (`PulseFeed`)
*   **Purpose:** Scan activity log (not real-time).
*   **Events:** Tracks scan completions, credit usage, score changes, engine errors, and new opportunity detections.

## 3. User Interactions
*   **Time Travel:** Users can toggle between 7D, 28D, and 90D views to analyze trends.
*   **Manual Scan:** The "Scan Workspace" button triggers a fresh data fetch for all queries, consuming credits. This action immediately refreshes the Risk Monitor if new issues are found.
*   **Quick Add:** The "Add Question" button allows for rapid expansion of the tracking perimeter without leaving the dashboard.

## 4. Technical Implementation
*   **File:** `pages/Overview.tsx`
*   **Components:** Located in `components/missionControl/` folder.
*   **Data Source:** 
    *   Aggregates data from `queries`, `tasks`, `competitors`, `suggestedQueries`, and `metrics` provided by `WorkspaceContext`.
    *   **Dynamic Alerts:** Fetches `GeoAlert[]` via `mockService.getGeoAlerts()` inside `useEffect`, ensuring alerts are responsive to the latest query states.


# Content Intelligence & Performance - Feature Documentation

## 1. Executive Summary
**Content Intelligence** is the "On-Page" counterpart to QueryFit's "Off-Page" visibility tracking. While the main dashboard tracks *external* AI mentions, this module analyzes the *target landing page* to ensure it is technically capable of ranking.

It combines two critical data streams:
1.  **Semantic Structure Audit:** Checks if the content is formatted for AI readability (Headers, Meta tags, Keyword density).
2.  **Core Web Vitals (CWV):** Measures real-world user experience metrics (Speed, Responsiveness, Stability), which are confirmed ranking factors.

## 2. Core Components

### A. The Audit Engine
Located primarily in `pages/QueryDetail.tsx` (and visualized in `components/ContentAuditModal.tsx`), this engine runs a checklist against the specific URL associated with a tracked query.

**Key Checks:**
*   **Relevance:** Keyword presence in Title, H1, and Body.
*   **Structure:** Proper Header hierarchy (H1 -> H2 -> H3) and Meta Description length.
*   **Technical:** Canonical tags, Image Alt text, and Schema markup presence.

**Scoring:**
The "Content Intelligence Score" (0–100) is a weighted average of passing audit checks. A score below 80 generally triggers a "High Priority" optimization task.

### B. Core Web Vitals (Performance)
*Recently upgraded to match Google's CrUX standards.*

The performance widget (`components/CoreWebVitalsStrip.tsx`) replaces generic "Speed Scores" with the three official metrics that matter for SEO:

| Metric | Name | Good Threshold | Impact |
| :--- | :--- | :--- | :--- |
| **LCP** | Largest Contentful Paint | < 2.5s | **Load Speed:** Does the main content appear quickly? |
| **INP** | Interaction to Next Paint | < 200ms | **Responsiveness:** Does the page freeze when clicked? |
| **CLS** | Cumulative Layout Shift | < 0.1 | **Stability:** Does content jump around while loading? |

**Data Sources:**
*   **Field Data:** Real user data (28-day rolling average) is prioritized when available.
*   **Lab Data:** Simulated tests are used as a fallback for low-traffic pages.

## 3. User Workflows

### 1. Diagnostic View
On the **Query Detail** page, the user sees the "Content Intelligence" card.
*   **Top Half:** The CWV Strip showing Mobile vs. Desktop pass/fail status.
*   **Bottom Half:** A scrollable list of specific audit warnings (e.g., "H1 missing keyword").

### 2. Deep Dive Analysis
Clicking "View Trends" or "Performance" takes the user to the **Performance Page** (`pages/PerformancePage.tsx`).
*   **Trend Analysis:** A chart showing LCP/CLS history over the last 90 days.
*   **Top Failing Pages:** A prioritized list of landing pages that need engineering attention.

### 3. Action Planning
If a metric fails (e.g., LCP > 4.0s), the system generates specific Strategy Tasks:
*   *"Compress hero image on [URL]"*
*   *"Defer render-blocking JavaScript"*

## 4. Technical Architecture

### Data Models (`types/performanceTypes.ts`)
*   `PagePerformanceSummary`: The root object linking a URL to its metrics.
*   `CwvSnapshot`: A point-in-time record of metrics for a specific device (Mobile/Desktop).

### State Management
*   **WorkspaceContext:** Holds `performanceSummariesByUrl` to cache results and prevent redundant API calls.
*   **Mock Service:** `mockDataService.ts` currently generates realistic randomized data, including history trends, to simulate the PageSpeed Insights API.

### Future Integration Points
*   **Real Data:** The architecture is designed to swap the mock generator for a proxy call to the `Google PageSpeed Insights API` without changing the UI components.


# Google Search Console Opportunity Heatmap

## Overview
The SEO Opportunity Heatmap is a growth-focused feature designed to help users identify low-hanging fruit in their organic search performance. It connects directly to Google Search Console (GSC) to retrieve real-world data and analyzes it to find actionable opportunities.

## Core Logic
The feature classifies queries into four distinct opportunity types:

### 1. LOW CTR (High Impression / Low Click)
- **Concept:** People see your listing but don't click it.
- **Criteria:**
  - Impressions > 200
  - Position <= 20
  - CTR is < 70% of the expected baseline for that position.
- **Action:** Improve Title Tags and Meta Descriptions to increase click-through rate.

### 2. QUICK WIN (Striking Distance)
- **Concept:** You are ranking on Page 2 or bottom of Page 1. Small push moves you to top spots.
- **Criteria:**
  - Impressions > 100
  - Position between 4 and 15
- **Action:** Refresh content, add internal links, or expand the section.

### 3. MISMATCH (Cannibalization)
- **Concept:** Google ranks a different page than the one you intended for a specific query.
- **Criteria:** 
  - Tracked Question has a `targetUrl` set.
  - GSC top ranking page does not match `targetUrl`.
- **Action:** Fix internal linking, canonical tags, or content focus.

### 4. RISING (Momentum)
- **Concept:** Queries showing unusual performance or high CTR relative to position.
- **Criteria:** 
  - Position > 10
  - CTR > 1.5x expected baseline
- **Action:** Create dedicated content to capture this demand.

## Technical Implementation

### Data Source
- **Real Mode:** Uses Google Search Console API (via `GscClient`) if an OAuth Token is available.
- **Mock Mode:** If no Client ID is configured, `mockDataService` generates realistic GSC rows to simulate the experience.

### Architecture
- **State:** Managed in `WorkspaceContext` (`gscConnection`, `seoState`).
- **Engine:** `SeoOpportunityEngine.ts` contains the scoring and classification logic. It is pure business logic, decoupled from the UI.
- **UI:** A full-width page `SeoOpportunityHeatmapPage` containing a Connection Card, Summary Tiles, and a detailed Data Table with a slide-over Drawer.

## Security Note
This implementation handles OAuth tokens in memory for the client-side session. In a production environment, tokens should be exchanged and stored securely on a backend server (HttpOnly cookies) to persist connections across sessions without re-login.


# Optimization Strategy: The Action Engine

## 1. Executive Summary
The **Strategy Planner** (implemented in `pages/Strategy.tsx`) is the operational heart of QueryFit. While the "Overview" and "Queries" pages provide diagnostics, the Strategy page converts those insights into a concrete **Kanban-style Action Plan**. It bridges the gap between "knowing you have a visibility problem" and "fixing it."

## 2. Core Philosophy: "Close the Loop"
The workflow is designed around a scientific optimization loop:
1.  **Identify:** The AI finds a gap (e.g., "Missing Keyword in H1").
2.  **Generate:** The system creates a `Task` with step-by-step instructions.
3.  **Implement:** The user utilizes AI-generated assets (HTML/Text) to fix the issue.
4.  **Verify:** The user triggers a specific **Re-Scan** to confirm the visibility score increased.

## 3. Key Features

### A. The Kanban Board
Organizes optimization tasks into three columns to manage workflow velocity:
*   **Backlog (Todo):** Tasks identified by the audit engine but not yet started.
*   **In Progress (Doing):** Tasks currently being implemented by the engineering or content team.
*   **Optimized (Done):** Completed items waiting for a final verification scan.

### B. Smart Prioritization Filters
To prevent analysis paralysis, users can filter the board by ROI:
*   **High Impact:** Filters for tasks predicted to yield the highest visibility lift (e.g., fixing a canonical tag).
*   **Quick Wins:** Filters for `Effort: Small` tasks (e.g., changing a Meta Title) that take <15 minutes.

### C. The "Fix Drawer" (Deep Dive)
Clicking any task opens a slide-over panel containing:
*   **AI Generated Fix:** If available, this renders the actual code or copy (e.g., a rewritten HTML snippet) that the user can copy to their clipboard. This drastically reduces execution time.
*   **Step-by-Step Resolution:** A clickable checklist guiding the user through the implementation (e.g., "Locate H1," "Replace Text," "Request Re-indexing").
*   **Impact Context:** Explains *why* this fix matters (e.g., "Closing this gap is estimated to improve visibility by ~12.4%").

### D. The Verification Mechanism
Unlike standard project management tools, QueryFit integrates with the data layer.
*   **Verify Implementation:** When a task is marked "Done," a special action button appears to run a **Single-Query Scan**.
*   **Credit Logic:** This consumes credits but provides immediate feedback on whether the fix worked.

## 4. UI/UX Design Language
*   **Task Cards:** Utilize color-coded badges for Impact (Purple/Primary) and Effort (Grayscale). High-impact cards have a subtle glow.
*   **Progressive Disclosure:** The main board shows high-level info; the drawer reveals technical details (code snippets, specific steps).
*   **Gamification:** Checking off steps and moving cards to "Done" provides visual feedback to encourage task completion.

## 5. Technical Implementation

### Components
*   **`pages/Strategy.tsx`**: The main container managing the column layout and filter state.
*   **`components/FixVariantsPopover.tsx`**: (Indirectly linked) Generates the fix content stored in the task.
*   **`components/CreditConfirmationModal.tsx`**: Intercepts the "Verify" action.

### Data Model
*   **`Task` Interface**:
    *   `impact`: 'S' | 'M' | 'L' (Small, Medium, Large).
    *   `effort`: 'S' | 'M' | 'L'.
    *   `steps`: string[] (Array of instructions).
    *   `generatedFixContent`: string (The raw output from the Fix Generator).

## 6. Strategic Value
This module turns QueryFit from a "Passive Monitoring Tool" into an "Active Workflow Tool." For Agencies, this is the **Retainer Justification** page—it shows clients exactly what work is being done to improve their AI standing.

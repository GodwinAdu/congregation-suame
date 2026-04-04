# Bugfix Requirements Document

## Introduction

The Bible reading page (`/dashboard/publisher/bible-reading`) supports a "Manual" reading mode that is supposed to let users freely select and track any Bible chapter without being tied to a schedule. However, the current implementation has several issues that prevent manual mode from working correctly:

1. Selecting "Manual" mode on the setup screen opens a `ManualBibleReadingSetup` sub-form that requires a start date before the user can enter manual mode — adding unnecessary friction for a schedule-free feature.
2. There is a JavaScript variable name conflict (`selectedBook` is declared twice in the same component scope), which causes a runtime error and prevents the manual mode chapter-selection UI from rendering.
3. When the user is already in manual mode (saved in IndexedDB), the chapter-selection UI is gated behind `plan.length === 0`, meaning if any scheduled plan data exists alongside the manual mode flag, the chapter grid is never shown.

These defects mean users cannot freely select chapters in manual mode as intended.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the user selects "Manual" reading mode on the setup screen THEN the system shows a sub-form requiring a start date before allowing entry into manual mode, forcing schedule-like setup for a schedule-free feature.

1.2 WHEN the Bible reading client component mounts with manual mode selected THEN the system throws a runtime error due to a duplicate `selectedBook` variable declaration in the same component scope, preventing the chapter-selection UI from rendering.

1.3 WHEN the user is in manual mode and the `plan` state array is non-empty (e.g., from a previous scheduled plan) THEN the system renders the scheduled plan view instead of the manual chapter-selection grid, making manual mode inaccessible.

1.4 WHEN the user clicks "Manual" mode button on the setup screen THEN the system requires clicking through an additional `ManualBibleReadingSetup` modal step rather than immediately activating manual mode.

### Expected Behavior (Correct)

2.1 WHEN the user selects "Manual" reading mode on the setup screen THEN the system SHALL activate manual mode directly without requiring a start date or additional setup steps.

2.2 WHEN the Bible reading client component mounts with manual mode selected THEN the system SHALL render the chapter-selection UI without runtime errors by resolving the duplicate `selectedBook` variable conflict.

2.3 WHEN the user is in manual mode (regardless of `plan` state) THEN the system SHALL display the manual chapter-selection grid, allowing the user to pick any book and mark individual chapters as read.

2.4 WHEN the user clicks "Manual" mode and starts the plan THEN the system SHALL immediately navigate to the chapter-selection view where the user can freely select any chapter from any book.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user selects "Sequential" reading mode and starts a plan THEN the system SHALL CONTINUE TO generate and display the day-by-day scheduled reading plan as before.

3.2 WHEN the user selects "Random" reading mode and starts a plan THEN the system SHALL CONTINUE TO generate and display a shuffled day-by-day reading plan as before.

3.3 WHEN the user is in manual mode and toggles a chapter THEN the system SHALL CONTINUE TO persist the chapter's read/unread state in IndexedDB via `markChapterRead` / `unmarkChapterRead`.

3.4 WHEN the user resets the reading plan THEN the system SHALL CONTINUE TO clear all progress data from IndexedDB and return to the setup screen.

3.5 WHEN the user is in sequential or random mode THEN the system SHALL CONTINUE TO display streak tracking, book progress, and day completion features.

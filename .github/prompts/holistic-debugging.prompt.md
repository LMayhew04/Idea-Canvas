# Prompt: Holistic Application Debugging and Analysis

Your goal is to perform a deep, analytical code review of the IdeaCanvas application. You must identify and resolve not only bugs caught by the existing test suite but also latent bugs, potential edge case failures, and architectural weaknesses discovered through static code analysis.

You will follow this multi-phase workflow precisely.

---

### Phase 1: Establish a Baseline with Existing Tests

1.  **Execute All Tests:** Run the entire `vitest` test suite to establish a baseline of known application behavior.
2.  **Analyze Failures:** If any tests fail, analyze the failure logs to form an initial hypothesis about the root cause. Do not attempt to fix them yet.

---

### Phase 2: Agentic Code Inspection and Analysis

This is the most critical phase. You will now perform a static analysis of the codebase, ignoring the test outcomes for a moment and focusing on the code's logic and structure. Investigate the following areas in `@workspace/src/components/IdeaCanvas.jsx` and its related components.

**2a. State Management and Data Flow Analysis:**
-   Identify all primary state variables (managed by `useState`).
-   Trace the data flow. How is state updated? How are props passed to child components?
-   Specifically search for potential issues:
    -   **State Mutation:** Look for any instances where an object or array in state is modified directly instead of being replaced with a new one.
    -   **Stale Closures:** Analyze `useCallback` and `useEffect` hooks. Are their dependency arrays complete and correct? Could any function be capturing stale state?
    -   **Race Conditions:** Are there multiple `useEffect` hooks or event handlers that could try to update the same piece of state simultaneously, leading to unpredictable outcomes?

**2b. Edge Case and Logic Review:**
-   Review the logic for key features (Import/Export, Undo/Redo, Save/Load).
-   Theorize potential edge cases not covered by tests:
    -   **Import:** What happens if a user tries to import a malformed or empty JSON file?
    -   **LocalStorage:** How does the app behave on first load if `localStorage` is empty or contains corrupted/invalid data?
    -   **User Input:** What happens if a node label is empty or contains special characters?
    -   **Rapid Actions:** What happens if a user clicks undo/redo or save/load multiple times in rapid succession?

**2c. React Best Practices and "Code Smells":**
-   Identify any deviations from standard React best practices.
-   Look for overly complex components or functions that could be simplified or broken down.
-   Check for redundant or inefficient computations that could be optimized with `useMemo`.

---

### Phase 3: Synthesize Findings and Create an Action Plan

1.  **Consolidate All Findings:** Create a comprehensive list of all identified issues, combining the failing tests from Phase 1 with all the potential bugs and architectural weaknesses discovered in Phase 2.
2.  **Prioritize and Plan:** For each issue, provide a brief explanation of the root cause and propose a clear, step-by-step plan to fix it.

---

### Phase 4: Incremental Implementation and Verification

1.  **Execute the Plan:** Address each issue from your action plan one by one.
2.  **Explain Your Work:** For each fix, adhere to the "Communication and Explanation Protocol" defined in our main `prompt.md` file.
3.  **Verify with Tests:** After **every single fix**, run the entire test suite to ensure the fix was successful and that you have not introduced any new bugs (regressions).

The task is complete only when all issues from your consolidated plan have been resolved and all tests pass.
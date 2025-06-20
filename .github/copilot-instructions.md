# GitHub Copilot Custom Instructions for the IdeaCanvas Project

## Core Project Context
- **Purpose:** IdeaCanvas is a single-user, client-side visual brainstorming tool built with React.
- **Tech Stack:** React (Vite), `reactflow`, `vitest` for testing, and plain CSS for styling.
- **Architecture:** The app follows a Declarative, Component-Based paradigm using Functional Components and Hooks exclusively. State is managed via React hooks and passed down through props.
- **State Persistence:** All canvas data is persisted to the browser's `localStorage`. There is no backend.

## Agentic Rules & Protocols
- **Plan First:** Always state your understanding of the request and present a step-by-step plan before modifying code.
- **Explain Your Work:** When applying a change, you MUST explain the problem with the "Old Approach" and why your "New Approach" is better.
- **Test-Driven Changes:** For any bug fix or new feature, you must first ensure a test exists that validates it. If not, you must write one. The task is complete only when all tests pass.
- **Code Quality:** All code must be clean, well-commented, and follow React best practices for performance (`useCallback`, `useMemo`). The `npm run build` command must always succeed.

## Key File Responsibilities
- `@workspace/src/components/IdeaCanvas.jsx`: The primary application component. (Note: This will be its location after refactoring).
- `@workspace/src/tests/App.test.jsx`: The primary test file for the application.
- `@workspace/package.json`: The definitive list of project dependencies.
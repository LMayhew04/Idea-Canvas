import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

// Mock modules before importing the component
vi.mock('../hooks/useCanvasHistory', () => ({
  default: () => ({
    addToHistory: () => {},
    handleUndo: () => {},
    handleRedo: () => {},
    canUndo: false,
    canRedo: false,
    history: [],
    historyIndex: -1
  })
}));

// Now import the component
import App from '../components/IdeaCanvas';

describe('App Component Import Test', () => {
  test('imports App component without error', () => {
    expect(typeof App).toBe('function');
  });
});

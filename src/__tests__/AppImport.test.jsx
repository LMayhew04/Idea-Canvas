import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

// Import the component - no hooks to mock anymore since they're consolidated
import App from '../components/IdeaCanvas';

describe('App Component Import Test', () => {
  test('imports App component without error', () => {
    expect(typeof App).toBe('function');
  });
});

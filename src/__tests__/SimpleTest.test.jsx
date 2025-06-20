import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

// Simple test component to verify testing setup works
const SimpleTest = () => <div>Hello Test</div>;

describe('Basic Test Setup', () => {
  test('renders a simple component', () => {
    render(<SimpleTest />);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });
});

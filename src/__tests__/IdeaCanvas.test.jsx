import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import IdeaCanvas from '../IdeaCanvas';
import { ReactFlowProvider } from 'reactflow';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('IdeaCanvas Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // Wrapper component for tests
  const renderWithProvider = (component) => {
    return render(
      <ReactFlowProvider>{component}</ReactFlowProvider>
    );
  };

  test('renders initial nodes', () => {
    renderWithProvider(<IdeaCanvas />);
    expect(screen.getByText('Project Vision')).toBeInTheDocument();
    expect(screen.getByText('Milestone A')).toBeInTheDocument();
    expect(screen.getByText('Milestone B')).toBeInTheDocument();
  });

  test('adds new node when clicking Add Node button', async () => {
    renderWithProvider(<IdeaCanvas />);
    const addButton = screen.getByText('Add Node');
    const initialNodeCount = screen.getAllByText(/New Idea|Project Vision|Milestone [AB]/).length;
    
    await act(async () => {
      fireEvent.click(addButton);
    });

    const newNodeCount = screen.getAllByText(/New Idea|Project Vision|Milestone [AB]/).length;
    expect(newNodeCount).toBe(initialNodeCount + 1);
  });

  test('saves and loads canvas state', async () => {
    renderWithProvider(<IdeaCanvas />);
    const saveButton = screen.getByText('Save');
    const loadButton = screen.getByText('Load');

    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(localStorage.setItem).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(loadButton);
    });

    expect(localStorage.getItem).toHaveBeenCalled();
  });

  test('deletes selected nodes', async () => {
    renderWithProvider(<IdeaCanvas />);
    const node = screen.getByText('Project Vision');
    const deleteButton = screen.getByText('Delete Selected');

    await act(async () => {
      fireEvent.click(node);
      fireEvent.click(deleteButton);
    });

    expect(screen.queryByText('Project Vision')).not.toBeInTheDocument();
  });
  test('updates node text content', async () => {
    renderWithProvider(<IdeaCanvas />);
    const node = screen.getByText('Project Vision');
    const textarea = node.querySelector('textarea');

    await act(async () => {
      fireEvent.focus(textarea);
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'Updated Vision');
      fireEvent.blur(textarea);
    });

    // Wait for state update
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(screen.getByDisplayValue('Updated Vision')).toBeInTheDocument();
  });

  test('handles hierarchy level changes', async () => {
    renderWithProvider(<IdeaCanvas />);
    const hierarchyButton = screen.getByText('Hierarchy Settings');

    await act(async () => {
      fireEvent.click(hierarchyButton);
    });

    const levelInput = screen.getByDisplayValue('Executive');
    await userEvent.clear(levelInput);
    await userEvent.type(levelInput, 'Strategic');

    const saveButton = screen.getByText('Save Changes');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(screen.queryByText('Executive')).not.toBeInTheDocument();
    expect(screen.getByText('Strategic')).toBeInTheDocument();
  });

  const waitForStateUpdate = () => new Promise(resolve => setTimeout(resolve, 0));

  test('handles undo/redo operations', async () => {
    renderWithProvider(<IdeaCanvas />);
    const node = screen.getByText('Project Vision');
    const textarea = node.querySelector('textarea');

    // Make a change
    await act(async () => {
      fireEvent.focus(textarea);
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'Updated Vision');
      fireEvent.blur(textarea);
    });

    await waitForStateUpdate();
    expect(screen.getByDisplayValue('Updated Vision')).toBeInTheDocument();

    // Trigger undo
    await act(async () => {
      fireEvent.keyDown(document, { key: 'z', ctrlKey: true });
      await waitForStateUpdate();
    });

    expect(screen.getByDisplayValue('Project Vision')).toBeInTheDocument();

    // Trigger redo
    await act(async () => {
      fireEvent.keyDown(document, { key: 'z', ctrlKey: true, shiftKey: true });
      await waitForStateUpdate();
    });

    expect(screen.getByDisplayValue('Updated Vision')).toBeInTheDocument();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Custom render function that sets up React Flow testing environment
 */
export function renderWithReactFlow(ui, options = {}) {
  const result = render(ui, options);
  
  // Force React Flow nodes to be visible by removing visibility: hidden
  // This is a workaround for React Flow's viewport calculations in JSDOM
  const makeNodesVisible = () => {
    const nodes = document.querySelectorAll('.react-flow__node');
    nodes.forEach(node => {
      if (node.style.visibility === 'hidden') {
        node.style.visibility = 'visible';
      }
    });
  };

  // Make nodes visible immediately and after any updates
  makeNodesVisible();
  
  // Use MutationObserver to make nodes visible when they're added/updated
  const observer = new MutationObserver(makeNodesVisible);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style']
  });

  // Clean up observer when component unmounts
  const originalUnmount = result.unmount;
  result.unmount = () => {
    observer.disconnect();
    originalUnmount();
  };

  return result;
}

/**
 * Wait for React Flow to initialize and render nodes
 */
export async function waitForReactFlow() {
  await waitFor(() => {
    const reactFlowWrapper = screen.getByTestId('rf__wrapper');
    expect(reactFlowWrapper).toBeInTheDocument();
  });

  // Give React Flow time to calculate positions and render nodes
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Wait for a modal or dialog to appear in the DOM
 */
export async function waitForModal(modalTextOrTestId, options = {}) {
  const { timeout = 1000 } = options;
  
  await waitFor(() => {
    try {
      const modal = typeof modalTextOrTestId === 'string' && modalTextOrTestId.startsWith('data-testid=')
        ? screen.getByTestId(modalTextOrTestId.replace('data-testid=', ''))
        : screen.getByText(modalTextOrTestId);
      expect(modal).toBeInTheDocument();
    } catch (error) {
      // Also try to find the modal by checking if it exists anywhere in document
      const allElements = document.querySelectorAll('*');
      const found = Array.from(allElements).some(el => 
        el.textContent && el.textContent.includes(modalTextOrTestId)
      );
      if (!found) {
        throw error;
      }
    }
  }, { timeout });
}

/**
 * Setup mocks for import/export functionality
 */
export function setupImportExportMocks() {
  const mockCreateObjectURL = vi.fn(() => 'mock-blob-url');
  const mockRevokeObjectURL = vi.fn();
  
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;

  // Mock file reader
  const mockFileReader = {
    readAsText: vi.fn(),
    result: '',
    onload: null,
    onerror: null,
  };

  global.FileReader = vi.fn(() => mockFileReader);

  return {
    mockCreateObjectURL,
    mockRevokeObjectURL,
    mockFileReader,
  };
}

/**
 * Trigger a file reader load event with mock data
 */
export function triggerFileReaderLoad(mockData, mockFileReader = null) {
  const fileReader = mockFileReader || global.FileReader.mock.results[0].value;
  if (fileReader && fileReader.onload) {
    fileReader.result = mockData;
    fileReader.onload({ target: fileReader });
  }
}

/**
 * Find React Flow nodes by their text content
 */
export function findNodeByText(text) {
  const nodes = document.querySelectorAll('.react-flow__node');
  return Array.from(nodes).find(node => node.textContent?.includes(text));
}

/**
 * Get all visible React Flow nodes
 */
export function getVisibleNodes() {
  const nodes = document.querySelectorAll('.react-flow__node');
  return Array.from(nodes).filter(node => 
    node.style.visibility !== 'hidden' && 
    !node.hidden &&
    node.offsetWidth > 0 && 
    node.offsetHeight > 0
  );
}

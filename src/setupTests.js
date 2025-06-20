import '@testing-library/jest-dom';

// Setup DOM environment for tests
import { beforeEach, vi } from 'vitest';

// Mock browser APIs that React Flow and DOM manipulation tests need
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock DOMMatrix for React Flow transformations
global.DOMMatrix = vi.fn().mockImplementation(() => ({
  translate: vi.fn().mockReturnThis(),
  scale: vi.fn().mockReturnThis(),
  rotate: vi.fn().mockReturnThis(),
  skewX: vi.fn().mockReturnThis(),
  skewY: vi.fn().mockReturnThis(),
  multiply: vi.fn().mockReturnThis(),
  inverse: vi.fn().mockReturnThis(),
  transformPoint: vi.fn().mockReturnValue({ x: 0, y: 0 }),
}));

// Mock SVGElement getBBox for React Flow
if (typeof SVGElement !== 'undefined') {
  SVGElement.prototype.getBBox = vi.fn().mockReturnValue({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
}

// Mock range and selection APIs
global.Range = class Range {
  getBoundingClientRect() {
    return { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0 };
  }
  getClientRects() {
    return { length: 0, item: () => null, [Symbol.iterator]: function* () {} };
  }
};

global.getSelection = vi.fn().mockReturnValue({
  removeAllRanges: vi.fn(),
  addRange: vi.fn(),
});

// Mock createRange
document.createRange = vi.fn().mockReturnValue(new Range());

// Mock HTMLElement methods that might be used in React Flow
HTMLElement.prototype.scrollIntoView = vi.fn();
HTMLElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  top: 0,
  left: 0,
  bottom: 100,
  right: 100,
});

beforeEach(() => {
  // Ensure there's a root element in the DOM for React to mount to
  if (!document.getElementById('root')) {
    const rootDiv = document.createElement('div');
    rootDiv.id = 'root';
    document.body.appendChild(rootDiv);
  }
});

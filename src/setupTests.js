import '@testing-library/jest-dom';

// Setup DOM environment for tests
import { beforeEach, vi } from 'vitest';

// Mock browser APIs that React Flow and DOM manipulation tests need
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver for React Flow
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
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

// Ensure React Flow container dimensions are set
const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function() {
  const rect = originalGetBoundingClientRect.call(this);
  
  // Set dimensions for React Flow containers
  if (this.classList && (
    this.classList.contains('react-flow') ||
    this.classList.contains('react-flow__renderer') ||
    this.classList.contains('react-flow__viewport')
  )) {
    return {
      ...rect,
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600
    };
  }
  
  return rect;
};

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

// === CRITICAL DOM FIXES ===
// Fix hasAttribute for React Flow compatibility
const ensureHasAttribute = (obj) => {
  if (obj && typeof obj === 'object' && typeof obj.hasAttribute !== 'function') {
    Object.defineProperty(obj, 'hasAttribute', {
      configurable: true,
      enumerable: false,
      value: function(name) {
        if (typeof name !== 'string') return false;
        try {
          return this.getAttribute ? this.getAttribute(name) !== null : false;
        } catch (e) {
          return false;
        }
      }
    });
  }
};

// Apply hasAttribute to all DOM prototypes
[HTMLElement, Element, Node, EventTarget, Document].forEach(Constructor => {
  if (Constructor && Constructor.prototype) {
    ensureHasAttribute(Constructor.prototype);
  }
});

// Mock closest method for React Flow compatibility - apply to all relevant prototypes
const mockClosest = function(selector) {
  if (!selector || typeof selector !== 'string') return null;
  
  let element = this;
  while (element && element.nodeType === 1) {
    // For React Flow's isInputDOMNode check, we mainly need to handle input/textarea
    if (selector === 'input' || selector === 'textarea') {
      if (element.tagName && element.tagName.toLowerCase() === selector) {
        return element;
      }
    }
    // For other selectors, try to match by tagName or class
    if (element.tagName) {
      const tagName = element.tagName.toLowerCase();
      // Handle tag selectors (e.g., 'div', 'span')
      if (selector.startsWith('.')) {
        // Class selector
        const className = selector.substring(1);
        if (element.classList && element.classList.contains(className)) {
          return element;
        }
      } else if (selector.startsWith('#')) {
        // ID selector
        const idName = selector.substring(1);
        if (element.id === idName) {
          return element;
        }
      } else if (tagName === selector) {
        // Tag selector
        return element;
      }
    }
    element = element.parentElement;
    if (!element || element === document.documentElement) break;
  }
  return null;
};

// Apply closest to all prototypes that might be used
[Element, HTMLElement, SVGElement, Node].forEach(Constructor => {
  if (Constructor && Constructor.prototype) {
    if (!Constructor.prototype.closest) {
      Object.defineProperty(Constructor.prototype, 'closest', {
        configurable: true,
        enumerable: false,
        value: mockClosest
      });
    }
  }
});

// Ensure all dynamically created elements get the closest method
const ensureClosest = (element) => {
  if (element && typeof element === 'object' && element.nodeType === 1) {
    if (!element.closest) {
      Object.defineProperty(element, 'closest', {
        configurable: true,
        enumerable: false,
        value: mockClosest
      });
    }
  }
};

// Override document.createElement to ensure hasAttribute and closest on all new elements
const originalCreateElement = document.createElement;
document.createElement = function(tagName, options) {
  const element = originalCreateElement.call(this, tagName, options);
  ensureHasAttribute(element);
  ensureClosest(element);
  
  // Special handling for anchor elements for download tests
  if (tagName.toLowerCase() === 'a') {
    element.click = vi.fn();
    if (!element.style) element.style = {};
  }
  
  return element;
};

// Mock style.getPropertyValue for accessibility API
Object.defineProperty(CSSStyleDeclaration.prototype, 'getPropertyValue', {
  configurable: true,
  value: function(property) {
    // Simple mock that returns empty string for all properties
    return '';
  }
});

// Mock additional DOM methods that React Flow needs
HTMLElement.prototype.getClientRects = vi.fn().mockReturnValue({
  length: 1,
  item: () => ({ width: 100, height: 100, top: 0, left: 0, right: 100, bottom: 100 }),
  [Symbol.iterator]: function* () { yield this.item(); }
});

// Mock offsetWidth/offsetHeight which React Flow uses for layout calculations
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  value: 200,
});

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  value: 100,
});

// Mock clientWidth/clientHeight
Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  value: 200,
});

Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  value: 100,
});

// Mock URL.createObjectURL and revokeObjectURL for import/export tests
global.URL = {
  createObjectURL: vi.fn(() => 'mock-blob-url'),
  revokeObjectURL: vi.fn()
};

// Mock FileReader with proper constructor and methods
global.FileReader = class MockFileReader {
  constructor() {
    this.readAsText = vi.fn((file) => {
      // Simulate async file reading
      setTimeout(() => {
        if (this.onload) {
          this.result = JSON.stringify({
            version: "1.0.0",
            nodes: [],
            edges: [],
            hierarchyLevels: []
          });
          this.onload({ target: this });
        }
      }, 0);
    });
    this.onload = null;
    this.onerror = null;
    this.result = null;
  }
};

// Mock requestAnimationFrame for React Flow animations
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn();

// Mock CSS.supports for React Flow compatibility
global.CSS = {
  supports: vi.fn().mockReturnValue(true)
};

// Force React Flow nodes to be visible with CSS injection
const forceVisibilityCSS = document.createElement('style');
forceVisibilityCSS.textContent = `
  /* Force all React Flow nodes to be visible in tests */
  .react-flow__node,
  .react-flow__node[style*="visibility: hidden"],
  [data-testid*="rf__node"],
  .custom-node {
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
  }
  
  .react-flow__nodes,
  .react-flow__nodes * {
    visibility: visible !important;
  }
`;
document.head.appendChild(forceVisibilityCSS);

// Override getComputedStyle to force visibility
const originalGetComputedStyle = global.getComputedStyle || (() => ({}));
global.getComputedStyle = function(element, pseudoElement) {
  const styles = originalGetComputedStyle(element, pseudoElement);
  
  // Force visibility for React Flow nodes
  if (element && (
    element.classList?.contains('react-flow__node') ||
    element.className?.includes?.('react-flow__node') ||
    element.getAttribute?.('data-testid')?.includes?.('rf__node') ||
    element.classList?.contains('custom-node')
  )) {
    return {
      ...styles,
      visibility: 'visible',
      display: 'block',
      opacity: '1',
      getPropertyValue: function(prop) {
        if (prop === 'visibility') return 'visible';
        if (prop === 'display') return 'block';
        if (prop === 'opacity') return '1';
        return styles[prop] || '';
      }
    };
  }
  
  return styles;
};

beforeEach(() => {
  // Ensure there's a root element in the DOM for React to mount to
  if (!document.getElementById('root')) {
    const rootDiv = document.createElement('div');
    rootDiv.id = 'root';
    document.body.appendChild(rootDiv);
  }
  
  // Reset mocks before each test
  if (global.URL) {
    global.URL.createObjectURL.mockClear?.();
    global.URL.revokeObjectURL.mockClear?.();
  }
  
  // Clear console warn/error spies
  if (vi.spyOn && console.warn.mockClear) {
    console.warn.mockClear();
  }
  if (vi.spyOn && console.error.mockClear) {
    console.error.mockClear();
  }
});

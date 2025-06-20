import '@testing-library/jest-dom';

// Setup DOM environment for tests
import { beforeEach } from 'vitest';

beforeEach(() => {
  // Ensure there's a root element in the DOM for React to mount to
  if (!document.getElementById('root')) {
    const rootDiv = document.createElement('div');
    rootDiv.id = 'root';
    document.body.appendChild(rootDiv);
  }
});

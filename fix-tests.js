const fs = require('fs');
const path = require('path');

const testFilePath = path.join(__dirname, 'src', '__tests__', 'IdeaCanvas.test.jsx');

// Read the file
let content = fs.readFileSync(testFilePath, 'utf8');

// Replace all instances of renderWithProvider with render
content = content.replace(/renderWithProvider/g, 'render');

// Write the file back
fs.writeFileSync(testFilePath, content);

console.log('Fixed all renderWithProvider calls in test file');

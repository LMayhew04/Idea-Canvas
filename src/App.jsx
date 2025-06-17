import IdeaCanvas from './IdeaCanvas';
import { ReactFlowProvider } from 'reactflow';
import './index.css'; // Added missing CSS import

function App() {
  return (
    <ReactFlowProvider>
      <IdeaCanvas />
    </ReactFlowProvider>
  );
}

export default App;
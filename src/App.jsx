import IdeaCanvas from './IdeaCanvas';
import { ReactFlowProvider } from 'reactflow';
import './index.css';

function App() {
  return (
    <ReactFlowProvider>
      <IdeaCanvas />
    </ReactFlowProvider>
  );
}

export default App;
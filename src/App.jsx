import IdeaCanvas from './IdeaCanvas';
import { ReactFlowProvider } from 'reactflow';

function App() {
  return (
    <ReactFlowProvider>
      <IdeaCanvas />
    </ReactFlowProvider>
  );
}

export default App;
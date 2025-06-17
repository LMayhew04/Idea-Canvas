import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import { nanoid } from 'nanoid';
import CustomNode from './CustomNode';

import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 50 },
    data: { label: 'My Main Idea', onChange: () => {} },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 100, y: 250 },
    data: { label: 'A related thought...', onChange: () => {} },
  },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
const SAVE_KEY = 'ideaCanvasData';

function IdeaCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // This function will be passed to each node to update the central state
  const onNodeLabelChange = useCallback((nodeId, newLabel) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, label: newLabel } };
        }
        return node;
      })
    );
  }, [setNodes]);

  // We use useMemo to create the node types map only once.
  // We also inject the onNodeLabelChange function into every custom node.
  const nodeTypes = useMemo(() => ({
      custom: (props) => <CustomNode {...props} data={{ ...props.data, onChange: onNodeLabelChange, id: props.id }} />,
  }), [onNodeLabelChange]);

  // Logic to handle connecting two nodes
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Logic to add a new node to the canvas
  const addNode = useCallback(() => {
    const newNode = {
      id: nanoid(),
      type: 'custom',
      position: {
        x: Math.random() * window.innerWidth * 0.7,
        y: Math.random() * window.innerHeight * 0.7,
      },
      data: { label: 'New Idea', onChange: onNodeLabelChange },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [onNodeLabelChange, setNodes]);

  // Logic to save the current state to localStorage
  const onSave = useCallback(() => {
    const flowData = { nodes, edges };
    localStorage.setItem(SAVE_KEY, JSON.stringify(flowData));
    alert('Canvas Saved!');
  }, [nodes, edges]);

  // Logic to restore the state from localStorage
  const onRestore = useCallback(() => {
    const savedData = localStorage.getItem(SAVE_KEY);

    if (savedData) {
      const flowData = JSON.parse(savedData);
      setNodes(flowData.nodes || []);
      setEdges(flowData.edges || []);
      alert('Canvas Restored!');
    } else {
        // If no saved data, load initial example
        setNodes(initialNodes);
        setEdges(initialEdges);
        alert('No saved data found. Loaded initial example.');
    }
  }, [setNodes, setEdges]);


  return (
    <>
      <div className="controls-panel">
        <button onClick={addNode}>Add Idea Bubble</button>
        <button onClick={onSave} className="save-button">Save</button>
        <button onClick={onRestore} className="restore-button">Restore Last Saved</button>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView // Zooms out to show all nodes on first load
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </>
  );
}

export default IdeaCanvas;
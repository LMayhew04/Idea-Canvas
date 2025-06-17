import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom Node Component
const CustomNode = React.memo(({ data, id, selected }) => {
  const onLabelChange = useCallback((evt) => {
    if (data.onChange) {
      data.onChange(id, evt.target.value);
    }
  }, [id, data.onChange]);

  const onLevelChange = useCallback((evt) => {
    if (data.onLevelChange) {
      data.onLevelChange(id, evt.target.value);
    }
  }, [id, data.onLevelChange]);

  const currentLevel = data.level || 4;
  const levelInfo = data.hierarchyLevels?.[currentLevel] || {
    name: 'Individual',
    color: '#96ceb4',
    bgColor: '#f0fff4'
  };

  // 8 compass positions mapped to ReactFlow's Handle
  const positionOrder = [
    { pos: Position.Top, id: 'n', style: { left: '50%', top: -6, transform: 'translateX(-50%)' } },
    { pos: Position.Right, id: 'e', style: { right: -6, top: '50%', transform: 'translateY(-50%)' } },
    { pos: Position.Bottom, id: 's', style: { left: '50%', bottom: -6, transform: 'translateX(-50%)' } },
    { pos: Position.Left, id: 'w', style: { left: -6, top: '50%', transform: 'translateY(-50%)' } },
  ];

  return (
    <div
      style={{
        minWidth: '120px',
        minHeight: '60px',
        background: levelInfo.bgColor,
        border: `3px solid ${levelInfo.color}`,
        borderRadius: '16px',
        padding: '16px 10px 8px 10px',
        boxShadow: selected
          ? '0 0 0 4px #2271f522'
          : '0 2px 10px rgba(80, 80, 100, 0.09)',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {/* Handles for connections */}
      {positionOrder.map(({ pos, id: handleId, style }) => (
        <Handle
          key={handleId}
          type="source"
          position={pos}
          id={handleId}
          style={{
            width: 8,
            height: 8,
            background: levelInfo.color,
            border: 'none',
            ...style
          }}
        />
      ))}
      {positionOrder.map(({ pos, id: handleId, style }) => (
        <Handle
          key={handleId + '_t'}
          type="target"
          position={pos}
          id={handleId + '_t'}
          style={{
            width: 8,
            height: 8,
            background: levelInfo.color,
            border: 'none',
            ...style
          }}
        />
      ))}

      <input
        value={data.label || ''}
        onChange={onLabelChange}
        spellCheck={false}
        placeholder="Enter idea..."
        style={{
          border: 'none',
          outline: 'none',
          fontSize: 16,
          width: '100%',
          background: 'transparent',
          textAlign: 'center',
          fontWeight: 600,
          color: '#373737',
          marginBottom: '8px'
        }}
      />
      <div style={{
        fontSize: 12,
        color: levelInfo.color,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        Level:&nbsp;
        <select
          value={data.level || 4}
          onChange={onLevelChange}
          style={{
            background: levelInfo.bgColor,
            color: levelInfo.color,
            border: `1.5px solid ${levelInfo.color}`,
            borderRadius: 4,
            fontWeight: 600,
            padding: '2px 6px',
            fontSize: 11
          }}>
          {data.hierarchyLevels && Object.entries(data.hierarchyLevels).map(([num, lvl]) => (
            <option key={num} value={num}>{lvl.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
});

// Main IdeaCanvas Component
const IdeaCanvas = () => {
  const HIERARCHY_LEVELS = {
    1: { name: 'Executive', color: '#ff6b6b', bgColor: '#ffe0e0' },
    2: { name: 'Management', color: '#4ecdc4', bgColor: '#e0fffe' },
    3: { name: 'Team Lead', color: '#45b7d1', bgColor: '#e0f4ff' },
    4: { name: 'Individual', color: '#96ceb4', bgColor: '#f0fff4' },
    5: { name: 'Task', color: '#feca57', bgColor: '#fff8e1' }
  };

  const initialNodes = [
    {
      id: '1',
      type: 'custom',
      position: { x: 250, y: 50 },
      data: {
        label: 'Project Vision',
        level: 1,
        hierarchyLevels: HIERARCHY_LEVELS,
      },
      style: { width: 180 }
    },
    {
      id: '2',
      type: 'custom',
      position: { x: 400, y: 200 },
      data: {
        label: 'Milestone A',
        level: 2,
        hierarchyLevels: HIERARCHY_LEVELS,
      },
      style: { width: 180 }
    },
    {
      id: '3',
      type: 'custom',
      position: { x: 100, y: 200 },
      data: {
        label: 'Milestone B',
        level: 2,
        hierarchyLevels: HIERARCHY_LEVELS,
      },
      style: { width: 180 }
    },
  ];

  const initialEdges = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    },
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      type: 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    },
  ];

  const nodeTypes = { custom: CustomNode };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [group, setGroup] = useState([]);
  const [nextId, setNextId] = useState(4);

  // Node label change handler
  const onNodeLabelChange = useCallback((id, value) => {
    setNodes(nds => nds.map(node => 
      node.id === id 
        ? { ...node, data: { ...node.data, label: value } }
        : node
    ));
  }, [setNodes]);

  // Node level change handler
  const onNodeLevelChange = useCallback((id, level) => {
    setNodes(prev =>
      prev.map(n => n.id === id ? {
        ...n,
        data: { ...n.data, level: parseInt(level) }
      } : n)
    );
  }, [setNodes]);

  // Node click handler for grouping
  const handleNodeClick = useCallback((evt, node) => {
    if (evt.ctrlKey || evt.metaKey) {
      setGroup(g => {
        if (g.includes(node.id)) {
          return g.filter(id => id !== node.id);
        } else {
          return [...g, node.id];
        }
      });
    } else {
      setGroup([node.id]);
    }
  }, []);

  // Connection handler
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    }, eds));
  }, [setEdges]);

  // Add new node
  const handleAddNode = useCallback(() => {
    const newNode = {
      id: String(nextId),
      type: 'custom',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { 
        label: 'New Idea', 
        level: 4, 
        hierarchyLevels: HIERARCHY_LEVELS 
      },
      style: { width: 180 }
    };
    setNodes(nodes => [...nodes, newNode]);
    setNextId(prev => prev + 1);
  }, [setNodes, nextId]);

  // Save canvas (using memory instead of localStorage)
  const [savedData, setSavedData] = useState(null);
  const saveCanvas = useCallback(() => {
    const dataToSave = { nodes, edges };
    setSavedData(dataToSave);
    console.log('Canvas saved successfully');
  }, [nodes, edges]);

  // Load canvas
  const loadCanvas = useCallback(() => {
    if (savedData) {
      const loadedNodes = savedData.nodes.map(node => ({
        ...node,
        type: 'custom',
        data: {
          ...node.data,
          hierarchyLevels: HIERARCHY_LEVELS,
        }
      }));
      setNodes(loadedNodes);
      setEdges(savedData.edges);
      console.log('Canvas loaded successfully');
    } else {
      // Fallback to initial data
      setNodes(initialNodes);
      setEdges(initialEdges);
      console.log('No saved data, loaded initial canvas');
    }
  }, [savedData, setNodes, setEdges]);

  // Clear group
  const clearGroup = useCallback(() => {
    setGroup([]);
  }, []);

  // Prepare nodes with proper data and event handlers
  const processedNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      selected: group.includes(node.id),
      data: {
        ...node.data,
        onChange: onNodeLabelChange,
        onLevelChange: onNodeLevelChange,
        hierarchyLevels: HIERARCHY_LEVELS,
      }
    }));
  }, [nodes, group, onNodeLabelChange, onNodeLevelChange]);

  // Pane click handler
  const handlePaneClick = useCallback(() => {
    setGroup([]);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#fafbfc' }}>
      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        top: 15,
        left: 15,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 10,
        borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        display: 'flex',
        gap: 10
      }}>
        <button
          onClick={handleAddNode}
          style={{
            backgroundColor: '#2271f5',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          Add Node
        </button>
        <button
          onClick={saveCanvas}
          style={{
            backgroundColor: '#3ac569',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          Save
        </button>
        <button
          onClick={loadCanvas}
          style={{
            backgroundColor: '#2271f5',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          Load
        </button>
        <button
          onClick={clearGroup}
          style={{
            backgroundColor: '#2271f5',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          Ungroup
        </button>
      </div>
      
      <ReactFlow
        nodes={processedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        style={{
          width: '100vw',
          height: '100vh',
          background: '#fafbfc'
        }}
      >
        <Background gap={28} size={2} />
        <Controls
          showInteractive={true}
          fitViewOptions={{ padding: 0.2 }}
          position="bottom-left"
          style={{ zIndex: 12 }}
        />
      </ReactFlow>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <ReactFlowProvider>
      <IdeaCanvas />
    </ReactFlowProvider>
  );
};

export default App;
import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  getConnectedEdges,
} from 'reactflow';
import { nanoid } from 'nanoid';
import CustomNode from './CustomNode';

import 'reactflow/dist/style.css';

// Constants for better maintainability
const CANVAS_WIDTH_RATIO = 0.7;
const CANVAS_HEIGHT_RATIO = 0.7;
const SAVE_KEY = 'ideaCanvasData';

// Hierarchy levels with colors
const HIERARCHY_LEVELS = {
  1: { name: 'Executive', color: '#ff6b6b', bgColor: '#ffe0e0' },
  2: { name: 'Management', color: '#4ecdc4', bgColor: '#e0fffe' },
  3: { name: 'Team Lead', color: '#45b7d1', bgColor: '#e0f4ff' },
  4: { name: 'Individual', color: '#96ceb4', bgColor: '#f0fff4' },
  5: { name: 'Task', color: '#feca57', bgColor: '#fff8e1' }
};

// Fixed initial nodes with hierarchy levels
const initialNodes = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 50 },
    data: { label: 'Project Vision', level: 1, group: null },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 100, y: 250 },
    data: { label: 'Development Phase', level: 2, group: null },
  },
];

const initialEdges = [{ 
  id: 'e1-2', 
  source: '1', 
  target: '2',
  sourceHandle: 's',
  targetHandle: 'n'
}];

// Helper function to calculate optimal connection point
const getOptimalHandle = (sourceNode, targetNode, sourceLevel, targetLevel) => {
  const dx = targetNode.position.x - sourceNode.position.x;
  const dy = targetNode.position.y - sourceNode.position.y;
  const angle = Math.atan2(dy, dx);
  
  // Convert angle to 0-2π range
  const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
  
  // 8 directional handles: N, NE, E, SE, S, SW, W, NW
  const handles = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
  const handleIndex = Math.round(normalizedAngle / (Math.PI / 4)) % 8;
  
  let sourceHandle = handles[handleIndex];
  let targetHandle = handles[(handleIndex + 4) % 8]; // Opposite direction
  
  // Hierarchy constraint: higher level nodes can only connect from SE, S, SW
  if (sourceLevel < targetLevel) { // Source is higher level
    const restrictedHandles = ['se', 's', 'sw'];
    if (!restrictedHandles.includes(sourceHandle)) {
      // Choose the closest restricted handle
      if (dx > 0) sourceHandle = 'se';
      else if (dx < 0) sourceHandle = 'sw';
      else sourceHandle = 's';
    }
  }
  
  return { sourceHandle, targetHandle };
};

function IdeaCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [hierarchyConstraints, setHierarchyConstraints] = useState(true);
  const [groups, setGroups] = useState({}); // groupId -> {nodes: [], position: {}, id: ''}

  // Node label change handler
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

  // Node level change handler
  const onNodeLevelChange = useCallback((nodeId, newLevel) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { 
            ...node, 
            data: { ...node.data, level: parseInt(newLevel) },
            style: {
              ...node.style,
              border: `3px solid ${HIERARCHY_LEVELS[newLevel].color}`,
              backgroundColor: HIERARCHY_LEVELS[newLevel].bgColor
            }
          };
        }
        return node;
      })
    );
    
    // Update edge handles based on new hierarchy
    setEdges((eds) => 
      eds.map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (sourceNode && targetNode) {
          const sourceLevel = edge.source === nodeId ? parseInt(newLevel) : sourceNode.data.level;
          const targetLevel = edge.target === nodeId ? parseInt(newLevel) : targetNode.data.level;
          const handles = getOptimalHandle(sourceNode, targetNode, sourceLevel, targetLevel);
          return {
            ...edge,
            sourceHandle: handles.sourceHandle,
            targetHandle: handles.targetHandle
          };
        }
        return edge;
      })
    );
  }, [setNodes, setEdges, nodes]);

  // Enhanced nodeTypes with hierarchy support
  const nodeTypes = useMemo(() => ({
    custom: (props) => <CustomNode 
      {...props} 
      data={{ 
        ...props.data, 
        onChange: onNodeLabelChange,
        onLevelChange: onNodeLevelChange,
        hierarchyLevels: HIERARCHY_LEVELS
      }} 
    />,
  }), [onNodeLabelChange, onNodeLevelChange]);

  // Enhanced node movement with hierarchy constraints
  const handleNodesChange = useCallback((changes) => {
    if (!hierarchyConstraints) {
      onNodesChange(changes);
      return;
    }

    const filteredChanges = changes.filter(change => {
      if (change.type === 'position' && change.position) {
        const node = nodes.find(n => n.id === change.id);
        if (!node) return true;

        // Check if this node is connected to any higher-level nodes
        const connectedEdges = getConnectedEdges([node], edges);
        for (const edge of connectedEdges) {
          const connectedNodeId = edge.source === node.id ? edge.target : edge.source;
          const connectedNode = nodes.find(n => n.id === connectedNodeId);
          
          if (connectedNode && connectedNode.data.level < node.data.level) {
            // This is a higher-level connected node
            if (change.position.y < connectedNode.position.y) {
              // Trying to move above a higher-level node - prevent this
              return false;
            }
          }
        }
      }
      return true;
    });

    onNodesChange(filteredChanges);
  }, [onNodesChange, hierarchyConstraints, nodes, edges]);

  // Enhanced connection handler with smart handle selection
  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    
    if (sourceNode && targetNode) {
      const handles = getOptimalHandle(
        sourceNode, 
        targetNode, 
        sourceNode.data.level, 
        targetNode.data.level
      );
      
      const newEdge = {
        ...params,
        sourceHandle: handles.sourceHandle,
        targetHandle: handles.targetHandle
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    }
  }, [setEdges, nodes]);

  // Add node with level selection
  const addNode = useCallback((level = 4) => {
    const newNode = {
      id: nanoid(),
      type: 'custom',
      position: {
        x: Math.random() * window.innerWidth * CANVAS_WIDTH_RATIO,
        y: Math.random() * window.innerHeight * CANVAS_HEIGHT_RATIO,
      },
      data: { label: 'New Idea', level: level, group: null },
      style: {
        border: `3px solid ${HIERARCHY_LEVELS[level].color}`,
        backgroundColor: HIERARCHY_LEVELS[level].bgColor
      }
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Group management
  const createGroup = useCallback(() => {
    if (selectedNodes.length < 2) {
      alert('Please select at least 2 nodes to create a group');
      return;
    }

    const groupId = nanoid();
    const groupNodes = nodes.filter(n => selectedNodes.includes(n.id));
    
    // Calculate group center
    const centerX = groupNodes.reduce((sum, n) => sum + n.position.x, 0) / groupNodes.length;
    const centerY = groupNodes.reduce((sum, n) => sum + n.position.y, 0) / groupNodes.length;
    
    setGroups(prev => ({
      ...prev,
      [groupId]: {
        id: groupId,
        nodes: selectedNodes,
        position: { x: centerX, y: centerY }
      }
    }));

    // Update nodes to reference their group
    setNodes(nds => 
      nds.map(node => 
        selectedNodes.includes(node.id) 
          ? { ...node, data: { ...node.data, group: groupId } }
          : node
      )
    );

    setSelectedNodes([]);
    alert(`Group created with ${selectedNodes.length} nodes`);
  }, [selectedNodes, nodes, setNodes]);

  const dissolveGroup = useCallback((groupId) => {
    setGroups(prev => {
      const newGroups = { ...prev };
      delete newGroups[groupId];
      return newGroups;
    });

    setNodes(nds => 
      nds.map(node => 
        node.data.group === groupId 
          ? { ...node, data: { ...node.data, group: null } }
          : node
      )
    );
  }, [setNodes]);

  // Bulk level change for selected nodes
  const changeSelectedNodesLevel = useCallback((newLevel) => {
    selectedNodes.forEach(nodeId => {
      onNodeLevelChange(nodeId, newLevel);
    });
  }, [selectedNodes, onNodeLevelChange]);

  // Save with hierarchy and groups
  const onSave = useCallback(() => {
    try {
      const flowData = { nodes, edges, groups, hierarchyConstraints };
      localStorage.setItem(SAVE_KEY, JSON.stringify(flowData));
      alert('Canvas Saved!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save: ' + error.message);
    }
  }, [nodes, edges, groups, hierarchyConstraints]);

  // Restore with hierarchy and groups
  const onRestore = useCallback(() => {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      
      if (savedData) {
        const flowData = JSON.parse(savedData);
        
        if (flowData.nodes && Array.isArray(flowData.nodes)) {
          setNodes(flowData.nodes);
          setEdges(flowData.edges || []);
          setGroups(flowData.groups || {});
          setHierarchyConstraints(flowData.hierarchyConstraints ?? true);
          alert('Canvas Restored!');
        } else {
          throw new Error('Invalid save data format');
        }
      } else {
        setNodes(initialNodes);
        setEdges(initialEdges);
        alert('No saved data found. Loaded initial example.');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Failed to restore: ' + error.message);
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [setNodes, setEdges]);

  // Node selection handler
  const onSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    setSelectedNodes(selectedNodes.map(n => n.id));
  }, []);

  return (
    <>
      <div className="controls-panel">
        <div className="controls-row">
          <button onClick={() => addNode(4)}>Add Idea Bubble</button>
          <select onChange={(e) => addNode(parseInt(e.target.value))} defaultValue="">
            <option value="" disabled>Add by Level</option>
            {Object.entries(HIERARCHY_LEVELS).map(([level, info]) => (
              <option key={level} value={level}>{info.name}</option>
            ))}
          </select>
        </div>
        
        <div className="controls-row">
          <button onClick={createGroup} disabled={selectedNodes.length < 2}>
            Group Selected ({selectedNodes.length})
          </button>
          <select 
            onChange={(e) => changeSelectedNodesLevel(e.target.value)} 
            disabled={selectedNodes.length === 0}
            defaultValue=""
          >
            <option value="" disabled>Set Level for Selected</option>
            {Object.entries(HIERARCHY_LEVELS).map(([level, info]) => (
              <option key={level} value={level}>{info.name}</option>
            ))}
          </select>
        </div>

        <div className="controls-row">
          <label>
            <input 
              type="checkbox" 
              checked={hierarchyConstraints}
              onChange={(e) => setHierarchyConstraints(e.target.checked)}
            />
            Hierarchy Movement Constraints
          </label>
        </div>

        <div className="controls-row">
          <button onClick={onSave} className="save-button">Save</button>
          <button onClick={onRestore} className="restore-button">Restore</button>
        </div>
      </div>

      {/* Groups Panel */}
      {Object.keys(groups).length > 0 && (
        <div className="groups-panel">
          <h4>Groups</h4>
          {Object.values(groups).map(group => (
            <div key={group.id} className="group-item">
              <span>Group ({group.nodes.length} nodes)</span>
              <button onClick={() => dissolveGroup(group.id)}>Dissolve</button>
            </div>
          ))}
        </div>
      )}

      {/* Hierarchy Legend */}
      <div className="hierarchy-legend">
        <h4>Hierarchy Levels</h4>
        {Object.entries(HIERARCHY_LEVELS).map(([level, info]) => (
          <div key={level} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: info.color }}
            ></div>
            <span>{level}. {info.name}</span>
          </div>
        ))}
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        multiSelectionKeyCode="Shift"
        fitView
      >
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </>
  );
}

export default IdeaCanvas;
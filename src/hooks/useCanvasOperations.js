import { useState, useCallback, useMemo } from 'react';
import { addEdge, MarkerType } from 'reactflow';

const useCanvasOperations = ({ 
  nodes, 
  edges, 
  setNodes, 
  setEdges, 
  hierarchyLevels, 
  showHierarchy,
  nextId,
  setNextId,
  onNodeLabelChange,
  onNodeLevelChange,
  openTextEditDialog // Add text editor dialog handler
}) => {
  const [selectedElements, setSelectedElements] = useState({ nodes: [], edges: [] });
  const [nodeDragStates, setNodeDragStates] = useState({}); // Track drag states for nodes

  // Handle drag state changes from CustomNode components
  const handleNodeDragStateChange = useCallback((nodeId, isDragEnabled) => {
    setNodeDragStates(prev => ({
      ...prev,
      [nodeId]: isDragEnabled
    }));
  }, []);

  // Handle text editor opening from CustomNode components
  const handleOpenTextEditor = useCallback((nodeId, currentLabel) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && openTextEditDialog) {
      openTextEditDialog(nodeId, currentLabel);
    }
  }, [nodes, openTextEditDialog]);

  // Handle selection changes - Use ReactFlow's built-in selection system
  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedElements({ nodes: nodes || [], edges: edges || [] });
  }, []);

  // Connection validation
  const isValidConnection = useCallback((connection) => {
    console.log('Connection attempt:', connection);
    
    // Prevent self-connections
    if (connection.source === connection.target) {
      console.log('Rejected: self-connection');
      return false;
    }
    
    // Check if connection already exists
    const connectionExists = edges.some(edge => 
      edge.source === connection.source && 
      edge.target === connection.target &&
      edge.sourceHandle === connection.sourceHandle &&
      edge.targetHandle === connection.targetHandle
    );
    
    if (connectionExists) {
      console.log('Rejected: connection already exists');
      return false;
    }
    
    console.log('Accepted: valid connection');
    return true;
  }, [edges]);

  // Connection handler
  const onConnect = useCallback((params) => {
    console.log('Creating connection:', params);
    const newEdge = {
      ...params,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    };
    setEdges((eds) => addEdge(newEdge, eds));
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
        hierarchyLevels,
        showHierarchy,
      },
      style: { width: 180 }
    };
    setNodes(nodes => [...nodes, newNode]);
    setNextId(prev => prev + 1);
  }, [setNodes, nextId, hierarchyLevels, showHierarchy, setNextId]);

  // Delete selected elements
  const handleDeleteSelected = useCallback(() => {
    const selectedNodeIds = selectedElements.nodes.map(n => n.id);
    const selectedEdgeIds = selectedElements.edges.map(e => e.id);
    
    if (selectedEdgeIds.length > 0) {
      setEdges(edges => edges.filter(edge => !selectedEdgeIds.includes(edge.id)));
    }
    if (selectedNodeIds.length > 0) {
      setNodes(nodes => nodes.filter(node => !selectedNodeIds.includes(node.id)));
      setEdges(edges => edges.filter(edge => 
        !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
      ));
    }
  }, [selectedElements, setEdges, setNodes]);

  // Clear selection (ReactFlow handles this automatically)
  const clearSelection = useCallback(() => {
    // ReactFlow will handle clearing selection automatically
  }, []);  // Prepare nodes with proper data and event handlers
  const processedNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      // Dynamically set draggable based on node's drag state
      draggable: nodeDragStates[node.id] !== false, // Default to true, only false if explicitly set
      data: {
        ...node.data,
        onLabelChange: onNodeLabelChange,
        onLevelChange: onNodeLevelChange,
        onDragStateChange: handleNodeDragStateChange,
        onOpenTextEditor: handleOpenTextEditor,
        hierarchyLevels,
        showHierarchy,
      }
    }));
  }, [nodes, onNodeLabelChange, onNodeLevelChange, hierarchyLevels, showHierarchy, nodeDragStates, handleNodeDragStateChange, handleOpenTextEditor]);

  // Prepare edges with proper styling
  const processedEdges = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      style: {
        ...edge.style,
        stroke: '#b1b1b7',
        strokeWidth: 2,
      }
    }));
  }, [edges]);

  // Pane click handler (ReactFlow handles selection clearing)
  const handlePaneClick = useCallback(() => {
    // ReactFlow handles clearing selection automatically
  }, []);

  return {
    selectedElements,
    onSelectionChange,
    isValidConnection,
    onConnect,
    handleAddNode,
    handleDeleteSelected,
    clearSelection,
    processedNodes,
    processedEdges,
    handlePaneClick
  };
};

export default useCanvasOperations;

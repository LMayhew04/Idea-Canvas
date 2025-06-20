import { debounce } from 'lodash';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
import ErrorBoundary from './ErrorBoundary';
import CustomNode from './CustomNode';
import useCanvasHistory from '../hooks/useCanvasHistory';

// Hierarchy Settings Modal Component
const HierarchyModal = ({ isOpen, onClose, hierarchyLevels, onUpdateHierarchy, showHierarchy, onToggleHierarchy }) => {
  const [tempLevels, setTempLevels] = useState(hierarchyLevels);

  const handleLevelNameChange = (levelNum, newName) => {
    setTempLevels(prev => ({
      ...prev,
      [levelNum]: { ...prev[levelNum], name: newName }
    }));
  };

  const handleSave = () => {
    onUpdateHierarchy(tempLevels);
    onClose();
  };

  const handleCancel = () => {
    setTempLevels(hierarchyLevels);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        minWidth: '400px',
        maxWidth: '500px'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: 600 }}>
          Hierarchy Settings
        </h2>
        
        {/* Show Hierarchy Toggle */}
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <input
            type="checkbox"
            id="showHierarchy"
            checked={showHierarchy}
            onChange={(e) => onToggleHierarchy(e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
          <label htmlFor="showHierarchy" style={{ fontSize: '14px', fontWeight: 500 }}>
            Show hierarchy levels on nodes
          </label>
        </div>

        {/* Level Name Editors */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 500 }}>
            Level Names:
          </h3>
          {Object.entries(tempLevels).map(([levelNum, levelData]) => (
            <div key={levelNum} style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              gap: '12px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: levelData.color,
                borderRadius: '4px',
                flexShrink: 0
              }}></div>
              <span style={{ minWidth: '80px', fontSize: '14px' }}>Level {levelNum}:</span>
              <input
                type="text"
                value={levelData.name}
                onChange={(e) => handleLevelNameChange(levelNum, e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#2271f5',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>  );
};

// Main IdeaCanvas Component
const IdeaCanvas = () => {
  const [HIERARCHY_LEVELS, setHierarchyLevels] = useState({
    1: { name: 'Executive', color: '#ff6b6b', bgColor: '#ffe0e0' },
    2: { name: 'Management', color: '#4ecdc4', bgColor: '#e0fffe' },
    3: { name: 'Team Lead', color: '#45b7d1', bgColor: '#e0f4ff' },
    4: { name: 'Individual', color: '#96ceb4', bgColor: '#f0fff4' },
    5: { name: 'Task', color: '#feca57', bgColor: '#fff8e1' }
  });
  const [showHierarchy, setShowHierarchy] = useState(true);
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const initialNodes = [
    {
      id: '1',
      type: 'custom',
      position: { x: 250, y: 50 },
      data: {
        label: 'Project Vision',
        level: 1,
        hierarchyLevels: HIERARCHY_LEVELS,
        showHierarchy: showHierarchy,
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
        showHierarchy: showHierarchy,
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
        showHierarchy: showHierarchy,
      },
      style: { width: 180 }
    },
  ];

  const initialEdges = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      sourceHandle: 's',
      targetHandle: 'n_target',
      type: 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    },
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      sourceHandle: 's',
      targetHandle: 'n_target',
      type: 'default',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    },
  ];

  const nodeTypes = { custom: CustomNode };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedElements, setSelectedElements] = useState({ nodes: [], edges: [] });
  const [nextId, setNextId] = useState(4);

  // Node label change handler
  const onNodeLabelChange = useCallback((id, value) => {
    setNodes(nds => nds.map(node => {
      if (node.id === id) {
        return {
          ...node,
          data: {
            ...node.data,
            label: value
          }
        };
      }
      return node;
    }));
  }, [setNodes]);

  // Node level change handler
  const onNodeLevelChange = useCallback((id, value) => {
    setNodes(nds => nds.map(node => {
      if (node.id === id) {
        return {
          ...node,
          data: {
            ...node.data,
            level: parseInt(value)
          }
        };
      }
      return node;
    }));
  }, [setNodes]);

  // Canvas history management using custom hook
  const { addToHistory, handleUndo, handleRedo, canUndo, canRedo } = useCanvasHistory({
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodeLabelChange,
    onNodeLevelChange,
    hierarchyLevels: HIERARCHY_LEVELS,
    showHierarchy
  });
  // Add nodes to history when they change - Only after initialization
  useEffect(() => {
    if (!isInitialized || isLoading) return;
    
    if (nodes.length > 0) {
      addToHistory(nodes, edges);
    }
  }, [nodes, edges, addToHistory, isInitialized, isLoading]);

  // Update hierarchy levels
  const onUpdateHierarchy = useCallback((newLevels) => {
    setHierarchyLevels(newLevels);
    // Update all nodes with new hierarchy levels
    setNodes(prev => prev.map(node => ({
      ...node,
      data: { ...node.data, hierarchyLevels: newLevels }
    })));
  }, [setNodes]);

  // Toggle hierarchy display
  const onToggleHierarchy = useCallback((show) => {
    setShowHierarchy(show);
    // Update all nodes with new hierarchy visibility
    setNodes(prev => prev.map(node => ({
      ...node,
      data: { ...node.data, showHierarchy: show }
    })));
  }, [setNodes]);
  // Handle selection changes - Use ReactFlow's built-in selection system
  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedElements({ nodes: nodes || [], edges: edges || [] });
  }, []);

  // Connection validation (for debugging)
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
        hierarchyLevels: HIERARCHY_LEVELS,
        showHierarchy: showHierarchy,
      },
      style: { width: 180 }
    };
    setNodes(nodes => [...nodes, newNode]);
    setNextId(prev => prev + 1);
  }, [setNodes, nextId, HIERARCHY_LEVELS, showHierarchy]);
  // Delete selected edges and nodes
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
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((evt) => {
    const selectedNodeIds = selectedElements.nodes.map(n => n.id);
    const selectedEdgeIds = selectedElements.edges.map(e => e.id);
    
    if ((evt.key === 'Delete' || evt.key === 'Backspace') && (selectedEdgeIds.length > 0 || selectedNodeIds.length > 0)) {
      // Don't delete if user is typing in an input field
      if (evt.target.tagName === 'TEXTAREA' || evt.target.tagName === 'INPUT' || evt.target.tagName === 'SELECT') {
        return;
      }
      evt.preventDefault();
      handleDeleteSelected();
    }
  }, [selectedElements, handleDeleteSelected]);

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Save canvas with localStorage support
  const [savedData, setSavedData] = useState(null);
  const saveCanvas = useCallback(async () => {
    setIsSaving(true);
    try {
      const dataToSave = { 
        nodes, 
        edges, 
        hierarchyLevels: HIERARCHY_LEVELS, 
        showHierarchy,
        nextId 
      };
      setSavedData(dataToSave);
      await localStorage.setItem('ideaCanvas', JSON.stringify(dataToSave));
      alert('Canvas saved successfully!');
    } catch (error) {
      console.error('Error saving canvas:', error);
      alert('Failed to save canvas. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, HIERARCHY_LEVELS, showHierarchy, nextId]);

  // Load canvas with localStorage support
  const loadCanvas = useCallback(() => {
    try {
      const storedData = localStorage.getItem('ideaCanvas');
      const dataToLoad = storedData ? JSON.parse(storedData) : savedData;
      
      if (dataToLoad) {
        const loadedNodes = dataToLoad.nodes.map(node => ({
          ...node,
          type: 'custom',
          data: {
            ...node.data,
            hierarchyLevels: dataToLoad.hierarchyLevels || HIERARCHY_LEVELS,
            showHierarchy: dataToLoad.showHierarchy !== undefined ? dataToLoad.showHierarchy : showHierarchy,
          }
        }));
        setNodes(loadedNodes);
        setEdges(dataToLoad.edges);
        if (dataToLoad.hierarchyLevels) {
          setHierarchyLevels(dataToLoad.hierarchyLevels);
        }
        if (dataToLoad.showHierarchy !== undefined) {
          setShowHierarchy(dataToLoad.showHierarchy);
        }
        if (dataToLoad.nextId) {
          setNextId(dataToLoad.nextId);
        }
        alert('Canvas loaded successfully!');
      } else {
        setNodes(initialNodes);
        setEdges(initialEdges);
        alert('No saved data found. Loaded default canvas.');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      alert('Failed to load canvas from localStorage.');
    }
  }, [savedData, setNodes, setEdges, HIERARCHY_LEVELS, showHierarchy]);
  // Clear selection - No longer needed as ReactFlow handles this
  const clearSelection = useCallback(() => {
    // ReactFlow will handle clearing selection automatically
  }, []);
  // Prepare nodes with proper data and event handlers
  const processedNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onChange: onNodeLabelChange,
        onLevelChange: onNodeLevelChange,
        hierarchyLevels: HIERARCHY_LEVELS,        showHierarchy: showHierarchy,
      }
    }));
  }, [nodes, onNodeLabelChange, onNodeLevelChange, HIERARCHY_LEVELS, showHierarchy]);

  // Prepare edges with proper data - ReactFlow handles selection state
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

  // Pane click handler - ReactFlow handles clearing selection
  const handlePaneClick = useCallback(() => {
    // ReactFlow handles clearing selection automatically
  }, []);

  // Virtualization settings
  const nodeVisibilityThreshold = 500; // pixels
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
    // Debounced save function
  const debouncedSave = useMemo(
    () => debounce((data) => {
      if (!isInitialized || isLoading) return;
      
      try {
        localStorage.setItem('ideaCanvas_autosave', JSON.stringify(data));
        console.log('Auto-saved canvas');
      } catch (error) {
        console.error('Error auto-saving:', error);
      }
    }, 1000), // 1 second delay
    [isInitialized, isLoading]
  );

  // Cleanup debounced function
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);  // Use all processed nodes (viewport optimization disabled to prevent errors)
  const visibleNodes = processedNodes;  // Handle viewport changes
  const onViewportChange = useCallback((newViewport) => {
    setViewport(newViewport);
  }, []);

  // Debounced node change handler
  const debouncedNodeChange = useMemo(
    () => debounce((changes) => {
      onNodesChange(changes);
    }, 16), // Approximately 1 frame at 60fps
    [onNodesChange]
  );

  // Cleanup node change handler
  useEffect(() => {
    return () => {
      debouncedNodeChange.cancel();
    };
  }, [debouncedNodeChange]);
  // Update auto-save to use debounced function - Only after initialization
  useEffect(() => {
    if (!isInitialized || isLoading) return;
    
    const dataToSave = {
      nodes,
      edges,
      hierarchyLevels: HIERARCHY_LEVELS,
      showHierarchy,
      nextId
    };
    debouncedSave(dataToSave);
  }, [nodes, edges, HIERARCHY_LEVELS, showHierarchy, nextId, debouncedSave, isInitialized, isLoading]);
  // Initialize canvas - Single consolidated initialization effect
  useEffect(() => {
    const initializeCanvas = async () => {
      if (isInitialized) return; // Prevent re-initialization
      
      try {
        setIsLoading(true);
        
        // Check for auto-saved data first
        const autoSavedData = localStorage.getItem('ideaCanvas_autosave');
        if (autoSavedData) {
          const shouldRestore = window.confirm(
            'Found auto-saved data. Would you like to restore it?'
          );
          if (shouldRestore) {
            const parsedData = JSON.parse(autoSavedData);
            setNodes(parsedData.nodes.map(node => ({
              ...node,
              type: 'custom',
              data: {
                ...node.data,
                hierarchyLevels: parsedData.hierarchyLevels,
                showHierarchy: parsedData.showHierarchy,
              }
            })));
            setEdges(parsedData.edges);
            setHierarchyLevels(parsedData.hierarchyLevels);
            setShowHierarchy(parsedData.showHierarchy);
            if (parsedData.nextId) {
              setNextId(parsedData.nextId);
            }
            setIsLoading(false);
            setIsInitialized(true);
            return;
          }
        }
        
        // Otherwise check for regular saved data
        const storedData = localStorage.getItem('ideaCanvas');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setNodes(parsedData.nodes.map(node => ({
            ...node,
            type: 'custom',
            data: {
              ...node.data,
              hierarchyLevels: parsedData.hierarchyLevels,
              showHierarchy: parsedData.showHierarchy,
            }
          })));
          setEdges(parsedData.edges);
          setHierarchyLevels(parsedData.hierarchyLevels);
          setShowHierarchy(parsedData.showHierarchy);
          if (parsedData.nextId) {
            setNextId(parsedData.nextId);
          }
        }
      } catch (error) {
        console.error('Error initializing canvas:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeCanvas();
  }, []); // Empty dependency array - run only once

  // Export/Import functions
  const handleExport = useCallback(() => {
    const exportData = {
      version: "1.0.0",
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        title: "Ideas Canvas Export"
      },
      content: {
        nodes,
        edges,
        hierarchyLevels: HIERARCHY_LEVELS,
        settings: {
          showHierarchy
        }
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ideas-canvas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges, HIERARCHY_LEVELS, showHierarchy]);

  const handleImport = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate import data structure
        if (!importData.version || !importData.content) {
          throw new Error('Invalid file format');
        }

        // Version compatibility check
        if (importData.version !== "1.0.0") {
          console.warn('Different version detected, attempting import anyway');
        }

        // Import nodes with proper type and data structure
        const importedNodes = importData.content.nodes.map(node => ({
          ...node,
          type: 'custom',
          data: {
            ...node.data,
            hierarchyLevels: importData.content.hierarchyLevels,
            showHierarchy: importData.content.settings.showHierarchy,
            onChange: onNodeLabelChange,
            onLevelChange: onNodeLevelChange
          }
        }));

        setNodes(importedNodes);
        setEdges(importData.content.edges);
        setHierarchyLevels(importData.content.hierarchyLevels);
        setShowHierarchy(importData.content.settings.showHierarchy);

        // Update nextId to prevent ID conflicts
        const maxId = Math.max(...importedNodes.map(n => parseInt(n.id)));
        setNextId(maxId + 1);

        alert('Canvas imported successfully!');
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import canvas. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input value to allow importing the same file again
    event.target.value = '';
  }, [onNodeLabelChange, onNodeLevelChange]);

  // Add import input ref
  const importInputRef = useRef(null);

  // Trigger import dialog
  const triggerImport = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#fafbfc' }}>
      {/* Controls Panel */}
      <div className="controls-panel">
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
          onClick={() => setIsHierarchyModalOpen(true)}
          style={{
            backgroundColor: '#9c27b0',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          Hierarchy Settings
        </button>        <button
          onClick={handleDeleteSelected}
          disabled={selectedElements.nodes.length === 0 && selectedElements.edges.length === 0}
          style={{
            backgroundColor: selectedElements.nodes.length > 0 || selectedElements.edges.length > 0 ? '#ff6b6b' : '#ccc',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 5,
            cursor: selectedElements.nodes.length > 0 || selectedElements.edges.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          Delete Selected
        </button>
        <button
          onClick={saveCanvas}
          className="save-button"
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
          onClick={clearSelection}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          Clear Selection
        </button>
        <button
          onClick={handleExport}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          Export Canvas
        </button>
        <button
          onClick={triggerImport}
          style={{
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          Import Canvas
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>      {/* Selection Info */}
      {(selectedElements.nodes.length > 0 || selectedElements.edges.length > 0) && (
        <div style={{
          position: 'absolute',
          top: 70,
          left: 15,
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: 8,
          borderRadius: 6,
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          fontSize: 12,
          color: '#666'
        }}>
          {selectedElements.nodes.length > 0 && `${selectedElements.nodes.length} node(s) selected`}
          {selectedElements.edges.length > 0 && `${selectedElements.edges.length} edge(s) selected`}
          <div style={{ fontSize: 11, marginTop: 4 }}>
            Press Delete or Backspace to remove selected items
          </div>
        </div>
      )}      <ReactFlow
        nodes={visibleNodes}
        edges={processedEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onPaneClick={handlePaneClick}
        isValidConnection={isValidConnection}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={['Delete', 'Backspace']}
        multiSelectionKeyCode={['Control', 'Meta']}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
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

      {/* Hierarchy Settings Modal */}
      <HierarchyModal
        isOpen={isHierarchyModalOpen}
        onClose={() => setIsHierarchyModalOpen(false)}
        hierarchyLevels={HIERARCHY_LEVELS}
        onUpdateHierarchy={onUpdateHierarchy}
        showHierarchy={showHierarchy}
        onToggleHierarchy={onToggleHierarchy}
      />
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <ReactFlowProvider>
        <IdeaCanvas />
      </ReactFlowProvider>
    </ErrorBoundary>
  );
};

export default App;
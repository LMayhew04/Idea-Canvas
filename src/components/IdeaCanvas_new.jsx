import { debounce } from 'lodash';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ErrorBoundary from './ErrorBoundary';
import CustomNode from './CustomNode';
import TextEditDialog from './TextEditDialog';
import HierarchyModal from './HierarchyModal';
import HierarchyLegend from './HierarchyLegend';
import ControlsPanel from './ControlsPanel';
import SelectionInfo from './SelectionInfo';

// Main IdeaCanvas Component - All hooks consolidated
const IdeaCanvas = () => {
  // ====== CORE STATE ======
  const [HIERARCHY_LEVELS, setHierarchyLevels] = useState({
    1: { name: 'Executive', color: '#ff6b6b', bgColor: '#ffe0e0' },
    2: { name: 'Management', color: '#4ecdc4', bgColor: '#e0fffe' },
    3: { name: 'Team Lead', color: '#45b7d1', bgColor: '#e0f4ff' },
    4: { name: 'Individual', color: '#96ceb4', bgColor: '#f0fff4' },
    5: { name: 'Task', color: '#feca57', bgColor: '#fff8e1' }
  });
  const [showHierarchy, setShowHierarchy] = useState(false);
  const [nextId, setNextId] = useState(4);

  // ====== INITIALIZATION STATE ======
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // ====== MODAL STATE ======
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
  const [textEditDialog, setTextEditDialog] = useState({
    isOpen: false,
    nodeId: null,
    currentText: ''
  });

  // ====== SELECTION STATE ======
  const [selectedElements, setSelectedElements] = useState({ nodes: [], edges: [] });

  // ====== PERSISTENCE STATE ======
  const [isSaving, setIsSaving] = useState(false);
  const importInputRef = useRef(null);

  // ====== HISTORY STATE ======
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initial data
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
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      sourceHandle: 's',
      targetHandle: 'n_target',
      type: 'default',
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ];

  const nodeTypes = { custom: CustomNode };
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ====== MODAL HANDLERS ======
  const openHierarchyModal = useCallback(() => {
    setIsHierarchyModalOpen(true);
  }, []);

  const closeHierarchyModal = useCallback(() => {
    setIsHierarchyModalOpen(false);
  }, []);

  const openTextEditDialog = useCallback((nodeId, currentText) => {
    setTextEditDialog({
      isOpen: true,
      nodeId,
      currentText
    });
  }, []);

  const closeTextEditDialog = useCallback(() => {
    setTextEditDialog({
      isOpen: false,
      nodeId: null,
      currentText: ''
    });
  }, []);

  const saveTextEdit = useCallback((nodeId, newText, onNodeLabelChange) => {
    onNodeLabelChange(nodeId, newText);
    closeTextEditDialog();
  }, [closeTextEditDialog]);

  // ====== NODE HANDLERS ======
  const onNodeLabelChange = useCallback((id, value) => {
    setNodes(currentNodes => {
      const newNodes = currentNodes.map(node => {
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
      });
      return newNodes;
    });
  }, [setNodes]);

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

  // ====== HIERARCHY HANDLERS ======
  const onUpdateHierarchy = useCallback((newLevels) => {
    setHierarchyLevels(newLevels);
    setNodes(prev => prev.map(node => ({
      ...node,
      data: { ...node.data, hierarchyLevels: newLevels }
    })));
  }, [setNodes]);

  const onToggleHierarchy = useCallback((show) => {
    setShowHierarchy(show);
    setNodes(prev => prev.map(node => ({
      ...node,
      data: { ...node.data, showHierarchy: show }
    })));
  }, [setNodes]);

  // ====== CANVAS OPERATIONS ======
  const handleTextEdit = useCallback((nodeId, newText) => {
    saveTextEdit(nodeId, newText, onNodeLabelChange);
  }, [saveTextEdit, onNodeLabelChange]);

  const handleLegendLevelClick = useCallback((levelNum) => {
    const selectedNodes = selectedElements.nodes;
    if (selectedNodes.length === 0) return;

    const selectedNodeIds = selectedNodes.map(node => node.id);
    selectedNodeIds.forEach(nodeId => {
      onNodeLevelChange(nodeId, levelNum);
    });
  }, [selectedElements, onNodeLevelChange]);

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedElements({ nodes: nodes || [], edges: edges || [] });
  }, []);

  const isValidConnection = useCallback((connection) => {
    // Prevent self-connections
    if (connection.source === connection.target) {
      return false;
    }
    
    // Check for existing connections
    const existingEdge = edges.find(edge => 
      edge.source === connection.source && 
      edge.target === connection.target
    );
    
    return !existingEdge;
  }, [edges]);

  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      type: 'default',
      markerEnd: { type: MarkerType.ArrowClosed },
    };
    setEdges(eds => addEdge(newEdge, eds));
  }, [setEdges]);

  const handleAddNode = useCallback(() => {
    const newNode = {
      id: nextId.toString(),
      type: 'custom',
      position: { 
        x: Math.random() * 300 + 200, 
        y: Math.random() * 300 + 200 
      },
      data: {
        label: 'New Idea',
        level: 4,
        hierarchyLevels: HIERARCHY_LEVELS,
        showHierarchy: showHierarchy,
        onOpenTextEditor: openTextEditDialog
      },
      style: { width: 180 }
    };
    
    setNodes(nds => [...nds, newNode]);
    setNextId(prev => prev + 1);
  }, [nextId, HIERARCHY_LEVELS, showHierarchy, setNodes, openTextEditDialog]);

  const handleDeleteSelected = useCallback(() => {
    const selectedNodeIds = selectedElements.nodes.map(n => n.id);
    const selectedEdgeIds = selectedElements.edges.map(e => e.id);
    
    if (selectedNodeIds.length > 0) {
      setNodes(nds => nds.filter(node => !selectedNodeIds.includes(node.id)));
      setEdges(eds => eds.filter(edge => 
        !selectedNodeIds.includes(edge.source) && 
        !selectedNodeIds.includes(edge.target)
      ));
    }
    
    if (selectedEdgeIds.length > 0) {
      setEdges(eds => eds.filter(edge => !selectedEdgeIds.includes(edge.id)));
    }
    
    setSelectedElements({ nodes: [], edges: [] });
  }, [selectedElements, setNodes, setEdges]);

  const clearSelection = useCallback(() => {
    setSelectedElements({ nodes: [], edges: [] });
  }, []);

  const handlePaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // ====== PROCESSED NODES/EDGES ======
  const processedNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        hierarchyLevels: HIERARCHY_LEVELS,
        showHierarchy: showHierarchy,
        onOpenTextEditor: openTextEditDialog,
        onEditText: openTextEditDialog
      }
    }));
  }, [nodes, HIERARCHY_LEVELS, showHierarchy, openTextEditDialog]);

  const processedEdges = useMemo(() => edges, [edges]);

  // ====== KEYBOARD SHORTCUTS ======
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

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ====== PERSISTENCE ======
  const saveCanvas = useCallback(() => {
    const canvasData = {
      nodes,
      edges,
      hierarchyLevels: HIERARCHY_LEVELS,
      showHierarchy,
      nextId
    };
    localStorage.setItem('ideaCanvas_save', JSON.stringify(canvasData));
    
    // Auto-save as well
    localStorage.setItem('ideaCanvas_autosave', JSON.stringify(canvasData));
    
    alert('Canvas saved successfully!');
  }, [nodes, edges, HIERARCHY_LEVELS, showHierarchy, nextId]);

  const loadCanvas = useCallback(() => {
    const savedData = localStorage.getItem('ideaCanvas_save');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
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
      alert('Canvas loaded successfully!');
    } else {
      alert('No saved canvas found!');
    }
  }, [setNodes, setEdges]);

  const handleExport = useCallback(() => {
    const canvasData = {
      nodes,
      edges,
      hierarchyLevels: HIERARCHY_LEVELS,
      showHierarchy,
      nextId
    };
    const blob = new Blob([JSON.stringify(canvasData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'idea-canvas.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, HIERARCHY_LEVELS, showHierarchy, nextId]);

  const handleImport = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedData = JSON.parse(e.target.result);
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
          alert('Canvas imported successfully!');
        } catch (error) {
          alert('Error importing canvas: Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  }, [setNodes, setEdges]);

  const triggerImport = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  // ====== HISTORY ======
  const addToHistory = useCallback((currentNodes, currentEdges) => {
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges))
    };
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(snapshot);
      return newHistory.slice(-20); // Keep last 20 states
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Debounced history tracking
  const debouncedAddToHistory = useMemo(
    () => debounce((currentNodes, currentEdges) => {
      addToHistory(currentNodes, currentEdges);
    }, 750),
    [addToHistory]
  );

  useEffect(() => {
    if (!isInitialized || isLoading) return;
    
    if (nodes.length > 0) {
      debouncedAddToHistory(nodes, edges);
    }
  }, [nodes, edges, debouncedAddToHistory, isInitialized, isLoading]);

  useEffect(() => {
    return () => {
      debouncedAddToHistory.cancel();
    };
  }, [debouncedAddToHistory]);

  // ====== INITIALIZATION ======
  useEffect(() => {
    const initializeCanvas = async () => {
      if (isInitialized) return;
      
      try {
        setIsLoading(true);
        
        // Check for auto-saved data
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

        // No auto-saved data, use initial data
        setNodes(initialNodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            hierarchyLevels: HIERARCHY_LEVELS,
            showHierarchy: showHierarchy,
          }
        })));
        setEdges(initialEdges);
        
        setIsLoading(false);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing canvas:', error);
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeCanvas();
  }, [isInitialized, HIERARCHY_LEVELS, showHierarchy, setNodes, setEdges]);

  // Auto-save effect
  useEffect(() => {
    if (!isInitialized || isLoading) return;
    
    const autoSaveInterval = setInterval(() => {
      const canvasData = {
        nodes,
        edges,
        hierarchyLevels: HIERARCHY_LEVELS,
        showHierarchy,
        nextId
      };
      localStorage.setItem('ideaCanvas_autosave', JSON.stringify(canvasData));
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [nodes, edges, HIERARCHY_LEVELS, showHierarchy, nextId, isInitialized, isLoading]);

  // ====== RENDER ======
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#fafbfc' }}>
      {/* Controls Panel */}
      <ControlsPanel
        onAddNode={handleAddNode}
        onOpenHierarchySettings={openHierarchyModal}
        onDeleteSelected={handleDeleteSelected}
        selectedElements={selectedElements}
        onSave={saveCanvas}
        onLoad={loadCanvas}
        onClearSelection={clearSelection}
        onExport={handleExport}
        onImportFile={handleImport}
        onTriggerImport={triggerImport}
        importInputRef={importInputRef}
      />

      {/* Selection Info */}
      <SelectionInfo selectedElements={selectedElements} />

      {/* Hierarchy Legend - Show when hierarchy is enabled */}
      {showHierarchy && (
        <HierarchyLegend 
          hierarchyLevels={HIERARCHY_LEVELS}
          onLevelClick={handleLegendLevelClick}
          selectedNodes={selectedElements.nodes}
        />
      )}

      <ReactFlow
        nodes={processedNodes}
        edges={processedEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onPaneClick={handlePaneClick}
        isValidConnection={isValidConnection}
        fitView
        fitViewOptions={{ padding: 0.05, includeHiddenNodes: true }}
        deleteKeyCode={['Delete', 'Backspace']}
        multiSelectionKeyCode={['Control', 'Meta']}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        nodesFocusable={true}
        edgesFocusable={true}
        disableKeyboardA11y={false}
        style={{
          width: '100vw',
          height: '100vh',
          background: '#fafbfc'
        }}
      >
        <Background gap={28} size={2} />
        <Controls
          showInteractive={true}
          fitViewOptions={{ padding: 0.05 }}
          position="bottom-left"
          style={{ zIndex: 12 }}
        />
      </ReactFlow>

      {/* Hierarchy Settings Modal */}
      <HierarchyModal
        isOpen={isHierarchyModalOpen}
        onClose={closeHierarchyModal}
        hierarchyLevels={HIERARCHY_LEVELS}
        onUpdateHierarchy={onUpdateHierarchy}
        showHierarchy={showHierarchy}
        onToggleHierarchy={onToggleHierarchy}
      />

      {/* Text Edit Dialog */}
      <TextEditDialog
        isOpen={textEditDialog.isOpen}
        nodeId={textEditDialog.nodeId}
        currentText={textEditDialog.currentText}
        onSave={handleTextEdit}
        onCancel={closeTextEditDialog}
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

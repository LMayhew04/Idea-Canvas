import { debounce } from 'lodash';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ErrorBoundary from './ErrorBoundary';
import CustomNode from './CustomNode';
import TextEditDialog from './TextEditDialog';
import HierarchyModal from './HierarchyModal';
import ControlsPanel from './ControlsPanel';
import SelectionInfo from './SelectionInfo';
import useCanvasHistory from '../hooks/useCanvasHistory';
import useCanvasPersistence from '../hooks/useCanvasPersistence';
import useModalManager from '../hooks/useModalManager';
import useCanvasOperations from '../hooks/useCanvasOperations';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import useCanvasInitialization from '../hooks/useCanvasInitialization';

// Main IdeaCanvas Component
const IdeaCanvas = () => {
  // Core canvas state
  const [HIERARCHY_LEVELS, setHierarchyLevels] = useState({
    1: { name: 'Executive', color: '#ff6b6b', bgColor: '#ffe0e0' },
    2: { name: 'Management', color: '#4ecdc4', bgColor: '#e0fffe' },
    3: { name: 'Team Lead', color: '#45b7d1', bgColor: '#e0f4ff' },
    4: { name: 'Individual', color: '#96ceb4', bgColor: '#f0fff4' },
    5: { name: 'Task', color: '#feca57', bgColor: '#fff8e1' }
  });
  const [showHierarchy, setShowHierarchy] = useState(true);
  const [nextId, setNextId] = useState(4);

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

  const initialEdges = [    {
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

  // Node change handlers
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

  // Update hierarchy levels
  const onUpdateHierarchy = useCallback((newLevels) => {
    setHierarchyLevels(newLevels);
    setNodes(prev => prev.map(node => ({
      ...node,
      data: { ...node.data, hierarchyLevels: newLevels }
    })));
  }, [setNodes]);

  // Toggle hierarchy display
  const onToggleHierarchy = useCallback((show) => {
    setShowHierarchy(show);
    setNodes(prev => prev.map(node => ({
      ...node,
      data: { ...node.data, showHierarchy: show }
    })));
  }, [setNodes]);

  // Initialize canvas
  const { isLoading, isInitialized } = useCanvasInitialization({
    initialNodes,
    initialEdges,
    setNodes,
    setEdges,
    setHierarchyLevels,
    setShowHierarchy,
    setNextId
  });

  // Modal management
  const {
    isHierarchyModalOpen,
    openHierarchyModal,
    closeHierarchyModal,
    textEditDialog,
    openTextEditDialog,
    closeTextEditDialog,
    saveTextEdit
  } = useModalManager();
  // Canvas operations
  const {
    selectedElements,
    onSelectionChange,
    isValidConnection,
    onConnect,
    handleAddNode,
    handleDeleteSelected,
    clearSelection,
    processedNodes,
    processedEdges,
    handlePaneClick  } = useCanvasOperations({
    nodes,
    edges,
    setNodes,
    setEdges,
    hierarchyLevels: HIERARCHY_LEVELS,
    showHierarchy,
    nextId,
    setNextId,
    onNodeLabelChange,
    onNodeLevelChange,
    openTextEditDialog // Pass the text editor dialog handler
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({ selectedElements, handleDeleteSelected });

  // Canvas persistence
  const {
    isSaving,
    saveCanvas,
    loadCanvas,
    handleExport,
    handleImport,
    triggerImport,
    importInputRef
  } = useCanvasPersistence({
    nodes,
    edges,
    hierarchyLevels: HIERARCHY_LEVELS,
    showHierarchy,
    nextId,
    setNodes,
    setEdges,
    setHierarchyLevels,
    setShowHierarchy,
    setNextId,
    onNodeLabelChange,
    onNodeLevelChange,
    isInitialized,
    isLoading
  });

  // Canvas history management
  const { addToHistory: rawAddToHistory, handleUndo, handleRedo, canUndo, canRedo, historyIndex } = useCanvasHistory({
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodeLabelChange,
    onNodeLevelChange,
    hierarchyLevels: HIERARCHY_LEVELS,
    showHierarchy
  });

  // Wrap addToHistory in useCallback for stable reference
  const addToHistory = useCallback((currentNodes, currentEdges) => {
    rawAddToHistory(currentNodes, currentEdges);
  }, [rawAddToHistory, historyIndex]);

  // Create debounced version of addToHistory
  const debouncedAddToHistory = useMemo(
    () => debounce((currentNodes, currentEdges) => {
      addToHistory(currentNodes, currentEdges);
    }, 750),
    [addToHistory]
  );

  // Add nodes to history when they change - Only after initialization (debounced)
  useEffect(() => {
    if (!isInitialized || isLoading) return;
    
    if (nodes.length > 0) {
      debouncedAddToHistory(nodes, edges);
    }
  }, [nodes, edges, debouncedAddToHistory, isInitialized, isLoading]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedAddToHistory.cancel();
    };
  }, [debouncedAddToHistory]);  // Text edit handlers
  const handleSaveTextEdit = useCallback((nodeId, newText) => {    saveTextEdit(nodeId, newText, onNodeLabelChange);
  }, [saveTextEdit, onNodeLabelChange]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#fafbfc' }}>      {/* Controls Panel */}
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
      <SelectionInfo selectedElements={selectedElements} />      <ReactFlow
        nodes={processedNodes}
        edges={processedEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onPaneClick={handlePaneClick}
        isValidConnection={isValidConnection}fitView
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
      />      {/* Text Edit Dialog */}
      <TextEditDialog
        isOpen={textEditDialog.isOpen}
        nodeId={textEditDialog.nodeId}
        currentText={textEditDialog.currentText}
        onSave={handleSaveTextEdit}
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
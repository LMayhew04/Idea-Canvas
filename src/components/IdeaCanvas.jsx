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
import NotificationSystem from './NotificationSystem';

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
  const [selectedElements, setSelectedElements] = useState({ nodes: [], edges: [] });  // ====== PERSISTENCE STATE ======
  const [storageError, setStorageError] = useState(false);  const importInputRef = useRef(null);

  // ====== HISTORY STATE ======
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // ====== UTILITY HELPERS ======
  // Safe notification helper to prevent window undefined errors in tests
  const showNotification = useCallback((message, type = 'info', duration) => {
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification(message, type, duration);
    }
  }, []);

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

  // ====== STORAGE HELPERS ======
  const isStorageAvailable = useCallback(() => {
    try {
      const testKey = '_ideaCanvas_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }, []);
  const safeStorageOperation = useCallback((operation, fallbackMessage) => {
    try {
      if (!isStorageAvailable()) {
        setStorageError(true);
        showNotification(
          'Storage not available. Changes will be lost when you close the browser.', 
          'warning', 
          5000
        );
        return false;
      }
      return operation();
    } catch (error) {
      console.error('Storage operation failed:', error);
      showNotification(fallbackMessage, 'error');
      return false;
    }
  }, [isStorageAvailable, showNotification]);

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

  // New handler for Edit Text button
  const handleEditTextButton = useCallback(() => {
    if (selectedElements.nodes.length === 1) {
      const selectedNode = selectedElements.nodes[0];
      openTextEditDialog(selectedNode.id, selectedNode.data.label);
    }
  }, [selectedElements, openTextEditDialog]);
  const handleLegendLevelClick = useCallback((levelNum) => {
    const selectedNodes = selectedElements.nodes;
    if (selectedNodes.length === 0) return;

    const selectedNodeIds = selectedNodes.map(node => node.id);
    selectedNodeIds.forEach(nodeId => {
      onNodeLevelChange(nodeId, levelNum);
    });
      // Show feedback
    const levelName = HIERARCHY_LEVELS[levelNum]?.name || `Level ${levelNum}`;
    if (selectedNodes.length === 1) {
      showNotification(`Node updated to ${levelName} level`, 'success', 2000);
    } else {
      showNotification(`${selectedNodes.length} nodes updated to ${levelName} level`, 'success', 2000);
    }
  }, [selectedElements, onNodeLevelChange, HIERARCHY_LEVELS]);

  const onSelectionChange = useCallback(({ nodes, edges }) => {
    setSelectedElements({ nodes: nodes || [], edges: edges || [] });
  }, []);

  const isValidConnection = useCallback((connection) => {
    // Only prevent self connections. Allow multiple edges between nodes.
    return connection.source !== connection.target;
  }, []);

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
        showHierarchy: showHierarchy
      },
      style: { width: 180 }
    };
    
    setNodes(nds => [...nds, newNode]);
    setNextId(prev => prev + 1);
  }, [nextId, HIERARCHY_LEVELS, showHierarchy, setNodes]);
  const handleDeleteSelected = useCallback(() => {
    const selectedNodeIds = selectedElements.nodes.map(n => n.id);
    const selectedEdgeIds = selectedElements.edges.map(e => e.id);
    
    const totalSelected = selectedNodeIds.length + selectedEdgeIds.length;
    if (totalSelected === 0) return;
    
    // Show confirmation for multiple deletions
    const shouldDelete = totalSelected === 1 || window.confirm(
      `Are you sure you want to delete ${totalSelected} selected item${totalSelected !== 1 ? 's' : ''}? This action cannot be undone.`
    );
    
    if (!shouldDelete) return;
    
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
    
    // Show feedback
    if (totalSelected === 1) {
      showNotification('Item deleted', 'info', 2000);
    } else {
      showNotification(`${totalSelected} items deleted`, 'info', 2000);
    }  }, [selectedElements, setNodes, setEdges]);

  const handlePaneClick = useCallback(() => {
    setSelectedElements({ nodes: [], edges: [] });
  }, []);
  // ====== PROCESSED NODES/EDGES ======
  const processedNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        hierarchyLevels: HIERARCHY_LEVELS,
        showHierarchy: showHierarchy
      }
    }));
  }, [nodes, HIERARCHY_LEVELS, showHierarchy]);

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
  }, [handleKeyDown]);  // ====== PERSISTENCE ======
  const handleExport = useCallback(() => {
    try {      if (nodes.length === 0) {
        window.showNotification?.('No nodes to save. Add some content first!', 'warning');
        return;
      }
      
      window.showNotification?.('Saving canvas...', 'loading', 1000);
        const canvasData = {
        nodes,
        edges,
        hierarchyLevels: HIERARCHY_LEVELS,
        showHierarchy,
        nextId,
        savedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(canvasData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `idea-canvas-${new Date().toISOString().split('T')[0]}.json`;      a.click();
      URL.revokeObjectURL(url);
        setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.showNotification?.('Canvas saved! File downloaded to your computer. This is your main way to save your work.', 'success');
        }
      }, 500);
    } catch (error) {
      console.error('Export error:', error);
      if (typeof window !== 'undefined') {
        window.showNotification?.('Failed to save canvas. Please try again.', 'error');
      }
    }
  }, [nodes, edges, HIERARCHY_LEVELS, showHierarchy, nextId]);  const handleImport = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      // Warn about overwriting current work
      if (nodes.length > 0 || edges.length > 0) {        const shouldImport = window.confirm(
          'Loading will replace your current canvas. Any unsaved changes will be lost. Continue?'
        );
        if (!shouldImport) {
          // Reset the input
          if (event.target) {
            event.target.value = '';
          }
          return;
        }
      }

      window.showNotification?.('Loading canvas...', 'loading', 2000);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedData = JSON.parse(e.target.result);
          
          // Enhanced validation
          if (!parsedData || typeof parsedData !== 'object') {
            throw new Error('Invalid file format: not a valid JSON object');
          }
          
          if (!parsedData.nodes || !Array.isArray(parsedData.nodes)) {
            throw new Error('Invalid file format: missing or invalid nodes data');
          }

          // Validate node structure
          const invalidNodes = parsedData.nodes.filter(node => 
            !node.id || !node.data || typeof node.data.label !== 'string'
          );
          
          if (invalidNodes.length > 0) {
            throw new Error(`Invalid node structure found in ${invalidNodes.length} node(s)`);
          }
          
          setNodes(parsedData.nodes.map(node => ({
            ...node,
            type: 'custom',
            data: {
              ...node.data,
              hierarchyLevels: parsedData.hierarchyLevels || HIERARCHY_LEVELS,
              showHierarchy: parsedData.showHierarchy || false,
            }
          })));
          setEdges(parsedData.edges || []);
          setHierarchyLevels(parsedData.hierarchyLevels || HIERARCHY_LEVELS);
          setShowHierarchy(parsedData.showHierarchy || false);
          if (parsedData.nextId) {
            setNextId(parsedData.nextId);
          }
            setTimeout(() => {
            window.showNotification?.(`Canvas loaded successfully! Loaded ${parsedData.nodes.length} nodes and ${(parsedData.edges || []).length} connections. Use "Save Canvas" to preserve your work.`, 'success');
          }, 1000);
        } catch (error) {
          console.error('Import error:', error);
          window.showNotification?.(`Failed to load canvas: ${error.message}`, 'error');
        }
      };
      reader.onerror = () => {
        window.showNotification?.('Failed to read the file. Please try again.', 'error');
      };
      reader.readAsText(file);
    }
    
    // Reset the input so the same file can be imported again
    if (event.target) {
      event.target.value = '';
    }
  }, [setNodes, setEdges, HIERARCHY_LEVELS, nodes.length, edges.length]);

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
        
        // Check storage availability first
        if (!isStorageAvailable()) {
          setStorageError(true);
          window.showNotification?.(
            'Storage is not available. Your work will not be saved automatically.',
            'warning',
            5000
          );
        }
        
        // Check for auto-saved data
        const autoSavedData = localStorage.getItem('ideaCanvas_autosave');
        if (autoSavedData && !storageError) {
          try {
            const parsedData = JSON.parse(autoSavedData);
            const autoSaveDate = parsedData.autoSavedAt 
              ? new Date(parsedData.autoSavedAt).toLocaleString()
              : 'recently';
            
            const shouldRestore = window.confirm(
              `Found auto-saved data from ${autoSaveDate}. Would you like to restore it?`
            );
            
            if (shouldRestore) {
              // Validate auto-saved data
              if (parsedData.nodes && Array.isArray(parsedData.nodes)) {
                setNodes(parsedData.nodes.map(node => ({
                  ...node,
                  type: 'custom',
                  data: {
                    ...node.data,
                    hierarchyLevels: parsedData.hierarchyLevels || HIERARCHY_LEVELS,
                    showHierarchy: parsedData.showHierarchy || false,
                  }
                })));
                setEdges(parsedData.edges || []);
                setHierarchyLevels(parsedData.hierarchyLevels || HIERARCHY_LEVELS);
                setShowHierarchy(parsedData.showHierarchy || false);
                if (parsedData.nextId) {
                  setNextId(parsedData.nextId);
                }
                
                window.showNotification?.(
                  `Auto-saved data restored successfully! (${parsedData.nodes.length} nodes)`,
                  'success'
                );
                
                setIsLoading(false);
                setIsInitialized(true);
                return;
              } else {
                window.showNotification?.(
                  'Auto-saved data appears corrupted. Loading default canvas.',
                  'warning'
                );
              }
            }
          } catch (error) {
            console.error('Error parsing auto-saved data:', error);
            window.showNotification?.(
              'Auto-saved data is corrupted. Loading default canvas.',
              'warning'
            );
          }
        }

        // No auto-saved data or user declined, use initial data
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
        window.showNotification?.(
          'Error initializing canvas. Some features may not work properly.',
          'error'
        );
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeCanvas();
  }, [isInitialized, HIERARCHY_LEVELS, showHierarchy, setNodes, setEdges, isStorageAvailable, storageError]);
  // Auto-save effect with error handling
  useEffect(() => {
    if (!isInitialized || isLoading) return;
    
    const autoSaveInterval = setInterval(() => {
      if (storageError) return; // Skip auto-save if storage is not available
      
      safeStorageOperation(() => {
        const canvasData = {
          nodes,
          edges,
          hierarchyLevels: HIERARCHY_LEVELS,
          showHierarchy,
          nextId,
          autoSavedAt: new Date().toISOString()
        };
        localStorage.setItem('ideaCanvas_autosave', JSON.stringify(canvasData));
        return true;
      }, 'Auto-save failed');
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [nodes, edges, HIERARCHY_LEVELS, showHierarchy, nextId, isInitialized, isLoading, storageError, safeStorageOperation]);
  // ====== RENDER ======
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#fafbfc' }}>
      {/* Controls Panel */}      <ControlsPanel
        onAddNode={handleAddNode}
        onOpenHierarchySettings={openHierarchyModal}
        onDeleteSelected={handleDeleteSelected}
        selectedElements={selectedElements}
        onExport={handleExport}
        onImportFile={handleImport}
        onTriggerImport={triggerImport}
        onEditText={handleEditTextButton}
        importInputRef={importInputRef}
        hasNodes={processedNodes.length > 0}
      />

      {/* Storage Warning Banner */}
      {storageError && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 15,
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '8px 16px',
          borderRadius: '6px',
          border: '1px solid #ffeaa7',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          ⚠ Storage unavailable - changes will be lost when you close the browser
        </div>
      )}

      {/* Selection Info */}
      <SelectionInfo selectedElements={selectedElements} />

      {/* Empty State Message */}
      {processedNodes.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 5,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid #e1e5e9'
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '24px', 
            color: '#2c3e50',
            fontWeight: 600 
          }}>
            Welcome to Idea Canvas!
          </h2>
          <p style={{ 
            margin: '0 0 24px 0', 
            fontSize: '16px', 
            color: '#7f8c8d',
            lineHeight: '1.5',
            maxWidth: '400px'
          }}>
            Start building your ideas by adding your first node. Click the "Add Node" button above, 
            or load an existing canvas to continue your work.
          </p>
          <div style={{
            fontSize: '14px',
            color: '#95a5a6'
          }}>
            💡 Tip: Use the hierarchy system to organize your ideas by importance level
          </div>
        </div>
      )}

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
      />      {/* Text Edit Dialog */}
      <TextEditDialog
        isOpen={textEditDialog.isOpen}
        nodeId={textEditDialog.nodeId}
        currentText={textEditDialog.currentText}
        onSave={handleTextEdit}
        onCancel={closeTextEditDialog}
      />

      {/* Notification System */}
      <NotificationSystem />
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

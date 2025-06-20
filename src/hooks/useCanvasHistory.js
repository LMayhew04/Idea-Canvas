import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing canvas undo/redo functionality
 * 
 * @param {Object} params - Configuration object
 * @param {Array} params.nodes - Current nodes array
 * @param {Array} params.edges - Current edges array  
 * @param {Function} params.setNodes - Function to update nodes state
 * @param {Function} params.setEdges - Function to update edges state
 * @param {Function} params.onNodeLabelChange - Callback for node label changes
 * @param {Function} params.onNodeLevelChange - Callback for node level changes
 * @param {Object} params.hierarchyLevels - Current hierarchy levels configuration
 * @param {boolean} params.showHierarchy - Whether hierarchy is currently shown
 * 
 * @returns {Object} Hook interface
 * @returns {Function} returns.addToHistory - Function to add current state to history
 * @returns {Function} returns.handleUndo - Function to undo last action
 * @returns {Function} returns.handleRedo - Function to redo last undone action
 * @returns {boolean} returns.canUndo - Whether undo is possible
 * @returns {boolean} returns.canRedo - Whether redo is possible
 */
const useCanvasHistory = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  onNodeLabelChange,
  onNodeLevelChange,
  hierarchyLevels,
  showHierarchy
}) => {
  // History state
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Add current state to history
  const addToHistory = useCallback((currentNodes, currentEdges) => {
    const newState = {
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges))
    };

    setHistory(prev => {
      // Remove any states after current index (for when user makes changes after undo)
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, newState];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Handle undo operation
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      
      // Restore nodes with proper data structure and callbacks
      setNodes(prevState.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onChange: onNodeLabelChange,
          onLevelChange: onNodeLevelChange,
          hierarchyLevels: hierarchyLevels,
          showHierarchy: showHierarchy
        }
      })));
      
      // Restore edges
      setEdges(prevState.edges);
      
      // Update history index
      setHistoryIndex(prev => prev - 1);
    }
  }, [
    history, 
    historyIndex, 
    setNodes, 
    setEdges, 
    onNodeLabelChange, 
    onNodeLevelChange, 
    hierarchyLevels, 
    showHierarchy
  ]);

  // Handle redo operation
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      
      // Restore nodes with proper data structure and callbacks
      setNodes(nextState.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onChange: onNodeLabelChange,
          onLevelChange: onNodeLevelChange,
          hierarchyLevels: hierarchyLevels,
          showHierarchy: showHierarchy
        }
      })));
      
      // Restore edges
      setEdges(nextState.edges);
      
      // Update history index
      setHistoryIndex(prev => prev + 1);
    }
  }, [
    history, 
    historyIndex, 
    setNodes, 
    setEdges, 
    onNodeLabelChange, 
    onNodeLevelChange, 
    hierarchyLevels, 
    showHierarchy
  ]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Computed flags for UI state
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    addToHistory,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo
  };
};

export default useCanvasHistory;

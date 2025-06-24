import { useCallback, useEffect } from 'react';

const useKeyboardShortcuts = ({ selectedElements, handleDeleteSelected }) => {
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
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    // No direct exports needed - this hook manages keyboard events internally
  };
};

export default useKeyboardShortcuts;

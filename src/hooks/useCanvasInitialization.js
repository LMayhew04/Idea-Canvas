import { useState, useEffect } from 'react';

const useCanvasInitialization = ({ 
  initialNodes, 
  initialEdges, 
  setNodes, 
  setEdges, 
  setHierarchyLevels, 
  setShowHierarchy, 
  setNextId 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

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

  return {
    isLoading,
    isInitialized
  };
};

export default useCanvasInitialization;

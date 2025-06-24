import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { debounce } from 'lodash';

const useCanvasPersistence = ({ 
  nodes, 
  edges, 
  hierarchyLevels, 
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
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const importInputRef = useRef(null);

  // Debounced auto-save function
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
  }, [debouncedSave]);

  // Auto-save when data changes
  useEffect(() => {
    if (!isInitialized || isLoading) return;
    
    const dataToSave = {
      nodes,
      edges,
      hierarchyLevels,
      showHierarchy,
      nextId
    };
    debouncedSave(dataToSave);
  }, [nodes, edges, hierarchyLevels, showHierarchy, nextId, debouncedSave, isInitialized, isLoading]);

  // Manual save function
  const saveCanvas = useCallback(async () => {
    setIsSaving(true);
    try {
      const dataToSave = { 
        nodes, 
        edges, 
        hierarchyLevels, 
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
  }, [nodes, edges, hierarchyLevels, showHierarchy, nextId]);

  // Load canvas function
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
            hierarchyLevels: dataToLoad.hierarchyLevels || hierarchyLevels,
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
        alert('No saved data found.');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      alert('Failed to load canvas from localStorage.');
    }
  }, [savedData, setNodes, setEdges, hierarchyLevels, showHierarchy, setHierarchyLevels, setShowHierarchy, setNextId]);

  // Export function
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
        hierarchyLevels,
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
  }, [nodes, edges, hierarchyLevels, showHierarchy]);

  // Import function
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
  }, [onNodeLabelChange, onNodeLevelChange, setNodes, setEdges, setHierarchyLevels, setShowHierarchy, setNextId]);

  // Trigger import dialog
  const triggerImport = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  return {
    isSaving,
    saveCanvas,
    loadCanvas,
    handleExport,
    handleImport,
    triggerImport,
    importInputRef
  };
};

export default useCanvasPersistence;

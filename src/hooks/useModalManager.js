import { useState, useCallback, useEffect } from 'react';

const useModalManager = () => {
  // Hierarchy modal state
  const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
  
  // Text editing dialog state
  const [textEditDialog, setTextEditDialog] = useState({
    isOpen: false,
    nodeId: null,
    currentText: ''
  });

  // Hierarchy modal handlers
  const openHierarchyModal = useCallback(() => {
    setIsHierarchyModalOpen(true);
  }, []);  const closeHierarchyModal = useCallback(() => {
    setIsHierarchyModalOpen(false);
  }, []);

  // Text editing dialog handlers
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

  return {
    // Hierarchy modal
    isHierarchyModalOpen,
    openHierarchyModal,
    closeHierarchyModal,
    
    // Text edit dialog
    textEditDialog,
    openTextEditDialog,
    closeTextEditDialog,
    saveTextEdit
  };
};

export default useModalManager;

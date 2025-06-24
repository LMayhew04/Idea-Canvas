import React from 'react';

const ControlsPanel = ({
  onAddNode,
  onOpenHierarchySettings,
  onDeleteSelected,
  selectedElements,
  onExport,
  onImportFile,
  onTriggerImport,
  onEditText,
  importInputRef,
  hasNodes = true
}) => {
  return (
    <div className="controls-panel"><button
        onClick={onAddNode}
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
        onClick={onEditText}
        disabled={selectedElements.nodes.length !== 1}
        style={{
          backgroundColor: selectedElements.nodes.length === 1 ? '#28a745' : '#ccc',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: 5,
          cursor: selectedElements.nodes.length === 1 ? 'pointer' : 'not-allowed',
          fontSize: 14,
          fontWeight: 600
        }}
      >
        Edit Text
      </button>
      
      <button
        onClick={onOpenHierarchySettings}
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
      </button>
      
      <button
        onClick={onDeleteSelected}
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
        Delete Selected      </button>
        <button
        onClick={onExport}
        disabled={!hasNodes}
        style={{
          backgroundColor: hasNodes ? '#28a745' : '#ccc',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: 5,
          cursor: hasNodes ? 'pointer' : 'not-allowed',
          fontSize: 14,
          fontWeight: 600
        }}        title={hasNodes ? 'Save your canvas to a JSON file on your computer' : 'No nodes to export'}
      >
        Save Canvas
      </button>      <button
        onClick={onTriggerImport}
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
        title="Load a canvas from a JSON file on your computer"
      >
        Load Canvas
      </button>
      
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        onChange={onImportFile}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ControlsPanel;

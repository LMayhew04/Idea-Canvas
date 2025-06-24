import React from 'react';

const ControlsPanel = ({
  onAddNode,
  onOpenHierarchySettings,
  onDeleteSelected,
  selectedElements,
  onSave,
  onLoad,
  onClearSelection,
  onExport,
  onImportFile,
  onTriggerImport,
  importInputRef
}) => {
  return (
    <div className="controls-panel">
      <button
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
        Delete Selected
      </button>
      
      <button
        onClick={onSave}
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
        onClick={onLoad}
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
        onClick={onClearSelection}
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
        onClick={onExport}
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
      >
        Import Canvas
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

import React, { useState, useEffect, useRef } from 'react';

const TextEditDialog = ({ isOpen, nodeId, currentText, onSave, onCancel }) => {
  const [text, setText] = useState(currentText || '');
  const textareaRef = useRef(null);

  // Update text when dialog opens with different content
  useEffect(() => {
    setText(currentText || '');
  }, [currentText, isOpen]);

  // Focus textarea when dialog opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(nodeId, text.trim() || 'New Idea');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      // Ctrl+Enter or Cmd+Enter to save
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      // Escape to cancel
      e.preventDefault();
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000 // Higher than other modals
      }}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          minWidth: '400px',
          maxWidth: '600px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          border: 'none',
          outline: 'none'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking inside
      >        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '18px', 
          fontWeight: 600,
          color: '#333'
        }}>
          Edit Node Text
        </h3>
        
        <div style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '12px'
        }}>
          Edit the text content for the selected node. Changes will be applied when you click Save.
        </div>
        
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your idea..."
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            border: '2px solid #e1e5e9',
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#4285f4';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e1e5e9';
          }}
        />
        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '16px'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: '#f8f9fa',
              color: '#666',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e9ecef';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#4285f4',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#3367d6';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4285f4';
            }}
          >
            Save (Ctrl+Enter)
          </button>
        </div>
        
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          Press Ctrl+Enter to save, Escape to cancel
        </div>
      </div>
    </div>
  );
};

export default TextEditDialog;

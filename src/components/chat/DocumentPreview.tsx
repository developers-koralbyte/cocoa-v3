// DocumentPreview.tsx
import React from 'react';

interface DocumentPreviewProps {
  document: { name: string; type: string; size: string };
  onRemove: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onRemove }) => {
  // Get an icon based on file type (for simplicity, we use an emoji)
  const getDocumentIcon = () => {
    const type = document.type.toLowerCase();
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return '📊';
    if (type.includes('presentation') || type.includes('ppt')) return '📑';
    return '📎';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f8f8f8',
      marginBottom: '8px'
    }}>
      <span style={{ fontSize: '24px', marginRight: '10px' }}>{getDocumentIcon()}</span>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{
          fontWeight: 600,
          fontSize: '14px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {document.name}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {document.size}
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{
          backgroundColor: '#e53e3e',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          marginLeft: '10px'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default DocumentPreview;

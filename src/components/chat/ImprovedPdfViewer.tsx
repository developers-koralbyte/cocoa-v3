import React, { useState } from 'react';

interface ImprovedPdfViewerProps {
  pdfUrl: string;
  filename?: string;
  invoiceId?: string;
  isCurrentUser?: boolean;
}

const ImprovedPdfViewer: React.FC<ImprovedPdfViewerProps> = ({ 
  pdfUrl, 
  filename, 
  invoiceId, 
  isCurrentUser = false 
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  if (!pdfUrl) {
    console.error('Missing PDF URL in ImprovedPdfViewer');
    return null;
  }
  
  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(!showPreview);
    setIframeError(false); // reset error state when toggling preview
  };
  
  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(pdfUrl, '_blank');
  };

  const handleIframeLoad = () => {
    console.log('PDF iframe loaded successfully');
  };

  const handleIframeError = () => {
    console.error('Error loading PDF in iframe');
    setIframeError(true);
  };

  // Get file extension for the badge
  const getFileExtension = () => {
    if (!filename) return 'PDF';
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'PDF';
  };

  // Truncate filename if it's too long
  const displayName = filename && filename.length > 24 
    ? filename.substring(0, 21) + '...' 
    : filename || "Document";

  return (
    <div style={{
      margin: '8px 0',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
      backgroundColor: isCurrentUser ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.9)',
      border: isCurrentUser ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header section with file info */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: isCurrentUser ? 'rgba(0, 0, 0, 0.2)' : '#f5f5f5',
        borderBottom: showPreview ? '1px solid rgba(0, 0, 0, 0.1)' : 'none'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          {/* File type badge */}
          <div style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: invoiceId ? '#3182ce' : '#e74c3c',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '13px',
            borderRadius: '8px',
            marginRight: '12px'
          }}>
            {getFileExtension()}
          </div>
          
          {/* File details */}
          <div>
            <div style={{ 
              fontWeight: 600,
              fontSize: '15px',
              color: isCurrentUser ? 'white' : '#333',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '200px'
            }}>
              {displayName}
            </div>
            <div style={{ 
              fontSize: '13px',
              color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#666'
            }}>
              {invoiceId ? 'Invoice Document' : 'PDF Document'}
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={handleViewClick}
            style={{
              backgroundColor: showPreview ? '#e2e8f0' : '#3182ce',
              color: showPreview ? '#2d3748' : 'white',
              padding: '8px 14px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'background-color 0.2s ease, color 0.2s ease'
            }}
          >
            {showPreview ? '❌ Hide' : '👁️ Preview'}
          </button>
          
          <button
            onClick={handleOpenInNewTab}
            style={{
              backgroundColor: '#2c5282',
              color: 'white',
              padding: '8px 14px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'background-color 0.2s ease'
            }}
          >
            🔗 Open
          </button>
        </div>
      </div>
      
      {/* PDF Preview section */}
      {showPreview && (
        <div style={{ 
          backgroundColor: '#fff',
          padding: iframeError ? '16px' : '0'
        }}>
          {iframeError ? (
            <div style={{ 
              color: '#e53e3e', 
              fontSize: '14px',
              padding: '16px',
              backgroundColor: '#fed7d7',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Unable to load preview. PDF might be restricted.</span>
              <button
                onClick={handleOpenInNewTab}
                style={{
                  backgroundColor: '#3182ce',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  marginLeft: '10px'
                }}
              >
                Open in New Tab
              </button>
            </div>
          ) : (
            <iframe 
              src={pdfUrl} 
              title={filename || "PDF Document"} 
              style={{ 
                width: '100%', 
                height: '400px', 
                border: 'none',
                display: 'block'
              }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ImprovedPdfViewer;

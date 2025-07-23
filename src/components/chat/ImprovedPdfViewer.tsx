import React, { useState, useEffect } from 'react';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth > 640 && window.innerWidth <= 1024
  );

  // Handle responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 640);
      setIsTablet(width > 640 && width <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Responsive filename truncation
  const getDisplayName = () => {
    if (!filename) return "Document";
    
    let maxLength;
    if (isMobile) {
      maxLength = 15; // Very short on mobile
    } else if (isTablet) {
      maxLength = 20; // Medium on tablet
    } else {
      maxLength = 30; // Longer on desktop
    }
    
    return filename.length > maxLength 
      ? filename.substring(0, maxLength - 3) + '...' 
      : filename;
  };

  // Responsive styles
  const containerStyle: React.CSSProperties = {
    margin: isMobile ? '6px 0' : '8px 0',
    borderRadius: isMobile ? '6px' : '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: isCurrentUser ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.95)',
    border: isCurrentUser ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid #e9ecef',
    maxWidth: '100%'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? '12px 16px' : isTablet ? '14px 18px' : '16px 20px',
    backgroundColor: isCurrentUser ? 'rgba(0, 0, 0, 0.15)' : '#f8f9fa',
    borderBottom: showPreview ? '1px solid #e9ecef' : 'none',
    flexWrap: isMobile ? 'wrap' : 'nowrap',
    gap: isMobile ? '12px' : '0'
  };

  const fileInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flex: isMobile ? '1 1 100%' : '1 1 auto',
    minWidth: 0
  };

  const badgeStyle: React.CSSProperties = {
    width: isMobile ? '32px' : isTablet ? '36px' : '40px',
    height: isMobile ? '32px' : isTablet ? '36px' : '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: invoiceId ? '#007bff' : '#dc3545',
    color: 'white',
    fontWeight: 'bold',
    fontSize: isMobile ? '10px' : isTablet ? '11px' : '13px',
    borderRadius: isMobile ? '4px' : '6px',
    marginRight: isMobile ? '8px' : '12px',
    flexShrink: 0
  };

  const fileDetailsStyle: React.CSSProperties = {
    minWidth: 0,
    flex: 1
  };

  const filenameStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: isMobile ? '13px' : isTablet ? '14px' : '15px',
    color: isCurrentUser ? 'white' : '#333',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: isMobile ? '120px' : isTablet ? '150px' : '200px'
  };

  const fileTypeStyle: React.CSSProperties = {
    fontSize: isMobile ? '11px' : '13px',
    color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#666',
    marginTop: '2px'
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: isMobile ? '6px' : '10px',
    flexShrink: 0,
    ...(isMobile && { width: '100%', justifyContent: 'flex-end' })
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: isMobile ? '8px 12px' : isTablet ? '10px 16px' : '10px 18px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    minWidth: isMobile ? '70px' : '90px',
    textAlign: 'center' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const previewButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: showPreview ? '#f8f9fa' : '#3182ce',
    color: showPreview ? '#495057' : 'white',
    border: showPreview ? '1px solid #dee2e6' : 'none'
  };

  const openButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#28a745',
    color: 'white'
    // Note: ':hover' styles are not supported in inline styles. Use a CSS class if needed.
  };

  const previewContainerStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: iframeError ? (isMobile ? '12px' : '16px') : '0'
  };

  const errorStyle: React.CSSProperties = {
    color: '#e53e3e',
    fontSize: isMobile ? '12px' : '14px',
    padding: isMobile ? '12px' : '16px',
    backgroundColor: '#fed7d7',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '8px' : '10px',
    textAlign: isMobile ? 'center' : 'left' as const
  };

  const errorButtonStyle: React.CSSProperties = {
    backgroundColor: '#007bff',
    color: 'white',
    padding: isMobile ? '10px 20px' : '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const iframeStyle: React.CSSProperties = {
    width: '100%',
    height: isMobile ? '300px' : isTablet ? '350px' : '400px',
    border: 'none',
    display: 'block'
  };

  return (
    <div style={containerStyle}>
      {/* Header section with file info */}
      <div style={headerStyle}>
        <div style={fileInfoStyle}>
          {/* File type badge */}
          <div style={badgeStyle}>
            {getFileExtension()}
          </div>
          
          {/* File details */}
          <div style={fileDetailsStyle}>
            <div style={filenameStyle}>
              {getDisplayName()}
            </div>
            <div style={fileTypeStyle}>
              {invoiceId ? 'Invoice Document' : 'PDF Document'}
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div style={buttonContainerStyle}>
          <button
            onClick={handleViewClick}
            style={previewButtonStyle}
          >
            {isMobile ? (
              showPreview ? 'Hide' : 'View'
            ) : (
              showPreview ? 'Hide Preview' : 'View Preview'
            )}
          </button>
          
          <button
            onClick={handleOpenInNewTab}
            style={openButtonStyle}
          >
            {isMobile ? 'Open' : 'Open File'}
          </button>
        </div>
      </div>
      
      {/* PDF Preview section */}
      {showPreview && (
        <div style={previewContainerStyle}>
          {iframeError ? (
            <div style={errorStyle}>
              <span>
                {isMobile 
                  ? 'Unable to preview document' 
                  : 'Unable to load preview. The document may be restricted or unavailable.'
                }
              </span>
              <button
                onClick={handleOpenInNewTab}
                style={errorButtonStyle}
              >
                Open Document
              </button>
            </div>
          ) : (
            <iframe 
              src={pdfUrl} 
              title={filename || "PDF Document"} 
              style={iframeStyle}
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
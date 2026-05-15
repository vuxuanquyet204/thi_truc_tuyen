import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, Loader2, FileText } from 'lucide-react';
import mammoth from 'mammoth';
import styles from './DocumentViewerModal.module.css';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  documentTitle: string;
  mimeType?: string;
  cloudinaryUrl?: string;
}

export default function DocumentViewerModal({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  mimeType,
  cloudinaryUrl
}: DocumentViewerModalProps): JSX.Element | null {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedMimeType, setDetectedMimeType] = useState<string | undefined>(mimeType);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
      setDetectedMimeType(mimeType);
      setLoading(true);
      setError(null);
      setDocxHtml(null);
      return;
    }

    // Nếu có Cloudinary URL thì hiển thị trực tiếp
    if (cloudinaryUrl) {
      setFileUrl(cloudinaryUrl);
      setLoading(false);
      return;
    }

    const fetchFile = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('accessToken');

        const downloadUrl = import.meta.env.VITE_API_BASE_URL 
          ? `${import.meta.env.VITE_API_BASE_URL}/api/copyrights/download/${documentId}`
          : `http://localhost:8080/api/copyrights/download/${documentId}`;
        const response = await fetch(downloadUrl, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (!response.ok) {
          throw new Error('Không thể tải file');
        }

        // Backend trả binary stream trực tiếp
        const blob = await response.blob();
        const contentType = response.headers.get('Content-Type') || mimeType;
        if (contentType) {
          setDetectedMimeType(contentType);
        }
        
        const isDocx = contentType?.includes('openxmlformats-officedocument.wordprocessingml.document') ||
                       contentType?.includes('msword') ||
                       documentTitle.toLowerCase().endsWith('.docx') ||
                       documentTitle.toLowerCase().endsWith('.doc');
        
        if (isDocx) {
          try {
            const arrayBuffer = await blob.arrayBuffer();
            const mammothResult = await mammoth.convertToHtml({ arrayBuffer });
            setDocxHtml(mammothResult.value);
          } catch (convertError: any) {
            console.warn('Cannot convert docx to HTML:', convertError);
          }
        }
        
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
      } catch (err: any) {
        setError(err.message || 'Không thể tải file');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();

    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [isOpen, documentId, mimeType]);

  const handleDownload = () => {
    if (!fileUrl) return;
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = documentTitle;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  let actualMimeType = detectedMimeType || mimeType;
  
  if (!actualMimeType || actualMimeType === 'application/octet-stream') {
    const ext = documentTitle.toLowerCase().split('.').pop();
    const mimeMap: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'txt': 'text/plain',
      'html': 'text/html',
      'htm': 'text/html',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    if (ext && mimeMap[ext]) {
      actualMimeType = mimeMap[ext];
    }
  }
  
  const isPDF = actualMimeType?.includes('pdf') || documentTitle.toLowerCase().endsWith('.pdf');
  const isImage = actualMimeType?.startsWith('image/') || 
                  /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(documentTitle);
  const isText = actualMimeType?.startsWith('text/') || 
                 /\.(txt|html|htm|css|js|json|xml|md)$/i.test(documentTitle);
  
  const isWordDoc = actualMimeType?.includes('msword') || 
                    actualMimeType?.includes('openxmlformats-officedocument.wordprocessingml') ||
                    /\.(doc|docx)$/i.test(documentTitle);
  
  const isExcelDoc = actualMimeType?.includes('spreadsheetml') ||
                     /\.(xls|xlsx)$/i.test(documentTitle);
  
  const isPowerPointDoc = actualMimeType?.includes('presentationml') ||
                          /\.(ppt|pptx)$/i.test(documentTitle);
  
  const isOfficeDoc = isWordDoc || isExcelDoc || isPowerPointDoc;
  
  const canViewInline = isPDF || isImage || isText || (isWordDoc && docxHtml);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2>{documentTitle}</h2>
            <span className={styles.mimeType}>{actualMimeType || 'Unknown type'}</span>
          </div>
          
          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              onClick={handleDownload}
              title="Tải xuống"
              disabled={!fileUrl}
            >
              <Download size={20} />
            </button>
            <button
              className={styles.actionBtn}
              onClick={handleOpenNewTab}
              title="Mở trong tab mới"
              disabled={!fileUrl}
            >
              <ExternalLink size={20} />
            </button>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              title="Đóng"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>
              <Loader2 size={48} className={styles.spinner} />
              <p>Đang tải tài liệu...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={onClose}>Đóng</button>
            </div>
          )}

          {!loading && !error && (fileUrl || docxHtml) && (
            <>
              {isPDF && (
                <iframe
                  src={fileUrl!}
                  className={styles.viewer}
                  title={documentTitle}
                />
              )}

              {isImage && !isPDF && (
                <div className={styles.imageViewer}>
                  <img src={fileUrl!} alt={documentTitle} />
                </div>
              )}

              {isText && !isPDF && !isImage && (
                <iframe
                  src={fileUrl!}
                  className={styles.viewer}
                  title={documentTitle}
                />
              )}

              {isWordDoc && docxHtml && (
                <div className={styles.docxViewer}>
                  <div 
                    className={styles.docxContent}
                    dangerouslySetInnerHTML={{ __html: docxHtml }}
                  />
                </div>
              )}

              {!canViewInline && (
                <div className={styles.unsupported}>
                  {isExcelDoc || isPowerPointDoc ? (
                    <>
                      <div className={styles.iconWrapper}>
                        <FileText size={64} />
                      </div>
                      <h3>Tài liệu Microsoft Office</h3>
                      <p>
                        File <strong>{documentTitle}</strong> là tài liệu Microsoft Office 
                        ({isExcelDoc ? '.xlsx' : '.pptx'}) và không thể xem trực tiếp trong trình duyệt.
                      </p>
                      <p className={styles.suggestion}>
                        Vui lòng tải xuống và mở bằng Microsoft Office, Google Docs, hoặc LibreOffice.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>Không thể xem trực tiếp loại file này trong trình duyệt</p>
                      <p className={styles.mimeInfo}>
                        Loại file: {actualMimeType || 'Unknown'}
                      </p>
                    </>
                  )}
                  
                  <div className={styles.actions}>
                    <button onClick={handleDownload} className={styles.downloadBtn}>
                      <Download size={20} />
                      {isOfficeDoc ? 'Tải xuống file' : 'Tải xuống để xem'}
                    </button>
                    <button onClick={handleOpenNewTab} className={styles.openBtn}>
                      <ExternalLink size={20} />
                      Mở trong tab mới
                    </button>
                  </div>
                  
                  {isOfficeDoc && (
                    <div className={styles.officeTips}>
                      <p className={styles.tipsTitle}>Mẹo:</p>
                      <ul>
                        <li>Tải file về và mở bằng Microsoft Word/Excel/PowerPoint</li>
                        <li>Hoặc upload lên Google Drive và mở bằng Google Docs/Sheets/Slides</li>
                        <li>Hoặc sử dụng LibreOffice (miễn phí, mã nguồn mở)</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

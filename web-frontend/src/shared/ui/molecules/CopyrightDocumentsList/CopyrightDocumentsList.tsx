import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Shield, 
  Clock, 
  User, 
  Tag, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Filter,
  Calendar,
  Hash,
  ExternalLink,
  Download,
  Eye
} from 'lucide-react';
import { useCopyright } from '@/features/copyright/hooks';
import { CopyrightDoc, DocumentCategory, COPYRIGHT_CATEGORY_LABELS } from '@/foundation/types/copyright';
import DocumentViewerModal from '@/shared/ui/molecules/DocumentViewerModal/DocumentViewerModal';
import styles from './CopyrightDocumentsList.module.css';

interface CopyrightDocumentsListProps {
  address?: string;
  category?: DocumentCategory;
  showFilters?: boolean;
  onDocumentSelect?: (document: CopyrightDoc) => void;
}

export default function CopyrightDocumentsList({ 
  address, 
  category, 
  showFilters = true,
  onDocumentSelect 
}: CopyrightDocumentsListProps): JSX.Element {
  const { 
    isConnected, 
    currentAddress, 
    getDocumentsByOwner,
    getAllDocuments,
    getStatistics,
    isLoading 
  } = useCopyright();

  const [documents, setDocuments] = useState<CopyrightDoc[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<CopyrightDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | ''>('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'title' | 'category'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState<{
    totalDocuments: number;
    totalVerified: number;
    totalOwners: number;
  } | null>(null);
  
  // Document viewer modal state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{
    id: number;
    title: string;
    mimeType?: string;
  } | null>(null);

  // Load documents when component mounts or dependencies change
  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, category, isConnected, currentAddress]);

  // Filter and sort documents when documents or filters change
  useEffect(() => {
    filterAndSortDocuments();
  }, [documents, searchTerm, selectedCategory, sortBy, sortOrder]);

  const loadDocuments = async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      let response;

      if (address) {
        // Load documents for specific address
        response = await getDocumentsByOwner(address, 1, 100);
      } else if (category) {
        // Load documents for specific category
        response = await getAllDocuments({
          category,
          page: 1,
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'DESC'
        });
      } else if (currentAddress) {
        // Load current user's documents
        response = await getDocumentsByOwner(currentAddress, 1, 100);
      } else {
        // Load all documents if no filter
        response = await getAllDocuments({
          page: 1,
          limit: 100,
          sortBy: 'createdAt',
          sortOrder: 'DESC'
        });
      }

      if (response && response.data) {
        // Backend returns { items: [...], pagination: {...} } - extract items array
        const items = Array.isArray(response.data)
          ? response.data
          : (response.data.items || []);

        // Map backend data to frontend CopyrightDoc format
        const mappedDocuments: CopyrightDoc[] = items.map((doc: any) => ({
          id: doc.id, // Store actual database ID for API calls
          documentHash: doc.hash || doc.id?.toString() || '',
          title: doc.title || doc.filename || 'Untitled',
          description: doc.description || '',
          owner: doc.ownerUsername || doc.ownerEmail || doc.ownerAddress || 'Unknown',
          timestamp: doc.createdAt ? Math.floor(new Date(doc.createdAt).getTime() / 1000) : Date.now() / 1000,
          category: doc.category || 'other',
          tags: doc.tags || [],
          fileExtension: doc.mimeType || doc.fileExtension || '',
          mimeType: doc.mimeType || null, // Store mimeType separately for viewer
          fileSize: doc.fileSize || 0,
          isVerified: !!doc.transactionHash,
          // Ưu tiên cloudinaryUrl từ API, fallback sang storedFilename nếu là http
          cloudinaryUrl: doc.cloudinaryUrl || (doc.storedFilename?.startsWith('http') ? doc.storedFilename : null)
        }));
        
        setDocuments(mappedDocuments);
      } else {
        setDocuments([]);
      }
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      setError(err.message || 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const statsData = await getStatistics();
      if (statsData) {
        setStats({
          totalDocuments: statsData.totalDocuments,
          totalVerified: statsData.totalVerified,
          totalOwners: statsData.totalOwners
        });
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const filterAndSortDocuments = () => {
    let filtered = [...documents];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredDocuments(filtered);
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDocumentClick = (document: CopyrightDoc) => {
    onDocumentSelect?.(document);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const viewDocument = (e: React.MouseEvent, document: any) => {
    e.stopPropagation();
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Vui lòng đăng nhập để xem tài liệu');
      return;
    }
    
    // Open viewer modal - use mimeType from document or detect from filename
    const mimeType = document.mimeType || detectMimeTypeFromFilename(document.title || document.filename || '');
    
    setViewingDocument({
      id: document.id,
      title: document.title,
      mimeType: mimeType
    });
    setViewerOpen(true);
  };

  // Helper function to detect mimeType from filename extension
  const detectMimeTypeFromFilename = (filename: string): string | undefined => {
    const ext = filename.toLowerCase().split('.').pop();
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
    return ext ? mimeMap[ext] : undefined;
  };

  const downloadDocument = (e: React.MouseEvent, documentId: number, filename: string) => {
    e.stopPropagation();
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Vui lòng đăng nhập để tải xuống tài liệu');
      return;
    }
    
    // Create download link
    const downloadUrl = import.meta.env.VITE_API_BASE_URL 
      ? `${import.meta.env.VITE_API_BASE_URL}/api/copyrights/download/${documentId}`
      : `http://localhost:8080/api/copyrights/download/${documentId}`;
    fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) throw new Error('Không thể tải xuống file');
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error('Download error:', error);
      alert('Không thể tải xuống file. Vui lòng thử lại.');
    });
  };

  if (!isConnected) {
    return (
      <div className={styles.notConnected}>
        <AlertCircle size={48} />
        <h3>Chưa kết nối ví</h3>
        <p>Vui lòng kết nối ví MetaMask để xem tài liệu đã đăng ký bản quyền</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Tài liệu đã đăng ký bản quyền</h2>
          <p>
            {address ? `Tài liệu của ${address.slice(0, 6)}...${address.slice(-4)}` : 
             category ? `Tài liệu loại ${COPYRIGHT_CATEGORY_LABELS[category]}` :
             'Tài liệu của bạn'}
          </p>
        </div>
        
        {stats && (
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.totalDocuments}</span>
              <span className={styles.statLabel}>Tổng tài liệu</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.totalVerified}</span>
              <span className={styles.statLabel}>Đã xác minh</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.totalOwners}</span>
              <span className={styles.statLabel}>Tác giả</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={styles.filters}>
          <div className={styles.searchSection}>
            <div className={styles.searchInput}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề, mô tả hoặc tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterGroup}>
              <Filter size={16} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory | '')}
              >
                <option value="">Tất cả loại</option>
                {Object.entries(COPYRIGHT_CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <Calendar size={16} />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
              >
                <option value="timestamp-desc">Mới nhất</option>
                <option value="timestamp-asc">Cũ nhất</option>
                <option value="title-asc">A-Z</option>
                <option value="title-desc">Z-A</option>
                <option value="category-asc">Loại A-Z</option>
                <option value="category-desc">Loại Z-A</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải tài liệu...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.error}>
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={loadDocuments}>Thử lại</button>
        </div>
      )}

      {/* Documents List */}
      {!loading && !error && (
        <div className={styles.documentsList}>
          {filteredDocuments.length === 0 ? (
            <div className={styles.emptyState}>
              <FileText size={64} />
              <h3>Không có tài liệu</h3>
              <p>
                {searchTerm || selectedCategory ? 
                  'Không tìm thấy tài liệu phù hợp với bộ lọc' :
                  'Chưa có tài liệu nào được đăng ký bản quyền'
                }
              </p>
            </div>
          ) : (
            filteredDocuments.map((document) => (
              <div 
                key={document.documentHash} 
                className={styles.documentCard}
                onClick={() => handleDocumentClick(document)}
              >
                <div className={styles.documentHeader}>
                  <div className={styles.documentTitle}>
                    <FileText size={20} />
                    <h3>{document.title}</h3>
                    <span className={`${styles.category} ${styles[document.category]}`}>
                      {COPYRIGHT_CATEGORY_LABELS[document.category as DocumentCategory]}
                    </span>
                  </div>
                  
                  <div className={styles.documentStatus}>
                    {document.isVerified ? (
                      <div className={styles.verified}>
                        <CheckCircle size={16} />
                        <span>Đã xác minh</span>
                      </div>
                    ) : (
                      <div className={styles.pending}>
                        <Clock size={16} />
                        <span>Chờ xác minh</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.documentContent}>
                  <p className={styles.description}>{document.description}</p>
                  
                  {document.tags.length > 0 && (
                    <div className={styles.tags}>
                      {document.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.documentMeta}>
                  <div className={styles.metaItem}>
                    <User size={14} />
                    <span>{document.owner.slice(0, 6)}...{document.owner.slice(-4)}</span>
                  </div>
                  
                  <div className={styles.metaItem}>
                    <Clock size={14} />
                    <span>{formatTimestamp(document.timestamp)}</span>
                  </div>
                  
                  <div className={styles.metaItem}>
                    <span>{document.fileExtension}</span>
                    <span>•</span>
                    <span>{formatFileSize(document.fileSize)}</span>
                  </div>
                </div>

                <div className={styles.documentHash}>
                  <Hash size={14} />
                  <span 
                    className={styles.hashValue}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(document.documentHash);
                    }}
                    title="Click để copy hash"
                  >
                    {document.documentHash.slice(0, 12)}...{document.documentHash.slice(-8)}
                  </span>
                  <ExternalLink size={12} />
                </div>

                <div className={styles.documentActions}>
                  <button 
                    className={styles.actionButton}
                    onClick={(e) => viewDocument(e, document)}
                    title="Xem tài liệu"
                  >
                    <Eye size={16} />
                    <span>Xem</span>
                  </button>
                  <button 
                    className={styles.actionButton}
                    onClick={(e) => downloadDocument(e, (document as any).id, document.title)}
                    title="Tải xuống"
                  >
                    <Download size={16} />
                    <span>Tải xuống</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Load More Button */}
      {filteredDocuments.length > 0 && (
        <div className={styles.loadMore}>
          <button onClick={loadDocuments}>
            Tải thêm tài liệu
          </button>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewerModal
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setViewingDocument(null);
          }}
          documentId={viewingDocument.id}
          documentTitle={viewingDocument.title}
          mimeType={viewingDocument.mimeType}
          cloudinaryUrl={viewingDocument.cloudinaryUrl}
        />
      )}
    </div>
  );
}

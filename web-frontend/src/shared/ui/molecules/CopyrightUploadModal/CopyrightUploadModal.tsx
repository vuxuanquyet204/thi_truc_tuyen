import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { useCopyright } from '@/features/copyright/hooks';
import { DocumentMetadata, DocumentCategory, COPYRIGHT_CONSTANTS, CopyrightFileType } from '@/types/copyright';
import styles from './CopyrightUploadModal.module.css';

interface CopyrightUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (documentHash: string, transactionHash: string) => void;
}

export default function CopyrightUploadModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CopyrightUploadModalProps): JSX.Element {
  const { 
    isConnected, 
    registerDocument, 
    registerTextDocument,
    checkSimilarity,
    getRegistrationFee,
    isLoading,
    error 
  } = useCopyright();

  const [uploadType, setUploadType] = useState<'file' | 'text'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    title: '',
    description: '',
    category: 'other',
    fileExtension: '',
    fileSize: 0,
    tags: [],
    authorName: '',
    institution: '',
    keywords: [],
    abstract: ''
  });
  const [registrationFee, setRegistrationFee] = useState('0');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCheckingSimilarity, setIsCheckingSimilarity] = useState(false);
  const [similarityResult, setSimilarityResult] = useState<{
    isSimilar: boolean;
    similarityScore: number;
    similarDocuments: Array<{
      id: number;
      filename: string;
      similarityScore: number;
      matchedSections?: any[];
    }>;
    totalDocumentsChecked: number;
    message: string;
  } | null>(null);
  const [showSimilarityWarning, setShowSimilarityWarning] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    documentHash?: string;
    transactionHash?: string;
    error?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newTag, setNewTag] = useState('');

  // Load registration fee when modal opens
  React.useEffect(() => {
    if (isOpen) {
      loadRegistrationFee();
    }
  }, [isOpen, getRegistrationFee]);

  const loadRegistrationFee = async () => {
    try {
      const fee = await getRegistrationFee();
      setRegistrationFee(fee);
    } catch (err) {
      console.error('Failed to load registration fee:', err);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      if (file.size > COPYRIGHT_CONSTANTS.MAX_FILE_SIZE) {
        alert(`File quá lớn. Kích thước tối đa: ${COPYRIGHT_CONSTANTS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
        return;
      }

      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!COPYRIGHT_CONSTANTS.ALLOWED_EXTENSIONS.includes(extension as CopyrightFileType)) {
        alert(`Định dạng file không được hỗ trợ. Các định dạng được hỗ trợ: ${COPYRIGHT_CONSTANTS.ALLOWED_EXTENSIONS.join(', ')}`);
        return;
      }

      setSelectedFile(file);
      setMetadata(prev => ({
        ...prev,
        fileExtension: extension,
        fileSize: file.size,
        title: file.name.replace(/\.[^/.]+$/, '') // Remove extension from title
      }));

      // Auto check similarity when file is selected
      await handleCheckSimilarity(file);
    }
  };

  const handleCheckSimilarity = async (file: File) => {
    if (!file) return;

    setIsCheckingSimilarity(true);
    setSimilarityResult(null);
    setShowSimilarityWarning(false);

    try {
      const result = await checkSimilarity(file);
      console.log('Similarity check result:', result);

      if (result?.similarityInfo) {
        const similarityInfo = result.similarityInfo;
        setSimilarityResult({
          isSimilar: similarityInfo.isSimilar || false,
          similarityScore: similarityInfo.similarityScore || 0,
          similarDocuments: (similarityInfo.similarDocuments || []).map((doc: any) => ({
            id: typeof doc.id === 'string' ? parseInt(doc.id) || 0 : doc.id,
            filename: doc.filename,
            similarityScore: doc.similarityScore || 0,
            matchedSections: doc.matchedSections || []
          })),
          totalDocumentsChecked: similarityInfo.totalDocumentsChecked || 0,
          message: similarityInfo.message || ''
        });

        // Show warning if similarity is detected
        if (similarityInfo.isSimilar && similarityInfo.similarityScore > 0.3) {
          setShowSimilarityWarning(true);
        }
      }
    } catch (err: any) {
      console.error('Error checking similarity:', err);
      // Don't block registration if similarity check fails
      setSimilarityResult({
        isSimilar: false,
        similarityScore: 0,
        similarDocuments: [],
        totalDocumentsChecked: 0,
        message: 'Không thể kiểm tra tương đồng. Bạn vẫn có thể tiếp tục đăng ký.'
      });
    } finally {
      setIsCheckingSimilarity(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && metadata.tags.length < COPYRIGHT_CONSTANTS.MAX_TAGS_COUNT) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleRegister = async () => {
    if (!isConnected) {
      alert('Vui lòng đăng nhập để đăng ký tài liệu');
      return;
    }

    // Validate metadata
    if (!metadata.title.trim()) {
      alert('Vui lòng nhập tiêu đề tài liệu');
      return;
    }

    if (!metadata.description.trim()) {
      alert('Vui lòng nhập mô tả tài liệu');
      return;
    }

    // Warn if high similarity detected
    if (showSimilarityWarning && similarityResult && similarityResult.similarityScore > 0.5) {
      const confirmContinue = window.confirm(
        `Cảnh báo: Tài liệu này có độ tương đồng rất cao (${(similarityResult.similarityScore * 100).toFixed(1)}%) với các tài liệu đã có trong hệ thống.\n\n` +
        `Bạn có chắc chắn muốn tiếp tục đăng ký?`
      );
      if (!confirmContinue) {
        return;
      }
    }

    setIsRegistering(true);
    setRegistrationResult(null);

    try {
      let result;
      
      if (uploadType === 'file') {
        if (!selectedFile) {
          alert('Vui lòng chọn file');
          return;
        }
        result = await registerDocument(selectedFile, metadata);
      } else {
        if (!textContent.trim()) {
          alert('Vui lòng nhập nội dung văn bản');
          return;
        }
        const { fileExtension, fileSize, ...restMetadata } = metadata;
        result = await registerTextDocument(textContent, restMetadata);
      }

      // Debug: Log the full response
      console.log('Registration response:', result);
      
      // Map backend response to expected format
      const mappedResult = {
        success: result?.success === true || result?.success === 'true' || false,
        documentHash: result?.copyright?.hash || result?.copyright?.id?.toString() || result?.hash || result?.id?.toString() || '',
        transactionHash: result?.copyright?.transactionHash || result?.transactionHash || '',
        message: result?.message || '',
        error: undefined
      };
      
      // Only set error if success is explicitly false
      if (!mappedResult.success) {
        mappedResult.error = result?.message || 'Đăng ký bản quyền thất bại';
      }
      
      console.log('Mapped result:', mappedResult);
      setRegistrationResult(mappedResult);

      // Success if we have success=true and documentHash
      if (mappedResult.success && mappedResult.documentHash) {
        console.log('Registration successful!', mappedResult);
        
        onSuccess?.(
          mappedResult.documentHash, 
          mappedResult.transactionHash || 'pending'
        );
        // Reset form after successful registration
        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);
      } else if (mappedResult.success && !mappedResult.documentHash) {
        console.warn('Registration successful but no documentHash:', mappedResult);
      } else {
        console.error('Registration failed:', mappedResult);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setRegistrationResult({
        success: false,
        error: 'Đăng ký bản quyền thất bại'
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTextContent('');
    setMetadata({
      title: '',
      description: '',
      category: 'other',
      fileExtension: '',
      fileSize: 0,
      tags: [],
      authorName: '',
      institution: '',
      keywords: [],
      abstract: ''
    });
    setRegistrationResult(null);
    setSimilarityResult(null);
    setShowSimilarityWarning(false);
    setNewTag('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isRegistering) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return <></>;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Đăng ký bản quyền tài liệu</h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            disabled={isRegistering}
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Connection Status */}
          {!isConnected && (
            <div className={styles.warning}>
              <AlertCircle size={20} />
              <span>Vui lòng đăng nhập để đăng ký bản quyền</span>
            </div>
          )}

          {/* Registration Fee */}
          <div className={styles.feeInfo}>
            <span>Phí đăng ký: {registrationFee} ETH</span>
          </div>

          {/* Upload Type Selection */}
          <div className={styles.uploadTypeSection}>
            <label>Loại tài liệu:</label>
            <div className={styles.uploadTypeButtons}>
              <button
                className={`${styles.uploadTypeButton} ${uploadType === 'file' ? styles.active : ''}`}
                onClick={() => setUploadType('file')}
              >
                <FileText size={16} />
                Upload File
              </button>
              <button
                className={`${styles.uploadTypeButton} ${uploadType === 'text' ? styles.active : ''}`}
                onClick={() => setUploadType('text')}
              >
                <FileText size={16} />
                Nhập văn bản
              </button>
            </div>
          </div>

          {/* File Upload */}
          {uploadType === 'file' && (
            <div className={styles.fileUploadSection}>
              <label>Chọn file tài liệu:</label>
              <div 
                className={styles.fileDropZone}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className={styles.selectedFile}>
                    <FileText size={24} />
                    <div>
                      <p>{selectedFile.name}</p>
                      <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setMetadata(prev => ({ ...prev, fileExtension: '', fileSize: 0 }));
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.dropZoneContent}>
                    <Upload size={32} />
                    <p>Nhấp để chọn file hoặc kéo thả file vào đây</p>
                    <p className={styles.supportedFormats}>
                      Định dạng hỗ trợ: {COPYRIGHT_CONSTANTS.ALLOWED_EXTENSIONS.join(', ')}
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={COPYRIGHT_CONSTANTS.ALLOWED_EXTENSIONS.join(',')}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {/* Similarity Check Result */}
              {isCheckingSimilarity && (
                <div className={styles.similarityChecking}>
                  <Loader2 className={styles.spinner} />
                  <span>Đang kiểm tra tương đồng với các tài liệu trong hệ thống...</span>
                </div>
              )}

              {similarityResult && !isCheckingSimilarity && (
                <div className={`${styles.similarityResult} ${similarityResult.isSimilar ? styles.similarityWarning : styles.similaritySafe}`}>
                  <div className={styles.similarityHeader}>
                    {similarityResult.isSimilar ? (
                      <AlertCircle size={20} className={styles.warningIcon} />
                    ) : (
                      <CheckCircle size={20} className={styles.successIcon} />
                    )}
                    <div>
                      <h4>
                        {similarityResult.isSimilar 
                          ? `Phát hiện tương đồng: ${(similarityResult.similarityScore * 100).toFixed(1)}%`
                          : 'Không phát hiện tương đồng đáng kể'
                        }
                      </h4>
                      <p>
                        Đã kiểm tra {similarityResult.totalDocumentsChecked} tài liệu trong hệ thống
                      </p>
                    </div>
                  </div>

                  {similarityResult.isSimilar && similarityResult.similarDocuments.length > 0 && (
                    <div className={styles.similarDocumentsList}>
                      <p className={styles.similarDocumentsTitle}>Tài liệu tương tự:</p>
                      <div className={styles.similarDocuments}>
                        {similarityResult.similarDocuments.slice(0, 5).map((doc, index) => (
                          <div key={doc.id || index} className={styles.similarDocumentItem}>
                            <div className={styles.similarDocumentInfo}>
                              <FileText size={16} />
                              <span className={styles.similarDocumentName}>{doc.filename}</span>
                            </div>
                            <div className={styles.similarityPercentage}>
                              {(doc.similarityScore * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                        {similarityResult.similarDocuments.length > 5 && (
                          <p className={styles.moreDocuments}>
                            và {similarityResult.similarDocuments.length - 5} tài liệu khác...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {showSimilarityWarning && (
                    <div className={styles.similarityWarningMessage}>
                      <AlertCircle size={16} />
                      <span>
                        Tài liệu này có độ tương đồng cao ({((similarityResult.similarityScore || 0) * 100).toFixed(1)}%) với các tài liệu đã có. 
                        Bạn có chắc chắn muốn tiếp tục đăng ký?
                      </span>
                    </div>
                  )}

                  {selectedFile && (
                    <button
                      className={styles.recheckButton}
                      onClick={() => handleCheckSimilarity(selectedFile)}
                      disabled={isCheckingSimilarity}
                    >
                      {isCheckingSimilarity ? (
                        <>
                          <Loader2 className={styles.spinner} size={16} />
                          Đang kiểm tra...
                        </>
                      ) : (
                        '🔄 Kiểm tra lại'
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Text Input */}
          {uploadType === 'text' && (
            <div className={styles.textInputSection}>
              <label>Nội dung văn bản:</label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Nhập nội dung tài liệu cần đăng ký bản quyền..."
                rows={10}
                maxLength={COPYRIGHT_CONSTANTS.MAX_DESCRIPTION_LENGTH * 10}
              />
              <div className={styles.characterCount}>
                {textContent.length} / {COPYRIGHT_CONSTANTS.MAX_DESCRIPTION_LENGTH * 10}
              </div>
            </div>
          )}

          {/* Metadata Form */}
          <div className={styles.metadataSection}>
            <h3>Thông tin tài liệu</h3>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={metadata.title}
                  onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tiêu đề tài liệu"
                  maxLength={COPYRIGHT_CONSTANTS.MAX_TITLE_LENGTH}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Loại tài liệu *</label>
                <select
                  value={metadata.category}
                  onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value as DocumentCategory }))}
                >
                  {COPYRIGHT_CONSTANTS.SUPPORTED_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Mô tả *</label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả ngắn gọn về tài liệu"
                rows={3}
                maxLength={COPYRIGHT_CONSTANTS.MAX_DESCRIPTION_LENGTH}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Tác giả</label>
                <input
                  type="text"
                  value={metadata.authorName || ''}
                  onChange={(e) => setMetadata(prev => ({ ...prev, authorName: e.target.value }))}
                  placeholder="Tên tác giả"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Tổ chức</label>
                <input
                  type="text"
                  value={metadata.institution || ''}
                  onChange={(e) => setMetadata(prev => ({ ...prev, institution: e.target.value }))}
                  placeholder="Tên tổ chức/trường học"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Tóm tắt</label>
              <textarea
                value={metadata.abstract || ''}
                onChange={(e) => setMetadata(prev => ({ ...prev, abstract: e.target.value }))}
                placeholder="Tóm tắt nội dung tài liệu"
                rows={4}
              />
            </div>

            {/* Tags */}
            <div className={styles.formGroup}>
              <label>Tags</label>
              <div className={styles.tagsInput}>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nhập tag và nhấn Enter"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  maxLength={COPYRIGHT_CONSTANTS.MAX_TAG_LENGTH}
                />
                <button onClick={handleAddTag} disabled={!newTag.trim()}>
                  Thêm
                </button>
              </div>
              <div className={styles.tagsList}>
                {metadata.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className={styles.error}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Result */}
          {registrationResult && (
            <div className={`${styles.result} ${registrationResult.success ? styles.success : styles.error}`}>
              {registrationResult.success ? (
                <>
                  <CheckCircle size={20} />
                  <div>
                    <p>{registrationResult.message || 'Đăng ký bản quyền thành công!'}</p>
                    <p className={styles.hashInfo}>
                      <strong>Document Hash:</strong> {registrationResult.documentHash}
                    </p>
                    {registrationResult.transactionHash && registrationResult.transactionHash !== 'pending' && (
                      <p className={styles.hashInfo}>
                        <strong>Blockchain TX:</strong> {registrationResult.transactionHash}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle size={20} />
                  <div>
                    <p>Đăng ký bản quyền thất bại</p>
                    <p>{registrationResult.error}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button 
              className={styles.cancelButton}
              onClick={handleClose}
              disabled={isRegistering}
            >
              Hủy
            </button>
            <button 
              className={styles.registerButton}
              onClick={handleRegister}
              disabled={
                !isConnected || 
                isRegistering || 
                !metadata.title.trim() || 
                !metadata.description.trim()
              }
            >
              {isRegistering ? (
                <>
                  <Loader2 className={styles.spinner} />
                  Đang đăng ký...
                </>
              ) : (
                `Đăng ký bản quyền (${registrationFee} ETH)`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

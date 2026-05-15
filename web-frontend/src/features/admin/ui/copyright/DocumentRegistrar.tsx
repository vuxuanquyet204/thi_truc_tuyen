import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { DocumentForm } from '@/features/admin/hooks'
import { toast } from '@/foundation/contexts/ToastContext'
import styles from './DocumentRegistrar.module.css';

interface DocumentRegistrarProps {
  onRegister: (form: DocumentForm) => Promise<any>;
  loading?: boolean;
}

export const DocumentRegistrar: React.FC<DocumentRegistrarProps> = ({ 
  onRegister, 
  loading = false 
}) => {
  const [uploadType, setUploadType] = useState<'file' | 'text'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [form, setForm] = useState<DocumentForm>({
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
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      if (file.size > 100 * 1024 * 1024) { // 100MB
        toast.error('File quá lớn. Kích thước tối đa: 100MB');
        return;
      }

      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf'];
      if (!allowedExtensions.includes(extension)) {
        toast.error(`Định dạng file không được hỗ trợ. Các định dạng được hỗ trợ: ${allowedExtensions.join(', ')}`);
        return;
      }

      setSelectedFile(file);
      setForm(prev => ({
        ...prev,
        fileExtension: extension,
        fileSize: file.size,
        title: file.name.replace(/\.[^/.]+$/, '') // Remove extension from title
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && form.tags.length < 10) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề tài liệu');
      return;
    }

    if (!form.description.trim()) {
      toast.error('Vui lòng nhập mô tả tài liệu');
      return;
    }

    if (uploadType === 'file' && !selectedFile) {
      toast.error('Vui lòng chọn file');
      return;
    }

    if (uploadType === 'text' && !textContent.trim()) {
      toast.error('Vui lòng nhập nội dung văn bản');
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const submitForm: DocumentForm = {
        ...form,
        file: selectedFile || undefined,
        content: uploadType === 'text' ? textContent : undefined
      };

      const result = await onRegister(submitForm);

      if (result.success) {
        setSubmitResult({
          success: true,
          message: 'Đăng ký tài liệu thành công!'
        });

        // Reset form
        setForm({
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
        setSelectedFile(null);
        setTextContent('');
        setNewTag('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setSubmitResult({
          success: false,
          error: result.error || 'Đăng ký thất bại'
        });
      }
    } catch (error: any) {
      setSubmitResult({
        success: false,
        error: error.message || 'Đăng ký thất bại'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.documentRegistrar}>
      <div className={styles.header}>
        <h2>Đăng ký tài liệu mới</h2>
        <p>Đăng ký bản quyền tài liệu học thuật trên blockchain</p>
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
                    setForm(prev => ({ ...prev, fileExtension: '', fileSize: 0 }));
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className={styles.dropZoneContent}>
                <Upload size={40} color="var(--primary)" />
                <p>Nhấp để chọn file hoặc kéo thả file vào đây</p>
                <p className={styles.supportedFormats}>
                  Định dạng hỗ trợ: PDF, DOC, DOCX, TXT, MD, RTF
                </p>
                <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '8px' }}>
                  Kích thước tối đa: 100MB
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md,.rtf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Text Input */}
      {uploadType === 'text' && (
        <div className={styles.textInputSection}>
          <label>Nội dung văn bản:</label>
          <div style={{ position: 'relative' }}>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Nhập nội dung tài liệu cần đăng ký bản quyền..."
              rows={12}
              maxLength={10000}
              required
            />
            <div className={styles.characterCount}>
              {textContent.length} / 10000 ký tự
            </div>
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
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nhập tiêu đề tài liệu"
              maxLength={200}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Loại tài liệu *</label>
            <select
              value={form.category}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
              required
            >
              <option value="thesis">Luận văn/Luận án</option>
              <option value="research">Nghiên cứu khoa học</option>
              <option value="paper">Bài báo khoa học</option>
              <option value="report">Báo cáo</option>
              <option value="presentation">Bài thuyết trình</option>
              <option value="coursework">Bài tập lớn</option>
              <option value="assignment">Bài tập</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Mô tả *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Mô tả ngắn gọn về tài liệu"
            rows={3}
            maxLength={1000}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Tác giả</label>
            <input
              type="text"
              value={form.authorName || ''}
              onChange={(e) => setForm(prev => ({ ...prev, authorName: e.target.value }))}
              placeholder="Tên tác giả"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Tổ chức</label>
            <input
              type="text"
              value={form.institution || ''}
              onChange={(e) => setForm(prev => ({ ...prev, institution: e.target.value }))}
              placeholder="Tên tổ chức/trường học"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Tóm tắt</label>
          <textarea
            value={form.abstract || ''}
            onChange={(e) => setForm(prev => ({ ...prev, abstract: e.target.value }))}
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
              maxLength={50}
            />
            <button onClick={handleAddTag} disabled={!newTag.trim()}>
              Thêm
            </button>
          </div>
          <div className={styles.tagsList}>
            {form.tags.map((tag, index) => (
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

      {/* Submit Result */}
      {submitResult && (
        <div className={`${styles.result} ${submitResult.success ? styles.success : styles.error}`}>
          {submitResult.success ? (
            <>
              <CheckCircle size={20} />
              <div>
                <p>Đăng ký tài liệu thành công!</p>
                <p>{submitResult.message}</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={20} />
              <div>
                <p>Đăng ký tài liệu thất bại</p>
                <p>{submitResult.error}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button 
          className={styles.registerButton}
          onClick={handleSubmit}
          disabled={isSubmitting || loading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className={styles.spinner} />
              Đang đăng ký...
            </>
          ) : (
            'Đăng ký bản quyền'
          )}
        </button>
      </div>
    </div>
  );
};
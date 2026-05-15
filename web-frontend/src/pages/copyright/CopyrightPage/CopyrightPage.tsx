import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, 
  Upload, 
  FileText, 
  Search, 
  BarChart3, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  FileCheck,
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import CopyrightUploadModal from '@/shared/ui/molecules/CopyrightUploadModal';
import CopyrightDocumentsList from '@/shared/ui/molecules/CopyrightDocumentsList';
import { useCopyright } from '@/features/copyright/hooks';
import { DocumentCopyright, CopyrightStats } from '@/foundation/types/copyright';
import styles from './CopyrightPage.module.css';

export default function CopyrightPage(): JSX.Element {
  const { 
    isConnected, 
    currentAddress,
    getStatistics,
    getAnalytics,
    getBlockchainStatus,
    checkSimilarity,
    isLoading 
  } = useCopyright();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentCopyright | null>(null);
  const [stats, setStats] = useState<CopyrightStats | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-documents' | 'all-documents' | 'analytics' | 'check-duplicate'>('my-documents');
  const [searchAddress, setSearchAddress] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Check duplicate states
  const [checkFile, setCheckFile] = useState<File | null>(null);
  const [isCheckingSimilarity, setIsCheckingSimilarity] = useState(false);
  const [similarityCheckResult, setSimilarityCheckResult] = useState<{
    isSimilar: boolean;
    similarityScore: number;
    similarDocuments: Array<{
      id: number;
      filename: string;
      similarityScore: number;
      similarityPercentage?: string;
      owner?: string;
      ownerUsername?: string;
      ownerEmail?: string;
      createdAt?: string;
    }>;
    totalDocumentsChecked: number;
    message: string;
  } | null>(null);
  const checkFileInputRef = useRef<HTMLInputElement>(null);

  // Load statistics when component mounts
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        console.log('Loading statistics...');
        const statsData = await getStatistics();
        console.log('Statistics loaded:', statsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load statistics:', error);
        // Set empty stats to prevent UI from breaking
        setStats({
          totalDocuments: 0,
          totalVerified: 0,
          totalOwners: 0,
          contractBalance: '0'
        });
      }
    };

    if (isConnected) {
      loadStatistics();
    }
  }, [isConnected, getStatistics]);


  // Load analytics when analytics tab is active
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!isConnected || activeTab !== 'analytics') return;
      
      setLoadingAnalytics(true);
      try {
        const analyticsData = await getAnalytics();
        console.log('Analytics data loaded:', analyticsData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    loadAnalytics();
  }, [isConnected, activeTab, getAnalytics]);

  const handleUploadSuccess = useCallback(async (documentHash: string, transactionHash: string) => {
    console.log('Document registered successfully:', { documentHash, transactionHash });
    setShowUploadModal(false);
    // Refresh statistics
    try {
      const statsData = await getStatistics();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to refresh statistics:', error);
    }
  }, [getStatistics]);

  const handleDocumentSelect = (document: DocumentCopyright) => {
    setSelectedDocument(document);
  };

  const handleSearchAddress = () => {
    if (searchAddress.trim()) {
      // Navigate to search results or show documents for specific address
      console.log('Searching for address:', searchAddress);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('vi-VN');
  };

  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - (timestamp * 1000);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
    if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
    return `${Math.floor(days / 365)} năm trước`;
  };

  // Handle file select for duplicate check
  const handleCheckFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCheckFile(file);
      setSimilarityCheckResult(null);
    }
  };

  // Handle similarity check
  const handleCheckSimilarity = async () => {
    if (!checkFile) {
      alert('Vui lòng chọn file để kiểm tra');
      return;
    }

    setIsCheckingSimilarity(true);
    setSimilarityCheckResult(null);

    try {
      const result = await checkSimilarity(checkFile);
      console.log('=== SIMILARITY CHECK DEBUG ===');
      console.log('Full result:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', result ? Object.keys(result) : 'null');
      console.log('Result.similarityInfo exists?', !!result?.similarityInfo);
      console.log('Result.data exists?', !!result?.data);
      console.log('Result.isSimilar exists?', result?.isSimilar !== undefined);
      console.log('Result stringified:', JSON.stringify(result, null, 2));

      // Handle different response structures
      let similarityInfo: any = null;
      
      // Try multiple possible structures
      if (result?.similarityInfo) {
        // Standard structure: { success, message, similarityInfo: {...} }
        similarityInfo = result.similarityInfo;
        console.log('✓ Found similarityInfo in result.similarityInfo');
      } else if (result?.data?.similarityInfo) {
        // Nested structure: { data: { similarityInfo: {...} } }
        similarityInfo = result.data.similarityInfo;
        console.log('✓ Found similarityInfo in result.data.similarityInfo');
      } else if (result?.data && (result.data as any).isSimilar !== undefined) {
        // Data is already similarityInfo
        similarityInfo = result.data;
        console.log('✓ Found similarityInfo as result.data');
      } else if ((result as any)?.isSimilar !== undefined) {
        // Already similarityInfo structure
        similarityInfo = result;
        console.log('✓ Found similarityInfo as direct result');
      } else {
        // Last resort: check if result itself has the structure
        console.warn('⚠ Could not find similarityInfo in any expected location');
        console.warn('Result structure:', {
          hasSimilarityInfo: !!result?.similarityInfo,
          hasData: !!result?.data,
          hasIsSimilar: (result as any)?.isSimilar !== undefined,
          resultKeys: result ? Object.keys(result) : []
        });
      }
      
      console.log('Extracted similarityInfo:', similarityInfo);
      console.log('SimilarityInfo keys:', similarityInfo ? Object.keys(similarityInfo) : 'null');

      if (similarityInfo) {
        // Map similar documents với đầy đủ thông tin
        const mappedDocuments = ((similarityInfo.similarDocuments || []) as any[]).map((doc: any) => ({
          id: doc.id,
          filename: doc.filename,
          similarityScore: doc.similarityScore || 0,
          similarityPercentage: doc.similarityPercentage || ((doc.similarityScore || 0) * 100).toFixed(1),
          owner: doc.owner || doc.ownerUsername || doc.ownerEmail || doc.ownerAddress || 'Không xác định',
          ownerUsername: doc.ownerUsername,
          ownerEmail: doc.ownerEmail,
          ownerAddress: doc.ownerAddress,
          createdAt: doc.createdAt
        }));
        
        console.log('Setting similarity result:', {
          isSimilar: similarityInfo.isSimilar,
          similarityScore: similarityInfo.similarityScore,
          documentsCount: mappedDocuments.length
        });
        
        setSimilarityCheckResult({
          isSimilar: similarityInfo.isSimilar || false,
          similarityScore: similarityInfo.similarityScore || 0,
          similarDocuments: mappedDocuments,
          totalDocumentsChecked: similarityInfo.totalDocumentsChecked || similarityInfo.totalChecked || 0,
          message: similarityInfo.message || ''
        });
      } else {
        console.error('❌ No similarityInfo found in result');
        console.error('Full result object:', result);
        console.error('Result structure analysis:', {
          type: typeof result,
          isArray: Array.isArray(result),
          keys: result ? Object.keys(result) : [],
          stringified: JSON.stringify(result, null, 2)
        });
        
        // Try to show what we got
        const errorMsg = result 
          ? `Không tìm thấy thông tin tương đồng trong response. Cấu trúc: ${JSON.stringify(Object.keys(result))}`
          : 'Không nhận được response từ server';
        alert(errorMsg);
      }
    } catch (err: any) {
      console.error('Error checking similarity:', err);
      alert('Không thể kiểm tra tương đồng: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setIsCheckingSimilarity(false);
    }
  };

  // Reset check duplicate form
  const resetCheckDuplicate = () => {
    setCheckFile(null);
    setSimilarityCheckResult(null);
    if (checkFileInputRef.current) {
      checkFileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.copyrightPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div className={styles.iconContainer}>
              <Shield size={32} />
            </div>
            <div>
              <h1>Bảo vệ bản quyền tài liệu</h1>
              <p>Đăng ký và quản lý bản quyền tài liệu học thuật trên blockchain</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            {isConnected ? (
              <>
                <button 
                  className={styles.uploadButton}
                  onClick={() => setShowUploadModal(true)}
                >
                  <Plus size={20} />
                  Đăng ký tài liệu
                </button>
                <button 
                  className={styles.searchButton}
                  onClick={() => setShowSearch(!showSearch)}
                >
                  <Search size={20} />
                  Tìm kiếm
                </button>
              </>
            ) : (
              <div className={styles.notConnected}>
                <AlertCircle size={20} />
                <span>Vui lòng đăng nhập để sử dụng</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className={styles.searchBar}>
            <div className={styles.searchInput}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Nhập địa chỉ ví để tìm kiếm tài liệu..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
              />
              <button onClick={handleSearchAddress}>Tìm kiếm</button>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FileText size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.totalDocuments}</h3>
              <p>Tổng tài liệu</p>
              <span className={styles.statChange}>+12% tháng này</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.totalVerified}</h3>
              <p>Tài liệu đã xác minh</p>
              <span className={styles.statChange}>+8% tháng này</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.totalOwners}</h3>
              <p>Tác giả đăng ký</p>
              <span className={styles.statChange}>+5% tháng này</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <BarChart3 size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.contractBalance}</h3>
              <p>ETH trong hợp đồng</p>
              <span className={styles.statChange}>Phí đăng ký</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className={styles.navigation}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'my-documents' ? styles.active : ''}`}
            onClick={() => setActiveTab('my-documents')}
          >
            <FileText size={16} />
            Tài liệu của tôi
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'all-documents' ? styles.active : ''}`}
            onClick={() => setActiveTab('all-documents')}
          >
            <Search size={16} />
            Tất cả tài liệu
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} />
            Thống kê
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'check-duplicate' ? styles.active : ''}`}
            onClick={() => setActiveTab('check-duplicate')}
          >
            <FileCheck size={16} />
            Kiểm tra trùng lặp
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'my-documents' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Tài liệu của tôi</h2>
              <p>Quản lý các tài liệu đã đăng ký bản quyền</p>
            </div>
            <CopyrightDocumentsList 
              address={currentAddress || undefined}
              onDocumentSelect={handleDocumentSelect}
            />
          </div>
        )}

        {activeTab === 'all-documents' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Tất cả tài liệu</h2>
              <p>Khám phá tài liệu đã đăng ký bản quyền trên hệ thống</p>
            </div>
            <CopyrightDocumentsList 
              showFilters={true}
              onDocumentSelect={handleDocumentSelect}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Thống kê hệ thống</h2>
              <p>Phân tích và báo cáo về hoạt động đăng ký bản quyền</p>
            </div>
            
            {loadingAnalytics ? (
              <div className={styles.loadingContainer}>
                <p>Đang tải dữ liệu phân tích...</p>
              </div>
            ) : analytics ? (
              <div className={styles.analyticsGrid}>
                {/* Category Distribution Chart */}
                {analytics.categoryDistribution && analytics.categoryDistribution.length > 0 && (
                  <div className={styles.analyticsCard}>
                    <h3>📊 Phân bố theo danh mục tài liệu</h3>
                    <p className={styles.chartSubtitle}>Số lượng tài liệu đã đăng ký theo từng danh mục</p>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={analytics.categoryDistribution.map((item: any) => ({
                        name: item.category || 'Chưa phân loại',
                        'Số lượng': parseInt(item.count) || 0
                      }))} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis 
                          label={{ value: 'Số lượng tài liệu', angle: -90, position: 'insideLeft' }}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value} tài liệu`, 'Số lượng']}
                          labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                        <Bar dataKey="Số lượng" fill="#10b981" radius={[8, 8, 0, 0]}>
                          {analytics.categoryDistribution.map((_: any, index: number) => {
                            const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Registration Trends Chart - Daily */}
                {analytics.registrationTrends && analytics.registrationTrends.length > 0 && (
                  <div className={styles.analyticsCard}>
                    <h3>📈 Xu hướng đăng ký hàng ngày</h3>
                    <p className={styles.chartSubtitle}>Số lượng tài liệu đăng ký trong 30 ngày gần đây</p>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={analytics.registrationTrends.map((item: any) => ({
                        date: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                        'Số lượng đăng ký': parseInt(item.count) || 0
                      }))} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#6b7280', fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          label={{ value: 'Số lượng', angle: -90, position: 'insideLeft' }}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value} tài liệu`, 'Số lượng đăng ký']}
                          labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Số lượng đăng ký" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Monthly Registration Stats */}
                {analytics.monthlyStats && analytics.monthlyStats.length > 0 && (
                  <div className={styles.analyticsCard}>
                    <h3>📅 Thống kê theo tháng</h3>
                    <p className={styles.chartSubtitle}>Tổng số tài liệu đăng ký trong 12 tháng gần đây</p>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={analytics.monthlyStats.map((item: any) => {
                        const monthDate = new Date(item.month);
                        return {
                          name: monthDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
                          'Số lượng': parseInt(item.count) || 0
                        };
                      }).reverse()} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fill: '#6b7280', fontSize: 11 }}
                        />
                        <YAxis 
                          label={{ value: 'Số lượng tài liệu', angle: -90, position: 'insideLeft' }}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value} tài liệu`, 'Số lượng']}
                          labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                        <Bar dataKey="Số lượng" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Top Authors Chart */}
                {analytics.topAuthors && analytics.topAuthors.length > 0 && (
                  <div className={styles.analyticsCard}>
                    <h3>👥 Top tác giả đăng ký nhiều nhất</h3>
                    <p className={styles.chartSubtitle}>Danh sách 10 tác giả có nhiều tài liệu đăng ký nhất</p>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={analytics.topAuthors.slice(0, 10).map((item: any) => ({
                        name: item.author || item.ownerUsername || item.ownerEmail || item.ownerAddress?.slice(0, 10) + '...' || 'Không xác định',
                        'Số tài liệu': parseInt(item.documentCount) || 0
                      }))} layout="vertical" margin={{ top: 20, right: 30, left: 120, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          type="number" 
                          label={{ value: 'Số lượng tài liệu', position: 'insideBottom', offset: -5 }}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={120}
                          tick={{ fill: '#6b7280', fontSize: 11 }}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value} tài liệu`, 'Số tài liệu']}
                          labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                        <Bar dataKey="Số tài liệu" fill="#f59e0b" radius={[0, 8, 8, 0]}>
                          {analytics.topAuthors.slice(0, 10).map((_: any, index: number) => {
                            const colors = ['#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#14b8a6'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* File Type Distribution */}
                {analytics.fileTypeDistribution && analytics.fileTypeDistribution.length > 0 && (
                  <div className={styles.analyticsCard}>
                    <h3>📄 Phân bố loại file</h3>
                    <p className={styles.chartSubtitle}>Tỷ lệ các loại định dạng file đã đăng ký</p>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={analytics.fileTypeDistribution.map((item: any) => {
                            const mimeType = item.mimeType || '';
                            let displayName = 'Khác';
                            if (mimeType.includes('pdf')) displayName = 'PDF';
                            else if (mimeType.includes('word') || mimeType.includes('document')) displayName = 'Word (DOC/DOCX)';
                            else if (mimeType.includes('image')) displayName = 'Hình ảnh';
                            else if (mimeType.includes('text')) displayName = 'Văn bản';
                            else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) displayName = 'Excel';
                            else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) displayName = 'PowerPoint';
                            else if (mimeType) displayName = mimeType.split('/')[1]?.toUpperCase() || 'Khác';
                            return {
                              name: displayName,
                              value: parseInt(item.count) || 0
                            };
                          })}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent, value }: any) => `${name}\n${value} (${(percent * 100).toFixed(1)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.fileTypeDistribution.map((_: any, index: number) => {
                            const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#06b6d4'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => `${value} tài liệu`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Verification Stats */}
                <div className={styles.analyticsCard}>
                  <h3>✅ Tỷ lệ xác minh tài liệu</h3>
                  <p className={styles.chartSubtitle}>Thống kê trạng thái xác minh của các tài liệu đã đăng ký</p>
                  <div className={styles.verificationStats}>
                    <div className={styles.verificationItem}>
                      <CheckCircle size={24} className={styles.verifiedIcon} />
                      <div>
                        <div className={styles.verificationLabel}>Đã xác minh</div>
                        <div className={styles.verificationValue}>{stats?.totalVerified || 0} tài liệu</div>
                      </div>
                    </div>
                    <div className={styles.verificationItem}>
                      <Clock size={24} className={styles.pendingIcon} />
                      <div>
                        <div className={styles.verificationLabel}>Chờ xác minh</div>
                        <div className={styles.verificationValue}>{(stats?.totalDocuments || 0) - (stats?.totalVerified || 0)} tài liệu</div>
                      </div>
                    </div>
                    <div className={styles.verificationRate}>
                      <div className={styles.rateLabel}>Tỷ lệ xác minh</div>
                      <div className={styles.rateValue}>
                        {stats && stats.totalDocuments > 0 ? ((stats.totalVerified / stats.totalDocuments) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <BarChart3 size={48} />
                <p>Chưa có dữ liệu phân tích</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'check-duplicate' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>🔍 Kiểm tra trùng lặp & Đạo văn</h2>
              <p>Kiểm tra tài liệu của bạn có trùng lặp hoặc tương đồng với các tài liệu đã có trong hệ thống</p>
            </div>

            <div className={styles.checkDuplicateSection}>
              {/* File Upload Area */}
              <div className={styles.checkFileUpload}>
                <label className={styles.uploadLabel}>Chọn file cần kiểm tra:</label>
                <div 
                  className={styles.checkFileDropZone}
                  onClick={() => checkFileInputRef.current?.click()}
                >
                  {checkFile ? (
                    <div className={styles.selectedCheckFile}>
                      <FileText size={32} />
                      <div>
                        <p className={styles.fileName}>{checkFile.name}</p>
                        <p className={styles.fileSize}>{(checkFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          resetCheckDuplicate();
                        }}
                        className={styles.removeFileButton}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.dropZoneContent}>
                      <Upload size={48} />
                      <p>Nhấp để chọn file hoặc kéo thả file vào đây</p>
                      <p className={styles.supportedFormats}>
                        Hỗ trợ: PDF, DOC, DOCX, TXT, và các định dạng văn bản khác
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={checkFileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.rtf"
                  onChange={handleCheckFileSelect}
                  style={{ display: 'none' }}
                />

                {checkFile && (
                  <button
                    className={styles.checkButton}
                    onClick={handleCheckSimilarity}
                    disabled={isCheckingSimilarity}
                  >
                    {isCheckingSimilarity ? (
                      <>
                        <Loader2 className={styles.spinner} size={20} />
                        Đang kiểm tra...
                      </>
                    ) : (
                      <>
                        <FileCheck size={20} />
                        Bắt đầu kiểm tra
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Similarity Check Result */}
              {isCheckingSimilarity && (
                <div className={styles.checkingStatus}>
                  <Loader2 className={styles.spinner} size={24} />
                  <div>
                    <h3>Đang kiểm tra tương đồng...</h3>
                    <p>Hệ thống đang so sánh tài liệu của bạn với tất cả tài liệu trong hệ thống</p>
                  </div>
                </div>
              )}

              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && similarityCheckResult && (
                <div className={styles.debugInfo}>
                  Debug: isSimilar={String(similarityCheckResult.isSimilar)}, 
                  score={similarityCheckResult.similarityScore}, 
                  docs={similarityCheckResult.similarDocuments.length}
                </div>
              )}

              {similarityCheckResult && !isCheckingSimilarity && (
                <div className={styles.similarityResultCard}>
                  <div className={`${styles.resultHeader} ${similarityCheckResult.isSimilar ? styles.resultWarning : styles.resultSafe}`}>
                    <div className={styles.resultIcon}>
                      {similarityCheckResult.isSimilar ? (
                        <AlertTriangle size={32} className={styles.warningIcon} />
                      ) : (
                        <CheckCircle size={32} className={styles.successIcon} />
                      )}
                    </div>
                    <div className={styles.resultInfo}>
                      <h3>
                        {similarityCheckResult.isSimilar 
                          ? `Phát hiện tương đồng: ${(similarityCheckResult.similarityScore * 100).toFixed(1)}%`
                          : 'Không phát hiện tương đồng đáng kể'
                        }
                      </h3>
                      <p>
                        Đã kiểm tra <strong>{similarityCheckResult.totalDocumentsChecked}</strong> tài liệu trong hệ thống
                      </p>
                      {similarityCheckResult.isSimilar && (
                        <div className={styles.similarityScoreBadge}>
                          <span>Độ tương đồng: </span>
                          <strong>{(similarityCheckResult.similarityScore * 100).toFixed(1)}%</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {similarityCheckResult.isSimilar && similarityCheckResult.similarDocuments.length > 0 && (
                    <div className={styles.similarDocumentsSection}>
                      <h4>📋 Danh sách tài liệu tương tự:</h4>
                      <div className={styles.similarDocumentsTable}>
                        <div className={styles.tableHeader}>
                          <div className={styles.tableCol}>STT</div>
                          <div className={styles.tableCol}>Tên tài liệu</div>
                          <div className={styles.tableCol}>Tác giả</div>
                          <div className={styles.tableCol}>Độ tương đồng</div>
                          <div className={styles.tableCol}>Ngày đăng ký</div>
                        </div>
                        {similarityCheckResult.similarDocuments.map((doc, index) => (
                          <div key={doc.id || index} className={styles.tableRow}>
                            <div className={styles.tableCol}>{index + 1}</div>
                            <div className={styles.tableCol}>
                              <FileText size={16} />
                              <span className={styles.documentName}>{doc.filename}</span>
                            </div>
                            <div className={styles.tableCol}>
                              {doc.owner || 'Không xác định'}
                            </div>
                            <div className={styles.tableCol}>
                              <span className={styles.similarityBadge}>
                                {doc.similarityPercentage || ((doc.similarityScore || 0) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className={styles.tableCol}>
                              {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {similarityCheckResult.isSimilar && (
                    <div className={styles.plagiarismWarning}>
                      <AlertTriangle size={20} />
                      <div>
                        <h4>Cảnh báo về đạo văn</h4>
                        <p>
                          Tài liệu của bạn có độ tương đồng cao ({((similarityCheckResult.similarityScore || 0) * 100).toFixed(1)}%) 
                          với {similarityCheckResult.similarDocuments.length} tài liệu đã có trong hệ thống. 
                          Vui lòng đảm bảo bạn đã trích dẫn đầy đủ nguồn tham khảo.
                        </p>
                      </div>
                    </div>
                  )}

                  {!similarityCheckResult.isSimilar && (
                    <div className={styles.noSimilarityMessage}>
                      <CheckCircle size={24} />
                      <p>
                        Tài liệu của bạn không có tương đồng đáng kể với các tài liệu trong hệ thống. 
                        Bạn có thể yên tâm đăng ký bản quyền.
                      </p>
                    </div>
                  )}

                  <button
                    className={styles.resetCheckButton}
                    onClick={resetCheckDuplicate}
                  >
                    Kiểm tra tài liệu khác
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <CopyrightUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className={styles.documentModal}>
          <div className={styles.modalOverlay} onClick={() => setSelectedDocument(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{selectedDocument.title}</h2>
                <button onClick={() => setSelectedDocument(null)}>×</button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.documentInfo}>
                  <div className={styles.infoRow}>
                    <label>Hash:</label>
                    <span className={styles.hash}>{selectedDocument.documentHash}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Tác giả:</label>
                    <span>{selectedDocument.owner}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Loại:</label>
                    <span>{selectedDocument.category}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Đăng ký:</label>
                    <span>{formatDate(selectedDocument.timestamp)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Trạng thái:</label>
                    <span className={selectedDocument.isVerified ? styles.verified : styles.pending}>
                      {selectedDocument.isVerified ? 'Đã xác minh' : 'Chờ xác minh'}
                    </span>
                  </div>
                </div>
                
                <div className={styles.documentDescription}>
                  <h3>Mô tả</h3>
                  <p>{selectedDocument.description}</p>
                </div>

                {selectedDocument.tags.length > 0 && (
                  <div className={styles.documentTags}>
                    <h3>Tags</h3>
                    <div className={styles.tagsList}>
                      {selectedDocument.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

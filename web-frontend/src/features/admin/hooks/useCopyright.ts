import { useState, useEffect, useCallback } from 'react';
import { copyrightService, DocumentMetadata, DocumentCopyright, CopyrightStats } from '@/features/copyright/api';
import { copyrightApi } from '@/features/copyright/api/adminCopyrightApi';

// Admin-specific types
export interface AdminDocument extends DocumentCopyright {
  id: string;
  author: string;
  institution?: string;
  status: 'pending' | 'verified' | 'disputed' | 'rejected' | 'expired';
  registrationDate: string;
  verificationDate?: string;
  disputes?: AdminDispute[];
  verificationHistory?: AdminVerification[];
  fileType?: string;
  metadata?: Record<string, unknown>;
  hash?: string;
  blockchainHash?: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  license?: string;
}

export interface AdminDispute {
  id: string;
  documentId: string;
  disputerAddress: string;
  reason: string;
  evidence: string[];
  status: 'open' | 'resolved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface AdminVerification {
  id: string;
  documentId: string;
  verifierAddress: string;
  status: 'approved' | 'rejected';
  comments?: string;
  timestamp: string;
}

export interface AdminDashboard {
  recentDocuments: AdminDocument[];
  pendingVerifications: AdminDocument[];
  disputedDocuments: AdminDocument[];
  blockchainStatus: {
    isConnected: boolean;
    lastBlock: number;
    averageGasPrice: string;
    networkCongestion: string;
    estimatedConfirmationTime: string;
  };
}

export interface AdminStats extends CopyrightStats {
  disputedDocuments: number;
  rejectedDocuments: number;
  pendingVerifications: number;
  averageVerificationTime: number;
  blockchainTransactions: number;
  registrationFee?: string;
  verificationFee?: string;
}

export interface DocumentForm {
  title: string;
  description: string;
  category: string;
  fileExtension?: string;
  fileSize?: number;
  tags: string[];
  authorName?: string;
  author?: string;
  institution?: string;
  keywords?: string[];
  references?: string[];
  abstract?: string;
  file?: File;
  content?: string;
  language?: string;
  version?: string;
  license?: string;
  metadata?: Record<string, unknown>;
}

export interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  includeMetadata: boolean;
  includeVerificationHistory: boolean;
  includeDisputes: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface AdminFilters {
  status?: string[];
  category?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
  verified?: boolean;
  disputed?: boolean;
}

export interface AdminResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}


export function useCopyright() {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalDocuments: 0,
    totalVerified: 0,
    totalOwners: 0,
    contractBalance: '0',
    disputedDocuments: 0,
    rejectedDocuments: 0,
    pendingVerifications: 0,
    averageVerificationTime: 0,
    blockchainTransactions: 0
  });
  const [dashboard, setDashboard] = useState<AdminDashboard>({
    recentDocuments: [],
    pendingVerifications: [],
    disputedDocuments: [],
    blockchainStatus: {
      isConnected: false,
      lastBlock: 0,
      averageGasPrice: '0',
      networkCongestion: 'Low',
      estimatedConfirmationTime: '0'
    }
  });
  const [blockchainInfo, setBlockchainInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminFilters>({});
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);

  // Initialize - Load data from API
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Load documents from API
        const docs = await copyrightApi.getAll();
        setDocuments(docs);
        
        // Load stats from API
        const apiStats = await copyrightApi.getStats();
        setStats(prev => ({
          ...prev,
          ...apiStats
        }));
        
        // Try to connect blockchain (optional)
        try {
          const isConnected = await copyrightService.connectWallet();
          if (isConnected) {
            const blockchainStats = await copyrightService.getStatistics();
            if (blockchainStats) {
              setStats(prev => ({
                ...prev,
                contractBalance: blockchainStats.contractBalance || prev.contractBalance
              }));
            }
          }
        } catch (blockchainErr) {
          console.warn('Blockchain connection failed (optional):', blockchainErr);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(async () => {
      try {
        await refreshData();
      } catch (err) {
        console.error('Real-time update failed:', err);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isRealTimeEnabled]);

  const registerDocument = useCallback(async (form: DocumentForm): Promise<AdminResult> => {
    setLoading(true);
    setError(null);

    try {
      // Register via API
      const apiResult = await copyrightApi.register({
        title: form.title,
        author: form.authorName || 'Unknown',
        description: form.description,
        file: form.file,
        metadata: {
          category: form.category,
          fileExtension: form.fileExtension,
          fileSize: form.fileSize,
          tags: form.tags,
          institution: form.institution,
          keywords: form.keywords,
          abstract: form.abstract
        }
      });

      if (apiResult.success) {
        // Optionally register on blockchain
        try {
          if (form.file) {
            const metadata: DocumentMetadata = {
              title: form.title,
              description: form.description,
              category: form.category as DocumentMetadata['category'],
              fileExtension: form.fileExtension,
              fileSize: form.fileSize,
              tags: form.tags,
              authorName: form.authorName,
              institution: form.institution,
              keywords: form.keywords,
              abstract: form.abstract
            };
            
            await copyrightService.registerDocument(form.file, metadata);
          }
        } catch (blockchainErr) {
          console.warn('Blockchain registration failed (optional):', blockchainErr);
        }

        // Refresh documents list
        const docs = await copyrightApi.getAll();
        setDocuments(docs);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalDocuments: prev.totalDocuments + 1
        }));

        return apiResult;
      } else {
        return apiResult;
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      return {
        success: false,
        error: err.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyDocument = useCallback(async (documentId: string): Promise<AdminResult & { verified?: boolean }> => {
    setLoading(true);
    setError(null);

    try {
      // Verify via API
      const result = await copyrightApi.verify(documentId);
      
      if (result.success) {
        // Refresh documents list
        const docs = await copyrightApi.getAll();
        setDocuments(docs);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalVerified: prev.totalVerified + 1,
          pendingVerifications: Math.max(0, prev.pendingVerifications - 1)
        }));

        return result;
      } else {
        return result;
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      return {
        success: false,
        verified: false,
        error: err.message || 'Verification failed'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (documentId: string): Promise<AdminResult> => {
    setLoading(true);
    setError(null);

    try {
      // Delete via API
      const result = await copyrightApi.delete(documentId);
      
      if (result.success) {
        // Refresh documents list
        const docs = await copyrightApi.getAll();
        setDocuments(docs);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalDocuments: Math.max(0, prev.totalDocuments - 1)
        }));

        return result;
      } else {
        return result;
      }
    } catch (err: any) {
      setError(err.message || 'Delete failed');
      return {
        success: false,
        error: err.message || 'Delete failed'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDocument = useCallback(async (documentId: string, form: DocumentForm): Promise<AdminResult> => {
    setLoading(true);
    setError(null);

    try {
      // Update via API
      const result = await copyrightApi.update(documentId, {
        title: form.title,
        author: form.authorName || 'Unknown',
        description: form.description,
        fileHash: '', // Keep existing
        metadata: {
          category: form.category,
          fileExtension: form.fileExtension,
          fileSize: form.fileSize,
          tags: form.tags,
          institution: form.institution,
          keywords: form.keywords,
          abstract: form.abstract
        }
      });

      if (result.success) {
        // Refresh documents list
        const docs = await copyrightApi.getAll();
        setDocuments(docs);

        return result;
      } else {
        return result;
      }
    } catch (err: any) {
      setError(err.message || 'Update failed');
      return {
        success: false,
        error: err.message || 'Update failed'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const exportDocuments = useCallback(async (options: ExportOptions): Promise<AdminResult> => {
    setLoading(true);
    setError(null);

    try {
      // Export via API
      const result = await copyrightApi.export(options);
      return result;
    } catch (err: any) {
      setError(err.message || 'Export failed');
      return {
        success: false,
        error: err.message || 'Export failed'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<AdminFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Refresh documents from API
      const docs = await copyrightApi.getAll();
      setDocuments(docs);
      
      // Refresh stats from API
      const apiStats = await copyrightApi.getStats();
      setStats(prev => ({
        ...prev,
        ...apiStats
      }));

      // Refresh dashboard
      setDashboard(prev => ({
        ...prev,
        recentDocuments: docs.slice(0, 3),
        pendingVerifications: docs.filter((doc: AdminDocument) => doc.status === 'pending'),
        disputedDocuments: docs.filter((doc: AdminDocument) => doc.status === 'disputed')
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, []);

  const getDocumentById = useCallback((id: string): AdminDocument | null => {
    return documents.find(doc => doc.id === id) || null;
  }, [documents]);

  return {
    // Data
    documents,
    stats,
    dashboard,
    blockchainInfo,
    loading,
    error,
    filters,
    isRealTimeEnabled,

    // Actions
    registerDocument,
    verifyDocument,
    deleteDocument,
    updateDocument,
    exportDocuments,
    updateFilters,
    clearFilters,
    refreshData,
    setIsRealTimeEnabled,
    getDocumentById
  };
}

export default useCopyright;
import { useState, useCallback } from 'react';
import { copyrightService } from '@/features/copyright/api/copyrightService';
import type { DocumentMetadata, CopyrightStats } from '@/features/copyright/api/blockchainCopyrightService';

interface VerificationResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

interface RegistrationResult {
  success: boolean;
  transactionHash?: string;
  documentHash?: string;
  error?: string;
}

export function useCopyright() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isConnected = !!localStorage.getItem('accessToken');
  
  const getUserAddress = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || user.email || null;
      }
    } catch (err) {
      console.error('Failed to parse user data:', err);
    }
    return null;
  };
  
  const currentAddress = getUserAddress();

  const getRegistrationFee = async () => {
    return '0.01';
  };

  const registerDocument = async (file: File, metadata: Omit<DocumentMetadata, 'fileExtension' | 'fileSize'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(metadata).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item as string));
        } else {
          formData.append(key, value as string | Blob);
        }
      });

      const response = await copyrightService.registerDocument(formData);
      console.log('registerTextDocument response:', response);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to register document';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerTextDocument = async (text: string, metadata: Omit<DocumentMetadata, 'fileExtension' | 'fileSize'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      const file = new Blob([text], { type: 'text/plain' });
      formData.append('file', file, metadata.title || 'document.txt');
      Object.entries(metadata).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item as string));
        } else {
          formData.append(key, value as string | Blob);
        }
      });

      const response = await copyrightService.registerDocument(formData);
      console.log('registerTextDocument response:', response);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to register document';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getDocument = async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await copyrightService.getCopyrightById(documentId);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch document';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDocument = async (documentId: string, updates: Partial<DocumentMetadata>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await copyrightService.updateCopyright(documentId, updates);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update document';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await copyrightService.deleteCopyright(documentId);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete document';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkSimilarity = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('document', file);
      const response = await copyrightService.checkSimilarity(formData);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to check similarity';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const searchDocuments = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await copyrightService.searchDocuments(query);
      return response.data || [];
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to search documents';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getStatistics = useCallback(async (): Promise<CopyrightStats> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await copyrightService.getStatistics();
      console.log('useCopyright.getStatistics - response from service:', response);
      console.log('useCopyright.getStatistics - response type:', typeof response);
      console.log('useCopyright.getStatistics - response keys:', response ? Object.keys(response) : 'null');
      
      let statsData: CopyrightStats;
      
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response: response is not an object. Response: ' + JSON.stringify(response));
      }
      
      if (response.success === true && response.data && typeof response.data === 'object') {
        console.log('✅ Detected format: { success: true, data: {...} }');
        statsData = response.data as CopyrightStats;
      } else if (response && typeof response === 'object' && 'totalDocuments' in response) {
        console.log('✅ Detected format: Direct stats object');
        statsData = response as unknown as CopyrightStats;
      } else {
        console.warn('Unexpected response format:', JSON.stringify(response, null, 2));
        throw new Error('Invalid response format. Expected { success: true, data: {...} } but got: ' + JSON.stringify(response));
      }
      
      console.log('✅ Parsed statistics data:', statsData);
      return statsData;
    } catch (err: any) {
      console.error('❌ Error in getStatistics:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const message = err.response?.data?.message || err.message || 'Failed to fetch statistics';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await copyrightService.getAnalytics();
      console.log('getAnalytics response:', response);
      
      if (response && response.success && response.data) {
        return response.data;
      } else if (response && typeof response === 'object' && 'categoryDistribution' in response) {
        return response as any;
      } else if (response && response.data) {
        return response.data;
      }
      
      throw new Error('Invalid analytics response format');
    } catch (err: any) {
      console.error('Error in getAnalytics:', err);
      const message = err.response?.data?.message || err.message || 'Failed to fetch analytics';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDocumentsByOwner = useCallback(async (ownerAddress: string, page = 1, limit = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await copyrightService.getDocumentsByOwner(ownerAddress, { page, limit });
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch documents';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllDocuments = useCallback(async (params?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await copyrightService.getAllDocuments(params);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch documents';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRecentDocuments = useCallback(async (limit = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await copyrightService.getRecentDocuments(limit);
      return response.data || [];
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch recent documents';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBlockchainStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await copyrightService.getBlockchainStatus();
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to get blockchain status';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isConnected,
    currentAddress,
    getRegistrationFee,
    registerDocument,
    registerTextDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    checkSimilarity,
    searchDocuments,
    getStatistics,
    getAnalytics,
    getDocumentsByOwner,
    getAllDocuments,
    getRecentDocuments,
    getBlockchainStatus,
    isLoading,
    error,
  };
}

export default useCopyright;

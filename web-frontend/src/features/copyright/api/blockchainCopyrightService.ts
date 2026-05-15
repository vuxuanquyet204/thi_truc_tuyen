import { ethers } from 'ethers';

const COPYRIGHT_REGISTRY_ABI = [
  "function registerDocument(bytes32 documentHash, ,string title, string description, string category, string fileExtension, uint256 fileSize, string ipfsHash, string[] tags) external payable",
  "function verifyDocument(bytes32 documentHash) external payable",
  "function updateDocument(bytes32 documentHash, string field, string value) external",
  "function updateDocumentTags(bytes32 documentHash, string[] newTags) external",
  "function deactivateDocument(bytes32 documentHash) external",
  "function documentExists(bytes32 documentHash) external view returns (bool)",
  "function getDocument(bytes32 documentHash) external view returns (tuple(bytes32 documentHash, address owner, string title, string description, string category, string fileExtension, uint256 fileSize, uint256 timestamp, bool isVerified, bool isActive, string ipfsHash, string[] tags))",
  "function getOwnerDocuments(address owner) external view returns (bytes32[])",
  "function getCategoryDocuments(string category) external view returns (bytes32[])",
  "function searchDocuments(bytes32 partialHash) external view returns (bytes32[])",
  "function getStatistics() external view returns (uint256, uint256, uint256, uint256)",
  "function registrationFee() external view returns (uint256)",
  "function verificationFee() external view returns (uint256)",
  "function owner() external view returns (address)",
  "event DocumentRegistered(bytes32 indexed documentHash, address indexed owner, string title, uint256 timestamp)",
  "event DocumentVerified(bytes32 indexed documentHash, address indexed verifier, uint256 timestamp)",
  "event DocumentUpdated(bytes32 indexed documentHash, address indexed owner, string field, uint256 timestamp)"
];

export interface DocumentMetadata {
  title: string;
  description: string;
  category: 'thesis' | 'research' | 'paper' | 'report' | 'presentation' | 'other';
  fileExtension: string;
  fileSize: number;
  tags: string[];
  ipfsHash?: string;
  authorName?: string;
  institution?: string;
  keywords?: string[];
  abstract?: string;
}

export interface DocumentCopyright {
  documentHash: string;
  owner: string;
  title: string;
  description: string;
  category: string;
  fileExtension: string;
  fileSize: number;
  timestamp: number;
  isVerified: boolean;
  isActive: boolean;
  ipfsHash: string;
  tags: string[];
  cloudinaryUrl?: string | null;
  mimeType?: string | null;
}

export interface CopyrightStats {
  totalDocuments: number;
  totalVerified: number;
  totalOwners: number;
  contractBalance: string;
}

export interface RegistrationResult {
  success: boolean;
  transactionHash?: string;
  documentHash?: string;
  error?: string;
}

export interface VerificationResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

class CopyrightService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum as any);
        this.signer = await this.provider.getSigner() as ethers.JsonRpcSigner;
        
        const contractAddress = import.meta.env.VITE_COPYRIGHT_REGISTRY_ADDRESS;
        if (contractAddress) {
          this.contract = new ethers.Contract(
            contractAddress,
            COPYRIGHT_REGISTRY_ABI,
            this.signer
          );
        }
      }
    } catch (error) {
      console.error('Failed to initialize copyright service:', error);
    }
  }

  async connectWallet(): Promise<boolean> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not detected');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await this.initializeProvider();
      
      return this.contract !== null;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  isWalletConnected(): boolean {
    return this.contract !== null && this.signer !== null;
  }

  async getCurrentAddress(): Promise<string | null> {
    if (!this.signer) return null;
    try {
      return await this.signer.getAddress();
    } catch (error) {
      console.error('Failed to get address:', error);
      return null;
    }
  }

  async calculateFileHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve('0x' + hashHex);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  calculateTextHash(content: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(content));
  }

  async registerDocument(
    file: File,
    metadata: DocumentMetadata
  ): Promise<RegistrationResult> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect wallet.');
      }

      const documentHash = await this.calculateFileHash(file);
      const registrationFee = await this.contract.registrationFee();
      
      const tx = await this.contract.registerDocument(
        documentHash,
        metadata.title,
        metadata.description,
        metadata.category,
        metadata.fileExtension,
        metadata.fileSize,
        metadata.ipfsHash || '',
        metadata.tags,
        { value: registrationFee }
      );

      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        documentHash: documentHash
      };
    } catch (error: any) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  }

  async registerTextDocument(
    content: string,
    metadata: DocumentMetadata
  ): Promise<RegistrationResult> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect wallet.');
      }

      const documentHash = this.calculateTextHash(content);
      const registrationFee = await this.contract.registrationFee();
      
      const tx = await this.contract.registerDocument(
        documentHash,
        metadata.title,
        metadata.description,
        metadata.category,
        metadata.fileExtension,
        metadata.fileSize,
        metadata.ipfsHash || '',
        metadata.tags,
        { value: registrationFee }
      );

      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        documentHash: documentHash
      };
    } catch (error: any) {
      console.error('Text registration failed:', error);
      return {
        success: false,
        error: error.message || 'Text registration failed'
      };
    }
  }

  async verifyDocument(documentHash: string): Promise<VerificationResult> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect wallet.');
      }

      const verificationFee = await this.contract.verificationFee();
      const tx = await this.contract.verifyDocument(documentHash, {
        value: verificationFee
      });

      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Verification failed:', error);
      return {
        success: false,
        error: error.message || 'Verification failed'
      };
    }
  }

  async documentExists(documentHash: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.documentExists(documentHash);
    } catch (error) {
      console.error('Failed to check document existence:', error);
      return false;
    }
  }

  async getDocument(documentHash: string): Promise<DocumentCopyright | null> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const doc = await this.contract.getDocument(documentHash);
      
      return {
        documentHash: doc.documentHash,
        owner: doc.owner,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        fileExtension: doc.fileExtension,
        fileSize: Number(doc.fileSize),
        timestamp: Number(doc.timestamp),
        isVerified: doc.isVerified,
        isActive: doc.isActive,
        ipfsHash: doc.ipfsHash,
        tags: doc.tags
      };
    } catch (error) {
      console.error('Failed to get document:', error);
      return null;
    }
  }

  async getUserDocuments(address: string): Promise<string[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getOwnerDocuments(address);
    } catch (error) {
      console.error('Failed to get user documents:', error);
      return [];
    }
  }

  async getCategoryDocuments(category: string): Promise<string[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.getCategoryDocuments(category);
    } catch (error) {
      console.error('Failed to get category documents:', error);
      return [];
    }
  }

  async searchDocuments(partialHash: string): Promise<string[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      return await this.contract.searchDocuments(partialHash);
    } catch (error) {
      console.error('Failed to search documents:', error);
      return [];
    }
  }

  async getStatistics(): Promise<CopyrightStats | null> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [totalDocs, totalVerified, totalOwners, balance] = await this.contract.getStatistics();
      
      return {
        totalDocuments: Number(totalDocs),
        totalVerified: Number(totalVerified),
        totalOwners: Number(totalOwners),
        contractBalance: ethers.formatEther(balance)
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      return null;
    }
  }

  async getRegistrationFee(): Promise<string> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const fee = await this.contract.registrationFee();
      return ethers.formatEther(fee);
    } catch (error) {
      console.error('Failed to get registration fee:', error);
      return '0';
    }
  }

  async getVerificationFee(): Promise<string> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const fee = await this.contract.verificationFee();
      return ethers.formatEther(fee);
    } catch (error) {
      console.error('Failed to get verification fee:', error);
      return '0';
    }
  }

  async updateDocument(
    documentHash: string,
    field: 'title' | 'description',
    value: string
  ): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.updateDocument(documentHash, field, value);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Failed to update document:', error);
      return false;
    }
  }

  async updateDocumentTags(
    documentHash: string,
    newTags: string[]
  ): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.updateDocumentTags(documentHash, newTags);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Failed to update document tags:', error);
      return false;
    }
  }

  async deactivateDocument(documentHash: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.deactivateDocument(documentHash);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Failed to deactivate document:', error);
      return false;
    }
  }

  onDocumentRegistered(callback: (hash: string, owner: string, title: string, timestamp: number) => void) {
    if (!this.contract) return;
    this.contract.on('DocumentRegistered', callback);
  }

  onDocumentVerified(callback: (hash: string, verifier: string, timestamp: number) => void) {
    if (!this.contract) return;
    this.contract.on('DocumentVerified', callback);
  }

  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

export const copyrightService = new CopyrightService();
export default copyrightService;

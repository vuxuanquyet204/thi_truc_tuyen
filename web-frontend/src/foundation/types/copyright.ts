// Copyright Page Types

export interface Document {
	id: string
	title: string
	author: string
	description: string
	category: DocumentMetadata['category']
	keywords: string[]
	references: string[]
	fileType: 'pdf' | 'docx' | 'txt' | 'md' | 'ppt' | 'xlsx'
	fileSize: number
	hash: string
	blockchainHash: string
	transactionHash?: string
	blockNumber?: number
	gasUsed?: number
	registrationDate: string
	lastModified: string
	status: 'registered' | 'pending' | 'verified' | 'disputed' | 'expired'
	ipfsHash?: string
	metadata: DocumentMetadata
	verificationHistory: VerificationRecord[]
	disputes: DisputeRecord[]
}

export interface DocumentMetadata {
	category: 'academic' | 'research' | 'textbook' | 'thesis' | 'article' | 'presentation'
	keywords: string[]
	language: string
	version: string
	license: 'copyright' | 'cc-by' | 'cc-by-sa' | 'cc-by-nc' | 'public-domain'
	originalSource?: string
	references?: string[]
	doi?: string
	isbn?: string
}

export interface VerificationRecord {
	id: string
	documentId: string
	verifier: string
	verificationType: 'hash_match' | 'blockchain_verified' | 'manual_review' | 'ai_check'
	status: 'verified' | 'failed' | 'pending'
	timestamp: string
	details: string
	confidence: number
	evidence: string[]
}

export interface DisputeRecord {
	id: string
	documentId: string
	claimant: string
	reason: 'plagiarism' | 'copyright_infringement' | 'false_claim' | 'duplicate' | 'other'
	description: string
	status: 'open' | 'investigating' | 'resolved' | 'dismissed'
	createdAt: string
	resolvedAt?: string
	evidence: string[]
	resolution?: string
	resolver?: string
}

export interface CopyrightStats {
	totalDocuments: number
	registeredToday: number
	pendingVerification: number
	verifiedDocuments: number
	disputedDocuments: number
	totalHashSize: number
	blockchainTransactions: number
	averageGasUsed: number
	successRate: number
}

export interface DocumentForm {
	title: string
	author: string
	description: string
	file: File | null
	category: DocumentMetadata['category']
	keywords: string[]
	language: string
	version: string
	license: DocumentMetadata['license']
	originalSource?: string
	references?: string[]
	doi?: string
	isbn?: string
	metadata?: Partial<DocumentMetadata>
}

export interface CopyrightFilters {
	search: string
	status: Document['status'] | 'all'
	category: DocumentMetadata['category'] | 'all'
	license: DocumentMetadata['license'] | 'all'
	dateRange: {
		start: string
		end: string
	}
	author: string
	showDisputed: boolean
	showVerified: boolean
}

export interface BlockchainInfo {
	network: 'mainnet' | 'testnet' | 'polygon' | 'bsc'
	contractAddress: string
	gasPrice: number
	gasLimit: number
	estimatedCost: number
	transactionFee: number
}

export interface RegistrationResult {
	success: boolean
	documentId: string
	transactionHash?: string
	blockNumber?: number
	gasUsed?: number
	error?: string
	ipfsHash?: string
}

export interface VerificationResult {
	success: boolean
	verified: boolean
	confidence: number
	details: string
	evidence: string[]
	error?: string
}

export interface DisputeForm {
	documentId: string
	reason: DisputeRecord['reason']
	description: string
	evidence: File[]
	claimant: string
	contactEmail: string
}

export interface CopyrightDashboard {
	stats: CopyrightStats
	recentDocuments: Document[]
	recentVerifications: VerificationRecord[]
	recentDisputes: DisputeRecord[]
	topAuthors: AuthorStats[]
	popularCategories: CategoryStats[]
	blockchainStatus: BlockchainStatus
}

export interface AuthorStats {
	author: string
	documentCount: number
	totalSize: number
	verifiedCount: number
	disputedCount: number
	lastActivity: string
}

export interface CategoryStats {
	category: DocumentMetadata['category']
	count: number
	percentage: number
	averageSize: number
	verifiedCount: number
}

export interface BlockchainStatus {
	isConnected: boolean
	lastBlock: number
	pendingTransactions: number
	averageGasPrice: number
	networkCongestion: 'low' | 'medium' | 'high'
	estimatedConfirmationTime: number
}

export interface CopyrightSettings {
	autoVerification: boolean
	verificationThreshold: number
	disputeResolutionDays: number
	gasPriceMultiplier: number
	backupToIpfs: boolean
	emailNotifications: boolean
	blockchainNetwork: BlockchainInfo['network']
}

export interface ExportOptions {
	format: 'excel' | 'csv' | 'json' | 'pdf'
	includeMetadata: boolean
	includeVerificationHistory: boolean
	includeDisputes: boolean
	dateRange?: {
		start: string
		end: string
	}
	filters?: Partial<CopyrightFilters>
}

export type DocumentCategory =
	| 'thesis'
	| 'research'
	| 'paper'
	| 'report'
	| 'presentation'
	| 'coursework'
	| 'assignment'
	| 'other'

export const COPYRIGHT_CONSTANTS = {
	MAX_FILE_SIZE: 100 * 1024 * 1024,
	ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf'],
	MAX_TITLE_LENGTH: 200,
	MAX_DESCRIPTION_LENGTH: 1000,
	MAX_TAGS_COUNT: 10,
	MAX_TAG_LENGTH: 50,
	SUPPORTED_CATEGORIES: [
		'thesis',
		'research',
		'paper',
		'report',
		'presentation',
		'coursework',
		'assignment',
		'other',
	] as DocumentCategory[],
} as const

export type CopyrightFileType = typeof COPYRIGHT_CONSTANTS.ALLOWED_EXTENSIONS[number]

export type CopyrightCategoryLabel = Record<DocumentCategory, string>

export const COPYRIGHT_CATEGORY_LABELS: CopyrightCategoryLabel = {
	thesis: 'Luận văn/Luận án',
	research: 'Nghiên cứu khoa học',
	paper: 'Bài báo khoa học',
	report: 'Báo cáo',
	presentation: 'Bài thuyết trình',
	coursework: 'Bài tập lớn',
	assignment: 'Bài tập',
	other: 'Khác',
} as const

export interface DocumentCopyright {
	id: string
	documentHash: string
	owner: string
	title: string
	description: string
	category: string
	fileExtension: string
	fileSize: number
	timestamp: number
	isVerified: boolean
	isActive: boolean
	ipfsHash: string
	tags: string[]
	cloudinaryUrl?: string | null
	mimeType?: string | null
}

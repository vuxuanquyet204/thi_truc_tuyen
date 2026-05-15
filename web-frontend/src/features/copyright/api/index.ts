// Copyright API barrel
export * from './copyrightApi';
export { default as copyrightService } from './copyrightService';
export { default as blockchainCopyrightService } from './blockchainCopyrightService';
export * from './adminCopyrightApi';

// Re-export types from blockchainCopyrightService for useCopyright.ts compatibility
export type {
  DocumentMetadata,
  DocumentCopyright,
  CopyrightStats,
} from './blockchainCopyrightService';

// Default export for copyrightApi (for backward compatibility)
export { default } from './copyrightApi';

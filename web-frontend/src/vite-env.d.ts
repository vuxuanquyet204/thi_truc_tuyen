/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_COURSE_API_URL?: string
  readonly VITE_TOKEN_REWARD_API_URL?: string
  readonly VITE_LEARN_TOKEN_ADDRESS?: string
  readonly VITE_COPYRIGHT_REGISTRY_ADDRESS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// MetaMask ethereum provider type
interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    isMetaMask?: boolean;
    on?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    selectedAddress?: string;
    chainId?: string;
  };
}


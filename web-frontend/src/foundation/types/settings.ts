// Settings Types
export interface UserSettings {
  account: AccountSettings;
  password: PasswordSettings;
  emails: EmailSettings;
  language: LanguageSettings;
  personalization: PersonalizationSettings;
  teams: TeamSettings;
  subscriptions: SubscriptionSettings;
  shipping: ShippingSettings;
}

export interface AccountSettings {
  username: string;
  usernameChangesLeft: number;
  emailAddresses: EmailAddress[];
  connectedAccounts: ConnectedAccount[];
  mergeAccounts: MergeAccountSettings;
  exportData: ExportDataSettings;
  deleteAccount: DeleteAccountSettings;
}

export interface EmailAddress {
  id: string;
  email: string;
  isVerified: boolean;
  isPrimary: boolean;
  addedDate: string;
}

export interface ConnectedAccount {
  id: string;
  platform: 'facebook' | 'github' | 'linkedin' | 'google' | 'twitter';
  platformName: string;
  platformIcon: string;
  isConnected: boolean;
  connectedDate?: string;
  profileUrl?: string;
}

export interface MergeAccountSettings {
  targetUsername: string;
  targetEmail: string;
}

export interface ExportDataSettings {
  lastExportDate?: string;
  canExport: boolean;
  exportStatus: 'none' | 'pending' | 'completed' | 'failed';
}

export interface DeleteAccountSettings {
  canDelete: boolean;
  deletionReason?: string;
  deletionDate?: string;
  isPending: boolean;
}

export interface PasswordSettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordStrength: PasswordStrength;
  lastChanged: string;
  twoFactorEnabled: boolean;
  recoveryCodes: RecoveryCode[];
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

export interface RecoveryCode {
  id: string;
  code: string;
  isUsed: boolean;
  createdAt: string;
}

export interface EmailSettings {
  notifications: EmailNotificationSettings;
  marketing: MarketingSettings;
  security: SecurityEmailSettings;
}

export interface EmailNotificationSettings {
  contestUpdates: boolean;
  challengeReminders: boolean;
  leaderboardChanges: boolean;
  newBadges: boolean;
  weeklyDigest: boolean;
  friendActivity: boolean;
  systemUpdates: boolean;
}

export interface MarketingSettings {
  productUpdates: boolean;
  newsletter: boolean;
  promotions: boolean;
  surveyInvites: boolean;
}

export interface SecurityEmailSettings {
  loginAlerts: boolean;
  passwordChanges: boolean;
  securityAlerts: boolean;
  accountChanges: boolean;
}

export interface LanguageSettings {
  interfaceLanguage: 'en' | 'vi' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko';
  programmingLanguage: 'java' | 'python' | 'javascript' | 'cpp' | 'csharp' | 'go' | 'ruby';
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
}

export interface PersonalizationSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  codeEditorTheme: 'default' | 'dark' | 'monokai' | 'solarized';
  showHints: boolean;
  autoSave: boolean;
  soundEffects: boolean;
  animations: boolean;
  profileVisibility: 'public' | 'private' | 'friends-only';
}

export interface TeamSettings {
  teams: Team[];
  invitations: TeamInvitation[];
  permissions: TeamPermissions;
}

export interface Team {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  memberCount: number;
  createdAt: string;
  isActive: boolean;
}

export interface TeamInvitation {
  id: string;
  teamName: string;
  invitedBy: string;
  invitedDate: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface TeamPermissions {
  canCreateTeams: boolean;
  canInviteMembers: boolean;
  canManageContests: boolean;
  canViewAnalytics: boolean;
}

export interface SubscriptionSettings {
  currentPlan: SubscriptionPlan;
  billingHistory: BillingRecord[];
  paymentMethods: PaymentMethod[];
  autoRenew: boolean;
  nextBillingDate?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: 'free' | 'basic' | 'pro' | 'enterprise';
  displayName: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  startedAt: string;
  expiresAt?: string;
}

export interface BillingRecord {
  id: string;
  amount: number;
  currency: string;
  date: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  planName: string;
  invoiceUrl?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface ShippingSettings {
  addresses: ShippingAddress[];
  defaultAddressId?: string;
  preferences: ShippingPreferences;
}

export interface ShippingAddress {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface ShippingPreferences {
  deliveryInstructions?: string;
  signatureRequired: boolean;
  giftWrapping: boolean;
  notificationPreferences: {
    shipmentUpdates: boolean;
    deliveryConfirmation: boolean;
  };
}

// Navigation Types
export interface SettingsNavItem {
  id: string;
  label: string;
  icon: string;
  category: 'account' | 'preferences';
  isActive: boolean;
  isDisabled?: boolean;
}

export interface SettingsSection {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  isDangerous?: boolean;
  requiresConfirmation?: boolean;
}

// Form Types
export interface TextInputProps {
  label?: string;
  description?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'url';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  maxLength?: number;
  autoComplete?: string;
}

export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

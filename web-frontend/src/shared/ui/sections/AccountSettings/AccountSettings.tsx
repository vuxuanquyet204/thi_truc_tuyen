import React, { useState } from 'react';
import SettingsSection from '@/shared/ui/molecules/SettingsSection/SettingsSection';
import TextInput from '@/shared/ui/atoms/TextInput/TextInput';
import { AccountSettings as AccountSettingsType, SettingsSection as SettingsSectionType } from '@/types/settings';
import { 
  User, 
  Mail, 
  Plus, 
  Facebook, 
  Github, 
  Linkedin, 
  Download, 
  Trash2,
  Check,
  X
} from 'lucide-react';

interface AccountSettingsProps {
  settings: AccountSettingsType;
  onUpdateSettings: (updatedSettings: Partial<AccountSettingsType>) => void;
}

export default function AccountSettings({ settings, onUpdateSettings }: AccountSettingsProps): JSX.Element {
  const [username, setUsername] = useState(settings.username);
  const [mergeUsername, setMergeUsername] = useState(settings.mergeAccounts.targetUsername);
  const [mergeEmail, setMergeEmail] = useState(settings.mergeAccounts.targetEmail);
  const [newEmail, setNewEmail] = useState('');
  const [showAddEmail, setShowAddEmail] = useState(false);

  const handleUsernameChange = () => {
    if (username !== settings.username && settings.usernameChangesLeft > 0) {
      onUpdateSettings({
        ...settings,
        username,
        usernameChangesLeft: settings.usernameChangesLeft - 1
      });
    }
  };

  const handleMergeAccounts = () => {
    if (mergeUsername && mergeEmail) {
      // TODO: Implement merge accounts logic
      console.log('Merging accounts:', { mergeUsername, mergeEmail });
    }
  };

  const handleConnectAccount = (platform: string) => {
    // TODO: Implement connect account logic
    console.log('Connecting to:', platform);
  };

  const handleExportData = async () => {
    console.log('Exporting data...');

    // Update status to pending
    onUpdateSettings({
      ...settings,
      exportData: {
        ...settings.exportData,
        exportStatus: 'pending'
      }
    });

    // Simulate export process (2 seconds)
    setTimeout(() => {
      // Create mock export data
      const exportData = {
        profile: settings,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hackerrank-data-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Reset status
      onUpdateSettings({
        ...settings,
        exportData: {
          ...settings.exportData,
          exportStatus: 'completed',
          lastExportDate: new Date().toISOString()
        }
      });

      alert('Dữ liệu đã được export thành công!');
    }, 2000);
  };

  const handleDeleteAccount = () => {
    const confirmMessage = `XÓA TÀI KHOẢN

Bạn có chắc chắn muốn xóa tài khoản "${settings.username}"?

Thao tác này sẽ xóa vĩnh viễn:
- Profile và thông tin cá nhân
- Tất cả badges và achievements
- Vị trí trên leaderboard
- Lịch sử bài thi và điểm số
- Token và ví blockchain

DỮ LIỆU KHÔNG THỂ KHÔI PHỤC!

Nhập "DELETE" để xác nhận:`;

    const userInput = prompt(confirmMessage);

    if (userInput === 'DELETE') {
      console.log('Deleting account...');
      alert('🗑️ Tài khoản sẽ được xóa trong 30 ngày. Bạn có thể hủy bỏ bằng cách đăng nhập lại trong thời gian này.');
      // In real app: API call to mark account for deletion
    } else if (userInput !== null) {
      alert('❌ Xác nhận không đúng. Tài khoản của bạn an toàn.');
    }
  };

  const handleAddEmail = () => {
    if (newEmail) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        alert('Email không hợp lệ!');
        return;
      }

      // Check if email already exists
      const emailExists = settings.emailAddresses.some(e => e.email === newEmail);
      if (emailExists) {
        alert('Email này đã được thêm!');
        return;
      }

      // Add new email
      const newEmailObj = {
        id: `email-${Date.now()}`,
        email: newEmail,
        isPrimary: settings.emailAddresses.length === 0,
        isVerified: false,
        addedDate: new Date().toISOString()
      };

      onUpdateSettings({
        ...settings,
        emailAddresses: [...settings.emailAddresses, newEmailObj]
      });

      alert(`✅ Email ${newEmail} đã được thêm! Vui lòng kiểm tra hộp thư để xác thực.`);
      setNewEmail('');
      setShowAddEmail(false);
    }
  };

  // Your Username Section
  const usernameSection: SettingsSectionType = {
    id: 'username',
    title: 'Your Username',
    description: `(This is how users will see you on HackerRank. You have ${settings.usernameChangesLeft} changes left.)`,
    content: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <TextInput
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="Enter your username"
          maxLength={30}
          required
        />
        <button
          onClick={handleUsernameChange}
          disabled={username === settings.username || settings.usernameChangesLeft === 0}
          style={{
            alignSelf: 'flex-start',
            padding: '8px 16px',
            background: username !== settings.username && settings.usernameChangesLeft > 0 
              ? 'var(--primary)' 
              : 'var(--muted)',
            color: username !== settings.username && settings.usernameChangesLeft > 0 
              ? 'var(--primary-foreground)' 
              : 'var(--muted-foreground)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: username !== settings.username && settings.usernameChangesLeft > 0 
              ? 'pointer' 
              : 'not-allowed',
            transition: 'all var(--transition-normal)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <User style={{ width: '14px', height: '14px' }} />
          Update Username
        </button>
      </div>
    )
  };

  // Email Addresses Section
  const emailSection: SettingsSectionType = {
    id: 'emails',
    title: 'Email Addresses',
    description: 'We will never share your email address or display it publicly.',
    content: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {settings.emailAddresses.map((email) => (
          <div key={email.id} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'var(--muted)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Mail style={{
                width: '16px',
                height: '16px',
                color: 'var(--accent)'
              }} />
              <span style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--foreground)'
              }}>
                {email.email}
              </span>
            </div>
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              {email.isVerified && (
                <span style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500
                }}>
                  verified
                </span>
              )}
              {email.isPrimary && (
                <span style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  background: 'var(--muted-foreground)',
                  color: 'var(--muted)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500
                }}>
                  primary
                </span>
              )}
            </div>
          </div>
        ))}
        
        {showAddEmail && (
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: 1 }}>
              <TextInput
                label="New Email Address"
                type="email"
                value={newEmail}
                onChange={setNewEmail}
                placeholder="Enter new email address"
              />
            </div>
            <button
              onClick={handleAddEmail}
              style={{
                padding: '8px',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Check style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              onClick={() => setShowAddEmail(false)}
              style={{
                padding: '8px',
                background: 'var(--muted)',
                color: 'var(--muted-foreground)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        )}
        
        <button
          onClick={() => setShowAddEmail(true)}
          style={{
            alignSelf: 'flex-start',
            padding: '8px 16px',
            background: 'transparent',
            color: 'var(--primary)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition-normal)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--primary)';
            e.currentTarget.style.color = 'var(--primary-foreground)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--primary)';
          }}
        >
          <Plus style={{ width: '14px', height: '14px' }} />
          Add another email
        </button>
      </div>
    )
  };

  // Connected Accounts Section
  const connectedAccountsSection: SettingsSectionType = {
    id: 'connected-accounts',
    title: 'Connected Accounts',
    description: 'Connect your other accounts with HackerRank to share your progress and scores and find your friends',
    content: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {settings.connectedAccounts.map((account) => (
          <button
            key={account.id}
            onClick={() => handleConnectAccount(account.platform)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: account.isConnected ? 'var(--muted)' : 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--foreground)',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--muted)';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = account.isConnected ? 'var(--muted)' : 'var(--background)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <span style={{ fontSize: '16px' }}>{account.platformIcon}</span>
            <span>Connect to {account.platformName}</span>
            {account.isConnected && (
              <Check style={{
                width: '16px',
                height: '16px',
                color: 'var(--primary)',
                marginLeft: 'auto'
              }} />
            )}
          </button>
        ))}
      </div>
    )
  };

  // Merge Accounts Section
  const mergeAccountsSection: SettingsSectionType = {
    id: 'merge-accounts',
    title: 'Merge Accounts',
    description: 'Accidentally created two accounts? This combines another account into the one you are currently logged in as.',
    content: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <p style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--foreground)',
          margin: 0
        }}>
          Details of the account to merge with {settings.username}
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <TextInput
            label="Username"
            value={mergeUsername}
            onChange={setMergeUsername}
            placeholder="Username"
          />
          <TextInput
            label="Email"
            type="email"
            value={mergeEmail}
            onChange={setMergeEmail}
            placeholder="Email"
          />
        </div>
        <button
          onClick={handleMergeAccounts}
          disabled={!mergeUsername || !mergeEmail}
          style={{
            alignSelf: 'flex-start',
            padding: '8px 16px',
            background: mergeUsername && mergeEmail ? 'var(--primary)' : 'var(--muted)',
            color: mergeUsername && mergeEmail ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: mergeUsername && mergeEmail ? 'pointer' : 'not-allowed',
            transition: 'all var(--transition-normal)'
          }}
        >
          Submit
        </button>
      </div>
    )
  };

  // Export Data Section
  const exportDataSection: SettingsSectionType = {
    id: 'export-data',
    title: 'Export Data',
    description: 'Create and download an archive of your HackerRank Data.',
    content: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <button
          onClick={handleExportData}
          disabled={settings.exportData.exportStatus === 'pending'}
          style={{
            alignSelf: 'flex-start',
            padding: '8px 16px',
            background: settings.exportData.exportStatus === 'pending' 
              ? 'var(--muted)' 
              : 'transparent',
            color: settings.exportData.exportStatus === 'pending' 
              ? 'var(--muted-foreground)' 
              : 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: settings.exportData.exportStatus === 'pending' 
              ? 'not-allowed' 
              : 'pointer',
            transition: 'all var(--transition-normal)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            if (settings.exportData.exportStatus !== 'pending') {
              e.currentTarget.style.background = 'var(--muted)';
            }
          }}
          onMouseLeave={(e) => {
            if (settings.exportData.exportStatus !== 'pending') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <Download style={{ width: '14px', height: '14px' }} />
          {settings.exportData.exportStatus === 'pending' ? 'Creating archive...' : 'Create new archive'}
        </button>
      </div>
    )
  };

  // Delete Account Section
  const deleteAccountSection: SettingsSectionType = {
    id: 'delete-account',
    title: 'Delete Account',
    description: 'Delete your account and all information related to your account such as your profile page, badges earned and leaderboard positions. Please be aware that all data will be permanently lost if you delete your account.',
    content: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <button
          onClick={handleDeleteAccount}
          style={{
            alignSelf: 'flex-start',
            padding: '8px 16px',
            background: 'transparent',
            color: 'var(--destructive)',
            border: '1px solid var(--destructive)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition-normal)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--destructive)';
            e.currentTarget.style.color = 'var(--destructive-foreground)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--destructive)';
          }}
        >
          <Trash2 style={{ width: '14px', height: '14px' }} />
          Delete Account
        </button>
      </div>
    ),
    isDangerous: true,
    requiresConfirmation: true
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <SettingsSection section={usernameSection} />
      <SettingsSection section={emailSection} />
      <SettingsSection section={connectedAccountsSection} />
      <SettingsSection section={mergeAccountsSection} />
      <SettingsSection section={exportDataSection} />
      <SettingsSection section={deleteAccountSection} />
    </div>
  );
}

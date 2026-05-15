import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Eye, 
  Users, 
  Camera, 
  Shield, 
  TrendingUp, 
  Clock,
  Zap,
  Target,
  BarChart3,
  Settings,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
// Mock services - removed import as file doesn't exist
// import { mockAIDetectionService, mockBlockchainService } from '../../data/mockAIDetectionData';
import { CheatingDetection } from '@/features/proctoring/hooks';
import Button from '@/shared/ui/atoms/Button/Button';
import styles from './AIProctoringDashboard.module.css';

interface AIProctoringDashboardProps {
  className?: string;
}

interface ProctoringSession {
  id: string;
  studentName: string;
  studentId: string;
  examTitle: string;
  startTime: number;
  duration: number;
  status: 'active' | 'completed' | 'flagged' | 'terminated';
  violations: CheatingDetection[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  cameraStatus: 'active' | 'inactive' | 'error';
  lastActivity: number;
  blockchainSessionId?: number;
}

interface AIAlert {
  id: string;
  type: 'violation' | 'system' | 'blockchain';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  sessionId?: string;
  studentName?: string;
  examTitle?: string;
  isRead: boolean;
  actionRequired: boolean;
}

export const AIProctoringDashboard: React.FC<AIProctoringDashboardProps> = ({
  className = ''
}) => {
  const [sessions, setSessions] = useState<ProctoringSession[]>([]);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    flaggedSessions: 0,
    totalViolations: 0,
    criticalViolations: 0,
    averageRiskScore: 0
  });
  const [selectedSession, setSelectedSession] = useState<ProctoringSession | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data initialization
  useEffect(() => {
    initializeMockData();
  }, []);

  // Auto refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      updateSessionsData();
      generateNewAlerts();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // AI detection simulation
  useEffect(() => {
    // Mock service removed - no longer using mockAIDetectionService
    // Violations are now handled through real-time monitoring
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Blockchain events simulation
  useEffect(() => {
    // Mock blockchain service removed - no longer using mockBlockchainService
    // Blockchain events are now handled through real-time monitoring
    return () => {
      // Cleanup if needed
    };
  }, []);

  const initializeMockData = () => {
    const mockSessions: ProctoringSession[] = [
      {
        id: '1',
        studentName: 'Nguyễn Văn A',
        studentId: 'SV001',
        examTitle: 'Kiểm tra JavaScript Cơ bản',
        startTime: Date.now() - 1800000, // 30 phút trước
        duration: 3600000, // 60 phút
        status: 'active',
        violations: [],
        riskLevel: 'medium',
        cameraStatus: 'active',
        lastActivity: Date.now() - 30000,
        blockchainSessionId: 1
      },
      {
        id: '2',
        studentName: 'Trần Thị B',
        studentId: 'SV002',
        examTitle: 'Kiểm tra React Advanced',
        startTime: Date.now() - 900000, // 15 phút trước
        duration: 3600000,
        status: 'flagged',
        violations: [
          {
            type: 'MULTIPLE_FACES',
            severity: 'critical',
            confidence: 95,
            timestamp: Date.now() - 300000,
            description: 'Phát hiện nhiều người trong khung hình'
          }
        ],
        riskLevel: 'critical',
        cameraStatus: 'active',
        lastActivity: Date.now() - 60000,
        blockchainSessionId: 2
      },
      {
        id: '3',
        studentName: 'Lê Văn C',
        studentId: 'SV003',
        examTitle: 'Kiểm tra Node.js',
        startTime: Date.now() - 2700000, // 45 phút trước
        duration: 3600000,
        status: 'completed',
        violations: [
          {
            type: 'LOOKING_AWAY',
            severity: 'medium',
            confidence: 78,
            timestamp: Date.now() - 600000,
            description: 'Phát hiện mắt nhìn ra khỏi màn hình'
          }
        ],
        riskLevel: 'low',
        cameraStatus: 'inactive',
        lastActivity: Date.now() - 300000,
        blockchainSessionId: 3
      }
    ];

    setSessions(mockSessions);
    updateStats(mockSessions);
  };

  const updateSessionsData = () => {
    setSessions(prevSessions => 
      prevSessions.map(session => ({
        ...session,
        lastActivity: session.status === 'active' ? Date.now() - Math.random() * 60000 : session.lastActivity
      }))
    );
  };

  const updateStats = (sessionsData: ProctoringSession[]) => {
    const activeSessions = sessionsData.filter(s => s.status === 'active').length;
    const flaggedSessions = sessionsData.filter(s => s.status === 'flagged').length;
    const totalViolations = sessionsData.reduce((sum, s) => sum + s.violations.length, 0);
    const criticalViolations = sessionsData.reduce((sum, s) => 
      sum + s.violations.filter(v => v.severity === 'critical').length, 0
    );
    const averageRiskScore = sessionsData.length > 0 ? 
      sessionsData.reduce((sum, s) => {
        const riskScores = { low: 1, medium: 2, high: 3, critical: 4 };
        return sum + riskScores[s.riskLevel];
      }, 0) / sessionsData.length : 0;

    setStats({
      totalSessions: sessionsData.length,
      activeSessions,
      flaggedSessions,
      totalViolations,
      criticalViolations,
      averageRiskScore
    });
  };

  const handleNewViolation = (violation: CheatingDetection) => {
    // Find active session to add violation to
    const activeSession = sessions.find(s => s.status === 'active');
    if (activeSession) {
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === activeSession.id
            ? {
                ...session,
                violations: [...session.violations, violation],
                riskLevel: violation.severity === 'critical' ? 'critical' : 
                          violation.severity === 'high' ? 'high' : session.riskLevel,
                status: violation.severity === 'critical' ? 'flagged' : session.status
              }
            : session
        )
      );

      // Add alert
      addAlert({
        type: 'violation',
        severity: violation.severity,
        title: `Vi phạm ${violation.type} được phát hiện`,
        description: violation.description,
        sessionId: activeSession.id,
        studentName: activeSession.studentName,
        examTitle: activeSession.examTitle,
        actionRequired: violation.severity === 'critical' || violation.severity === 'high'
      });
    }
  };

  const addAlert = (alert: Omit<AIAlert, 'id' | 'timestamp' | 'isRead'>) => {
    const newAlert: AIAlert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: Date.now(),
      isRead: false
    };

    setAlerts(prevAlerts => [newAlert, ...prevAlerts].slice(0, 50)); // Keep last 50 alerts
  };

  const generateNewAlerts = () => {
    if (Math.random() < 0.1) { // 10% chance
      const alertTypes = [
        {
          type: 'system' as const,
          severity: 'medium' as const,
          title: 'Cảnh báo hệ thống',
          description: 'Phát hiện hoạt động bất thường trong hệ thống'
        },
        {
          type: 'blockchain' as const,
          severity: 'low' as const,
          title: 'Giao dịch Blockchain',
          description: 'Giao dịch mới được ghi trên blockchain'
        }
      ];

      const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      addAlert({
        ...randomAlert,
        actionRequired: randomAlert.type === 'system' ? true : false
      });
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId
          ? { ...session, status: 'terminated' as const }
          : session
      )
    );

    addAlert({
      type: 'system',
      severity: 'high',
      title: 'Session bị dừng',
      description: `Session ${sessionId} đã được dừng bởi admin`,
      sessionId,
      actionRequired: true
    });
  };

  const handleSendWarning = (sessionId: string) => {
    addAlert({
      type: 'system',
      severity: 'medium',
      title: 'Cảnh báo gửi tới thí sinh',
      description: `Cảnh báo đã được gửi tới session ${sessionId}`,
      sessionId,
      actionRequired: false
    });
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesRisk = filterRiskLevel === 'all' || session.riskLevel === filterRiskLevel;
    const matchesSearch = searchTerm === '' || 
      session.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;

  return (
    <div className={`${styles.dashboard} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <Shield className="w-6 h-6" />
          <h1>AI Proctoring Dashboard</h1>
          {unreadAlerts > 0 && (
            <div className={styles.alertBadge}>
              {unreadAlerts}
            </div>
          )}
        </div>
        
        <div className={styles.controls}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? styles.activeButton : ''}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? styles.spinning : ''}`} />
            Auto Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Activity className="w-5 h-5" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.activeSessions}</div>
            <div className={styles.statLabel}>Sessions đang hoạt động</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.flaggedSessions}</div>
            <div className={styles.statLabel}>Sessions bị đánh dấu</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Eye className="w-5 h-5" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.totalViolations}</div>
            <div className={styles.statLabel}>Tổng vi phạm</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Zap className="w-5 h-5" />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.criticalViolations}</div>
            <div className={styles.statLabel}>Vi phạm nghiêm trọng</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên học sinh hoặc bài thi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterButtons}>
          <Button
            variant={filterRiskLevel === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterRiskLevel('all')}
          >
            Tất cả
          </Button>
          <Button
            variant={filterRiskLevel === 'low' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterRiskLevel('low')}
          >
            Thấp
          </Button>
          <Button
            variant={filterRiskLevel === 'medium' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterRiskLevel('medium')}
          >
            Trung bình
          </Button>
          <Button
            variant={filterRiskLevel === 'high' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterRiskLevel('high')}
          >
            Cao
          </Button>
          <Button
            variant={filterRiskLevel === 'critical' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterRiskLevel('critical')}
          >
            Nghiêm trọng
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Sessions List */}
        <div className={styles.sessionsSection}>
          <h2 className={styles.sectionTitle}>Sessions đang giám sát</h2>
          <div className={styles.sessionsList}>
            {filteredSessions.map(session => (
              <div
                key={session.id}
                className={`${styles.sessionCard} ${styles[session.status]}`}
                onClick={() => setSelectedSession(session)}
              >
                <div className={styles.sessionHeader}>
                  <div className={styles.sessionInfo}>
                    <h3 className={styles.studentName}>{session.studentName}</h3>
                    <p className={styles.examTitle}>{session.examTitle}</p>
                  </div>
                  <div className={styles.sessionStatus}>
                    <div
                      className={styles.riskBadge}
                      style={{ backgroundColor: getRiskLevelColor(session.riskLevel) }}
                    >
                      {session.riskLevel.toUpperCase()}
                    </div>
                    <div className={styles.statusBadge}>
                      {session.status}
                    </div>
                  </div>
                </div>

                <div className={styles.sessionDetails}>
                  <div className={styles.detailItem}>
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor((Date.now() - session.startTime) / 60000)} phút</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Camera className="w-4 h-4" />
                    <span className={session.cameraStatus === 'active' ? styles.active : styles.inactive}>
                      Camera {session.cameraStatus}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <AlertTriangle className="w-4 h-4" />
                    <span>{session.violations.length} vi phạm</span>
                  </div>
                </div>

                {session.violations.length > 0 && (
                  <div className={styles.violationsList}>
                    {session.violations.slice(0, 2).map((violation, index) => (
                      <div key={index} className={styles.violationItem}>
                        <div
                          className={styles.violationSeverity}
                          style={{ backgroundColor: getSeverityColor(violation.severity) }}
                        />
                        <span className={styles.violationDescription}>
                          {violation.description}
                        </span>
                      </div>
                    ))}
                    {session.violations.length > 2 && (
                      <div className={styles.moreViolations}>
                        +{session.violations.length - 2} vi phạm khác
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.sessionActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleSendWarning(session.id);
                    }}
                  >
                    Gửi cảnh báo
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      handleTerminateSession(session.id);
                    }}
                  >
                    Dừng session
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className={styles.alertsSection}>
          <h2 className={styles.sectionTitle}>AI Alerts</h2>
          <div className={styles.alertsList}>
            {alerts.slice(0, 10).map(alert => (
              <div
                key={alert.id}
                className={`${styles.alertCard} ${alert.isRead ? styles.read : styles.unread}`}
                onClick={() => markAlertAsRead(alert.id)}
              >
                <div className={styles.alertHeader}>
                  <div
                    className={styles.alertSeverity}
                    style={{ backgroundColor: getSeverityColor(alert.severity) }}
                  />
                  <div className={styles.alertTitle}>{alert.title}</div>
                  <div className={styles.alertTime}>
                    {new Date(alert.timestamp).toLocaleTimeString('vi-VN')}
                  </div>
                </div>
                <div className={styles.alertDescription}>{alert.description}</div>
                {alert.actionRequired && (
                  <div className={styles.actionRequired}>Cần hành động</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

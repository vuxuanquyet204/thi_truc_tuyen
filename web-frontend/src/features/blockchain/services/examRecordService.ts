import { ethers } from 'ethers';

// ExamRecordContract ABI
const EXAM_RECORD_ABI = [
  // Functions
  "function startExamSession(uint256 examId, address student, string memory examTitle) external returns (uint256)",
  "function recordCheatingViolation(uint256 sessionId, uint8 violationType, uint8 severity, uint256 confidence, string memory description, string memory screenshotHash) external",
  "function completeExamSession(uint256 sessionId, uint256 score, uint256 maxScore, uint256 timeSpent, string memory examTitle) external",
  "function verifyExamResult(uint256 examId) external view returns (bool)",
  "function getExamSession(uint256 sessionId) external view returns (uint256 examId, address student, uint256 startTime, uint256 endTime, bool isCompleted, uint256 totalViolations, uint256 criticalViolations, bool isFlagged)",
  "function getSessionViolations(uint256 sessionId) external view returns (tuple(uint256 examId, address student, uint8 violationType, uint8 severity, uint256 confidence, uint256 timestamp, string description, string screenshotHash)[])",
  "function getStudentExamResults(address student) external view returns (uint256[])",
  "function getStatistics() external view returns (uint256 _totalExams, uint256 _totalViolations, uint256 _totalSessions, uint256 flaggedSessions)",
  
  // Events
  "event ExamResultRecorded(uint256 indexed examId, address indexed student, uint256 score, uint256 maxScore, bool isPassed, bytes32 resultHash)",
  "event CheatingViolationDetected(uint256 indexed examId, address indexed student, uint8 violationType, uint8 severity, uint256 confidence, string description)",
  "event ExamSessionStarted(uint256 indexed sessionId, uint256 indexed examId, address indexed student, uint256 startTime)",
  "event ExamSessionCompleted(uint256 indexed sessionId, uint256 indexed examId, address indexed student, bool isFlagged, uint256 totalViolations)"
];

// Contract address (update after deployment)
const EXAM_RECORD_ADDRESS = import.meta.env.VITE_EXAM_RECORD_ADDRESS || '0x0000000000000000000000000000000000000000';

export interface ExamSession {
  sessionId: number;
  examId: number;
  student: string;
  startTime: number;
  endTime: number;
  isCompleted: boolean;
  totalViolations: number;
  criticalViolations: number;
  isFlagged: boolean;
}

export interface CheatingViolation {
  examId: number;
  student: string;
  violationType: number; // 1: face_detection, 2: eye_tracking, 3: multiple_faces, etc.
  severity: number; // 1: low, 2: medium, 3: high, 4: critical
  confidence: number; // 0-100
  timestamp: number;
  description: string;
  screenshotHash: string;
}

export interface ExamResult {
  examId: number;
  student: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  timestamp: number;
  isPassed: boolean;
  examTitle: string;
  resultHash: string;
}

export interface ExamStatistics {
  totalExams: number;
  totalViolations: number;
  totalSessions: number;
  flaggedSessions: number;
}

/**
 * Get ExamRecord contract instance
 */
export async function getExamRecordContract(): Promise<ethers.Contract> {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Provider not available');
  }

  const signer = await provider.getSigner();
  return new ethers.Contract(EXAM_RECORD_ADDRESS, EXAM_RECORD_ABI, signer);
}

/**
 * Get ExamRecord contract instance (read-only)
 */
export function getExamRecordContractReadOnly(): ethers.Contract {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Provider not available');
  }

  return new ethers.Contract(EXAM_RECORD_ADDRESS, EXAM_RECORD_ABI, provider);
}

/**
 * Get ethers provider
 */
function getProvider(): ethers.BrowserProvider | null {
  if (typeof (window as any).ethereum === 'undefined') return null;
  return new ethers.BrowserProvider((window as any).ethereum);
}

/**
 * Start exam session on blockchain
 */
export async function startExamSessionOnChain(
  examId: number,
  studentAddress: string,
  examTitle: string
): Promise<number> {
  try {
    const contract = await getExamRecordContract();
    
    const tx = await contract.startExamSession(examId, studentAddress, examTitle);
    await tx.wait();
    
    // Get session ID from event
    const receipt = await tx.wait();
    const event = receipt.logs.find((log: ethers.Log) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'ExamSessionStarted';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      return Number(parsed?.args.sessionId);
    }
    
    throw new Error('Could not get session ID from transaction');
  } catch (error: any) {
    console.error('Error starting exam session on chain:', error);
    throw new Error('Không thể bắt đầu session thi trên blockchain');
  }
}

/**
 * Record cheating violation on blockchain
 */
export async function recordCheatingViolationOnChain(
  sessionId: number,
  violationType: number,
  severity: number,
  confidence: number,
  description: string,
  screenshotHash: string = ''
): Promise<string> {
  try {
    const contract = await getExamRecordContract();
    
    const tx = await contract.recordCheatingViolation(
      sessionId,
      violationType,
      severity,
      confidence,
      description,
      screenshotHash
    );
    
    await tx.wait();
    return tx.hash;
  } catch (error: any) {
    console.error('Error recording cheating violation:', error);
    throw new Error('Không thể ghi lại vi phạm gian lận');
  }
}

/**
 * Complete exam session and record result on blockchain
 */
export async function completeExamSessionOnChain(
  sessionId: number,
  score: number,
  maxScore: number,
  timeSpent: number,
  examTitle: string
): Promise<string> {
  try {
    const contract = await getExamRecordContract();
    
    const tx = await contract.completeExamSession(
      sessionId,
      score,
      maxScore,
      timeSpent,
      examTitle
    );
    
    await tx.wait();
    return tx.hash;
  } catch (error: any) {
    console.error('Error completing exam session:', error);
    throw new Error('Không thể hoàn thành session thi');
  }
}

/**
 * Verify exam result integrity
 */
export async function verifyExamResult(examId: number): Promise<boolean> {
  try {
    const contract = getExamRecordContractReadOnly();
    return await contract.verifyExamResult(examId);
  } catch (error) {
    console.error('Error verifying exam result:', error);
    return false;
  }
}

/**
 * Get exam session details
 */
export async function getExamSession(sessionId: number): Promise<ExamSession | null> {
  try {
    const contract = getExamRecordContractReadOnly();
    const result = await contract.getExamSession(sessionId);
    
    return {
      sessionId,
      examId: Number(result.examId),
      student: result.student,
      startTime: Number(result.startTime),
      endTime: Number(result.endTime),
      isCompleted: result.isCompleted,
      totalViolations: Number(result.totalViolations),
      criticalViolations: Number(result.criticalViolations),
      isFlagged: result.isFlagged
    };
  } catch (error) {
    console.error('Error getting exam session:', error);
    return null;
  }
}

/**
 * Get session violations
 */
export async function getSessionViolations(sessionId: number): Promise<CheatingViolation[]> {
  try {
    const contract = getExamRecordContractReadOnly();
    const violations = await contract.getSessionViolations(sessionId);
    
    return violations.map((v: any) => ({
      examId: Number(v.examId),
      student: v.student,
      violationType: Number(v.violationType),
      severity: Number(v.severity),
      confidence: Number(v.confidence),
      timestamp: Number(v.timestamp),
      description: v.description,
      screenshotHash: v.screenshotHash
    }));
  } catch (error) {
    console.error('Error getting session violations:', error);
    return [];
  }
}

/**
 * Get student exam results
 */
export async function getStudentExamResults(studentAddress: string): Promise<number[]> {
  try {
    const contract = getExamRecordContractReadOnly();
    const results = await contract.getStudentExamResults(studentAddress);
    
    return results.map((id: any) => Number(id));
  } catch (error) {
    console.error('Error getting student exam results:', error);
    return [];
  }
}

/**
 * Get exam statistics
 */
export async function getExamStatistics(): Promise<ExamStatistics> {
  try {
    const contract = getExamRecordContractReadOnly();
    const stats = await contract.getStatistics();
    
    return {
      totalExams: Number(stats._totalExams),
      totalViolations: Number(stats._totalViolations),
      totalSessions: Number(stats._totalSessions),
      flaggedSessions: Number(stats.flaggedSessions)
    };
  } catch (error) {
    console.error('Error getting exam statistics:', error);
    return {
      totalExams: 0,
      totalViolations: 0,
      totalSessions: 0,
      flaggedSessions: 0
    };
  }
}

/**
 * Listen for exam events
 */
export function listenForExamEvents(
  onExamResultRecorded?: (examId: number, student: string, score: number, isPassed: boolean) => void,
  onViolationDetected?: (examId: number, student: string, violationType: number, severity: number) => void,
  onSessionStarted?: (sessionId: number, examId: number, student: string) => void,
  onSessionCompleted?: (sessionId: number, examId: number, student: string, isFlagged: boolean) => void
): () => void {
  const provider = getProvider();
  if (!provider) return () => {};

  const contract = getExamRecordContractReadOnly();

  const filters = {
    examResultRecorded: contract.filters.ExamResultRecorded(),
    violationDetected: contract.filters.CheatingViolationDetected(),
    sessionStarted: contract.filters.ExamSessionStarted(),
    sessionCompleted: contract.filters.ExamSessionCompleted()
  };

  const listeners: any[] = [];

  if (onExamResultRecorded) {
    const listener = (examId: any, student: any, score: any, maxScore: any, isPassed: any) => {
      onExamResultRecorded(Number(examId), student, Number(score), isPassed);
    };
    contract.on(filters.examResultRecorded, listener);
    listeners.push({ event: filters.examResultRecorded, listener });
  }

  if (onViolationDetected) {
    const listener = (examId: any, student: any, violationType: any, severity: any) => {
      onViolationDetected(Number(examId), student, Number(violationType), Number(severity));
    };
    contract.on(filters.violationDetected, listener);
    listeners.push({ event: filters.violationDetected, listener });
  }

  if (onSessionStarted) {
    const listener = (sessionId: any, examId: any, student: any) => {
      onSessionStarted(Number(sessionId), Number(examId), student);
    };
    contract.on(filters.sessionStarted, listener);
    listeners.push({ event: filters.sessionStarted, listener });
  }

  if (onSessionCompleted) {
    const listener = (sessionId: any, examId: any, student: any, isFlagged: any) => {
      onSessionCompleted(Number(sessionId), Number(examId), student, isFlagged);
    };
    contract.on(filters.sessionCompleted, listener);
    listeners.push({ event: filters.sessionCompleted, listener });
  }

  // Return cleanup function
  return () => {
    listeners.forEach(({ event, listener }) => {
      contract.off(event, listener);
    });
  };
}

/**
 * Mock functions for development (remove in production)
 */
export const mockExamService = {
  async startExamSessionOnChain(examId: number, studentAddress: string, examTitle: string): Promise<number> {
    return Math.floor(Math.random() * 1000) + 1;
  },

  async recordCheatingViolationOnChain(
    sessionId: number,
    violationType: number,
    severity: number,
    confidence: number,
    description: string,
    screenshotHash: string = ''
  ): Promise<string> {
    return '0x' + Math.random().toString(16).substr(2, 64);
  },

  async completeExamSessionOnChain(
    sessionId: number,
    score: number,
    maxScore: number,
    timeSpent: number,
    examTitle: string
  ): Promise<string> {
    return '0x' + Math.random().toString(16).substr(2, 64);
  },

  async verifyExamResult(examId: number): Promise<boolean> {
    return true;
  },

  async getExamSession(sessionId: number): Promise<ExamSession | null> {
    return {
      sessionId,
      examId: 1,
      student: '0x1234567890123456789012345678901234567890',
      startTime: Date.now() - 3600000,
      endTime: Date.now(),
      isCompleted: true,
      totalViolations: 2,
      criticalViolations: 0,
      isFlagged: false
    };
  },

  async getSessionViolations(sessionId: number): Promise<CheatingViolation[]> {
    return [
      {
        examId: 1,
        student: '0x1234567890123456789012345678901234567890',
        violationType: 1,
        severity: 2,
        confidence: 85,
        timestamp: Date.now() - 1800000,
        description: 'Phát hiện mắt nhìn ra khỏi màn hình',
        screenshotHash: 'QmMockHash123'
      }
    ];
  },

  async getStudentExamResults(studentAddress: string): Promise<number[]> {
    return [1, 2, 3];
  },

  async getExamStatistics(): Promise<ExamStatistics> {
    return {
      totalExams: 150,
      totalViolations: 25,
      totalSessions: 200,
      flaggedSessions: 5
    };
  }
};

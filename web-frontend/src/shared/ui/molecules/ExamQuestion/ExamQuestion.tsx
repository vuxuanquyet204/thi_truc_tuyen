import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Flag, CheckCircle2, Code, FileText } from 'lucide-react';
import { ExamQuestion as ExamQuestionType } from '@/foundation/types';

interface ExamQuestionProps {
  question: ExamQuestionType;
  questionNumber: number;
  totalQuestions: number;
  currentAnswer?: any;
  onAnswerChange: (answer: any) => void;
  onFlagQuestion: () => void;
  isFlagged?: boolean;
  timeSpent?: number;
  className?: string;
  isLocked?: boolean; // When exam is stopped/terminated, lock all inputs
}

const ExamQuestionComponent: React.FC<ExamQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  currentAnswer,
  onAnswerChange,
  onFlagQuestion,
  isFlagged = false,
  timeSpent = 0,
  className = '',
  isLocked = false,
}) => {
  const [answer, setAnswer] = useState(currentAnswer || '');
  const [startTime] = useState(Date.now());

  useEffect(() => {
    setAnswer(currentAnswer || '');
  }, [currentAnswer]);

  useEffect(() => {
    return () => {
      const timeSpentOnQuestion = Math.round((Date.now() - startTime) / 1000);
    };
  }, [startTime]);

  const handleAnswerChange = useCallback((newAnswer: any) => {
    setAnswer(newAnswer);
    onAnswerChange(newAnswer);
  }, [onAnswerChange]);

  const renderMultipleChoice = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {question.options?.map((option, index) => {
        const isSelected = answer === option.id; // Changed: compare with optionId
        return (
          <label
            key={option.id} // Changed: use optionId as key
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
              background: isSelected ? 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)' : 'var(--background)',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              boxShadow: isSelected ? 'var(--glow-primary)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = 'var(--card)';
                e.currentTarget.style.borderColor = 'var(--accent)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = 'var(--background)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }
            }}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={answer === option.id}
              onChange={() => handleAnswerChange(option.id)}
              disabled={isLocked}
              style={{
                marginTop: '2px',
                width: '18px',
                height: '18px',
                accentColor: 'var(--primary)',
                cursor: 'pointer'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: isSelected ? 'var(--primary)' : 'var(--muted-foreground)',
                  minWidth: '24px'
                }}>
                  {String.fromCharCode(65 + index)}.
                </span>
                <span style={{
                  color: isSelected ? '#1e40af' : 'var(--foreground)',
                  fontSize: '15px',
                  lineHeight: 1.6
                }}>
                  {option.text}
                </span>
              </div>
            </div>
            {isSelected && (
              <CheckCircle2 style={{
                width: '20px',
                height: '20px',
                color: 'var(--primary)',
                flexShrink: 0
              }} />
            )}
          </label>
        );
      })}
    </div>
  );

  const renderCodeQuestion = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{
        background: 'var(--background)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        border: '1px solid var(--border)'
      }}>
        <h4 style={{
          fontWeight: 600,
          color: 'var(--foreground)',
          marginBottom: 'var(--space-3)',
          fontSize: '14px'
        }}>
          Mẫu code:
        </h4>
        <pre style={{
          background: '#1e293b',
          color: '#e2e8f0',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          overflow: 'auto',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.6
        }}>
          <code>{question.codeTemplate}</code>
        </pre>
      </div>
      
      <div>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--foreground)',
          marginBottom: 'var(--space-2)'
        }}>
          Nhập code của bạn:
        </label>
        <textarea
          value={answer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          style={{
            width: '100%',
            height: '300px',
            padding: 'var(--space-4)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            lineHeight: 1.6,
            resize: 'vertical',
            background: 'var(--background)',
            color: 'var(--foreground)',
            outline: 'none',
            transition: 'border-color var(--transition-fast)',
            boxSizing: 'border-box',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          placeholder="Nhập code của bạn ở đây..."
          disabled={isLocked}
        />
      </div>

      {question.testCases && question.testCases.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          border: '1px solid #60a5fa'
        }}>
          <h4 style={{
            fontWeight: 600,
            color: '#1e40af',
            marginBottom: 'var(--space-3)',
            fontSize: '14px'
          }}>
            Test cases:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {question.testCases.map((testCase, index) => (
              <div key={index} style={{ fontSize: '13px', lineHeight: 1.8 }}>
                <span style={{ fontWeight: 600, color: '#1e40af' }}>Input:</span>
                <code style={{
                  marginLeft: 'var(--space-2)',
                  background: 'white',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px'
                }}>
                  {testCase.input}
                </code>
                <span style={{ marginLeft: 'var(--space-4)', fontWeight: 600, color: '#1e40af' }}>Expected:</span>
                <code style={{
                  marginLeft: 'var(--space-2)',
                  background: 'white',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px'
                }}>
                  {testCase.expected}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderEssayQuestion = () => (
    <div>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--foreground)',
        marginBottom: 'var(--space-2)'
      }}>
        Câu trả lời của bạn:
      </label>
      <textarea
        value={answer}
        onChange={(e) => handleAnswerChange(e.target.value)}
        style={{
          width: '100%',
          height: '250px',
          padding: 'var(--space-4)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '15px',
          lineHeight: 1.8,
          resize: 'vertical',
          background: 'var(--background)',
          color: 'var(--foreground)',
          fontFamily: 'var(--font-sans)',
          outline: 'none',
          transition: 'border-color var(--transition-fast)',
          boxSizing: 'border-box',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        placeholder="Nhập câu trả lời của bạn ở đây..."
        disabled={isLocked}
      />
    </div>
  );

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice':
        return renderMultipleChoice();
      case 'code':
        return renderCodeQuestion();
      case 'essay':
        return renderEssayQuestion();
      default:
        return <div style={{ color: 'var(--muted-foreground)' }}>Loại câu hỏi không được hỗ trợ</div>;
    }
  };

  const typeInfo = useMemo(() => {
    switch (question.type) {
      case 'multiple-choice':
        return { label: 'Trắc nghiệm', color: '#10b981', bg: '#d1fae5', icon: CheckCircle2 };
      case 'code':
        return { label: 'Lập trình', color: '#f59e0b', bg: '#fef3c7', icon: Code };
      case 'essay':
        return { label: 'Tự luận', color: '#8b5cf6', bg: '#ede9fe', icon: FileText };
      default:
        return { label: 'Khác', color: '#6b7280', bg: '#f3f4f6', icon: FileText };
    }
  }, [question.type]);

  const TypeIcon = typeInfo.icon;

  return (
    <div style={{
      background: 'var(--background)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      padding: 'var(--space-6)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-6)',
        gap: 'var(--space-4)'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-2)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}>
              Câu {questionNumber}/{totalQuestions}
            </div>
            
            <div style={{
              background: 'var(--muted)',
              color: 'var(--muted-foreground)',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {question.points} điểm
            </div>
            
            <div style={{
              background: typeInfo.bg,
              color: typeInfo.color,
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              <TypeIcon style={{ width: '14px', height: '14px' }} />
              {typeInfo.label}
            </div>
          </div>
        </div>
        
        {/* Flag Button - Redesigned */}
        <button
          onClick={onFlagQuestion}
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-lg)',
            border: isFlagged ? '2px solid #f59e0b' : '2px solid var(--border)',
            background: isFlagged 
              ? 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)' 
              : 'var(--background)',
            color: isFlagged ? '#92400e' : 'var(--muted-foreground)',
            cursor: 'pointer',
            transition: 'all var(--transition-normal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isFlagged ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            if (!isFlagged) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)';
              e.currentTarget.style.borderColor = '#fbbf24';
              e.currentTarget.style.color = '#f59e0b';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            if (!isFlagged) {
              e.currentTarget.style.background = 'var(--background)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--muted-foreground)';
            }
          }}
          title={isFlagged ? 'Bỏ đánh dấu câu hỏi' : 'Đánh dấu câu hỏi để xem lại sau'}
        >
          <Flag 
            style={{ 
              width: '20px', 
              height: '20px',
              fill: isFlagged ? 'currentColor' : 'none',
              transition: 'all var(--transition-fast)'
            }} 
          />
        </button>
      </div>

      {/* Question Content */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{
          fontSize: '17px',
          fontWeight: 500,
          color: 'var(--foreground)',
          marginBottom: 'var(--space-5)',
          lineHeight: 1.8,
          letterSpacing: '-0.01em'
        }}>
          {/* ✨ DEFENSIVE: Ensure question is rendered as string */}
          {typeof question.question === 'string' ? question.question : JSON.stringify(question.question)}
        </h3>
        {renderQuestionContent()}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 'var(--space-4)',
        borderTop: '1px solid var(--border)'
      }}>
        <div style={{
          fontSize: '13px',
          color: answer ? '#10b981' : 'var(--muted-foreground)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          {answer ? (
            <>
              <CheckCircle2 style={{ width: '16px', height: '16px' }} />
              Đã trả lời
            </>
          ) : (
            'Chưa trả lời'
          )}
        </div>
        {timeSpent > 0 && (
          <div style={{
            fontSize: '13px',
            color: 'var(--muted-foreground)',
            fontFamily: 'var(--font-mono)'
          }}>
            ⏱ {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
export const ExamQuestion = memo(ExamQuestionComponent);

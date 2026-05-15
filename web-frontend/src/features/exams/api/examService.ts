import { ExamDetails, ExamQuestion, ExamSubmission, ExamResult } from '@/foundation/types';
import onlineExamApi, { type Quiz, type Question as ApiQuestion, type SubmitAnswer } from './onlineExamApi';

class ExamService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api/exam`;
  }

  private adaptQuizToExamDetails(quiz: Quiz): ExamDetails {
    const totalPoints = quiz.questions?.reduce((sum, q) => sum + (q.points || 10), 0) || 0;

    const defaultInstructions = [
      'Đọc kỹ câu hỏi trước khi trả lời',
      'Kiểm tra lại đáp án trước khi nộp bài',
      'Thời gian làm bài sẽ được tính từ khi bắt đầu',
      'Không được rời khỏi trang thi trong quá trình làm bài'
    ];

    const duration = quiz.timeLimitMinutes && !isNaN(quiz.timeLimitMinutes)
      ? quiz.timeLimitMinutes
      : 60;

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description || '',
      duration,
      totalQuestions: quiz.questions?.length || 0,
      totalPoints,
      category: quiz.subject || quiz.category || 'General',
      difficulty: quiz.difficulty || 'medium',
      isProctored: quiz.isProctored || false,
      instructions: quiz.instructions || defaultInstructions,
      questions: quiz.questions?.map(q => this.adaptQuestionToExamQuestion(q)) || []
    };
  }

  private adaptQuestionToExamQuestion(question: ApiQuestion): ExamQuestion {
    let type: 'multiple-choice' | 'code' | 'essay' = 'multiple-choice';
    if (question.type === 'essay' || question.type === 'short-answer') {
      type = 'essay';
    }

    let questionText = question.content;

    if (typeof questionText !== 'string') {
      console.error('Question content is not a string!', {
        questionId: question.id,
        contentType: typeof questionText,
        content: questionText,
        rawQuestion: question
      });

      if (typeof questionText === 'object' && questionText !== null) {
        const obj = questionText as any;
        if (obj.question) {
          questionText = obj.question;
        } else if (obj.content) {
          questionText = obj.content;
        } else if (obj.text) {
          questionText = obj.text;
        } else {
          questionText = JSON.stringify(questionText);
        }
      } else {
        questionText = String(questionText);
      }
    }

    return {
      id: question.id,
      type,
      question: questionText,
      options: question.options?.map(opt => ({
        id: opt.id,
        text: opt.content || opt.optionText
      })) || [],
      correctAnswer: question.options?.findIndex(opt => opt.isCorrect) || 0,
      points: question.points || 10,
      explanation: question.explanation,
      code: undefined,
      timeLimit: undefined
    };
  }

  async getExamDetails(examId: string): Promise<ExamDetails> {
    try {
      const quiz = await onlineExamApi.getQuizDetails(examId);
      return this.adaptQuizToExamDetails(quiz);
    } catch (error) {
      console.error('Error fetching exam details:', error);
      throw new Error('Không thể tải thông tin bài thi');
    }
  }

  async startExam(examId: string): Promise<{ sessionId: string; startTime: string }> {
    try {
      const response = await onlineExamApi.startQuiz(examId);

      return {
        sessionId: response.data.submissionId,
        startTime: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error starting exam:', error);

      if (error?.response?.status === 409) {
        const existingSubmissionId = error.response?.data?.data?.submissionId;

        if (existingSubmissionId) {
          return {
            sessionId: existingSubmissionId,
            startTime: new Date().toISOString()
          };
        }

        throw new Error('Bạn đã bắt đầu bài thi này rồi');
      }

      if (error?.response?.status === 400) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message;
        throw new Error(errorMessage || 'Không thể bắt đầu bài thi');
      }

      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error.message;
      throw new Error(errorMessage || 'Khong the bat dau bai thi');
    }
  }

  async saveAnswer(sessionId: string, questionId: number, answer: any): Promise<void> {
    try {
      const cachedAnswers = JSON.parse(localStorage.getItem(`exam_${sessionId}`) || '{}');
      cachedAnswers[questionId] = answer;
      localStorage.setItem(`exam_${sessionId}`, JSON.stringify(cachedAnswers));
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  }

  async submitExam(submission: ExamSubmission): Promise<ExamResult> {
    try {
      const backendAnswers: SubmitAnswer[] = submission.answers.map(ans => ({
        questionId: ans.questionId,
        selectedOptionId: ans.answer
      }));

      const response = await onlineExamApi.submitQuiz(submission.sessionId, {
        answers: backendAnswers
      });

      localStorage.removeItem(`exam_${submission.sessionId}`);

      return {
        submissionId: response.data.submissionId,
        examId: submission.examId,
        sessionId: submission.sessionId,
        score: response.data.score,
        totalQuestions: submission.answers.length,
        correctAnswers: Math.round((response.data.score / 100) * submission.answers.length),
        timeSpent: submission.timeSpent,
        submittedAt: new Date().toISOString(),
        passed: response.data.score >= 70
      };
    } catch (error) {
      console.error('Error submitting exam:', error);
      throw new Error('Không thể nộp bài thi');
    }
  }

  async sendMonitoringScreenshot(sessionId: string, imageData: string): Promise<void> {
    try {
      // Could send to proctoring service if needed
    } catch (error) {
      console.error('Error sending screenshot:', error);
    }
  }

  async getExamResult(sessionId: string): Promise<ExamResult> {
    const result = await onlineExamApi.getQuizResult(sessionId);

    const timeSpentMinutes = result.timeSpentSeconds
      ? Math.round(result.timeSpentSeconds / 60)
      : 0;

    return {
      examId: result.examId,
      sessionId,
      score: result.score || 0,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      timeSpent: timeSpentMinutes,
      submittedAt: result.submittedAt || new Date().toISOString(),
      passed: result.passed,
      percentile: result.percentile || undefined,
      quizTitle: result.examTitle,
      questions: result.questionResults
    };
  }

  async getAllExams(): Promise<ExamDetails[]> {
    try {
      const quizzes = await onlineExamApi.getAllQuizzes();
      return quizzes.map(quiz => this.adaptQuizToExamDetails(quiz));
    } catch (error) {
      console.error('Error fetching all exams:', error);
      throw new Error('Không thể tải danh sách bài thi');
    }
  }

  async getMySubmissions(): Promise<any[]> {
    try {
      const submissions = await onlineExamApi.getMyAllSubmissions();
      return submissions;
    } catch (error) {
      console.error('Error fetching my submissions:', error);
      return [];
    }
  }

  async getQuizDetails(quizId: string): Promise<Quiz> {
    try {
      const quiz = await onlineExamApi.getQuizDetails(quizId);
      return quiz;
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      throw new Error('Không thể tải thông tin quiz');
    }
  }
}

export const examService = new ExamService();

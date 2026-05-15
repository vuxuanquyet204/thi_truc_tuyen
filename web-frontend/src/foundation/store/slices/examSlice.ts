import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { examService } from '@/features/exams/api';
import type { ExamDetails, ExamQuestion, ExamAnswer, ExamSubmission, ExamResult, ExamSession } from '@/foundation/types';

// State types
export type ExamStatus = 'idle' | 'loading' | 'pre-check' | 'active' | 'submitting' | 'finished' | 'error'

export interface ExamState {
	// Exam details
	currentExam: ExamDetails | null
	questions: ExamQuestion[]

	// Session info
	session: ExamSession | null
	submissionId: string | null // ✅ Store submission ID after submit

	// Current state
	currentQuestionIndex: number
	answers: Record<string, ExamAnswer> // Changed: key is questionId (UUID string)
	timeRemaining: number // seconds
	startTime: number | null

	// UI state
	status: ExamStatus
	error: string | null

	// Camera state
	isCameraReady: boolean
	cameraError: string | null

	// Navigation
	visitedQuestions: number[]
	flaggedQuestions: number[]
}

const initialState: ExamState = {
	currentExam: null,
	questions: [],
	session: null,
	submissionId: null,
	currentQuestionIndex: 0,
	answers: {},
	timeRemaining: 0,
	startTime: null,
	status: 'idle',
	error: null,
	isCameraReady: false,
	cameraError: null,
	visitedQuestions: [],
	flaggedQuestions: []
}

// Thunk argument types
interface FetchExamDetailsArgs {
	examId: string
}

interface StartExamSessionArgs {
	examId: string
}

interface SaveAnswerArgs {
	questionId: number
	answer: number | string // Union type for different answer types
}

// Async thunks with strict typing
export const fetchExamDetails = createAsyncThunk<
	ExamDetails, // Return type
	string, // Argument type (examId)
	{ rejectValue: string } // ThunkAPI config
>(
	'exam/fetchExamDetails',
	async (examId, { rejectWithValue }) => {
		try {
			const examDetails = await examService.getExamDetails(examId);
			return examDetails;
		} catch (error) {
			return rejectWithValue(error instanceof Error ? error.message : 'Lỗi không xác định');
		}
	}
);

export const startExamSession = createAsyncThunk<
	{ sessionId: string; startTime: string }, // Return type
	string, // Argument type (examId)
	{ rejectValue: string }
>(
	'exam/startExamSession',
	async (examId, { rejectWithValue }) => {
		try {
			const sessionData = await examService.startExam(examId);
			return sessionData;
		} catch (error) {
			return rejectWithValue(error instanceof Error ? error.message : 'Không thể bắt đầu bài thi');
		}
	}
);

export const saveAnswer = createAsyncThunk<
	{ questionId: number; answer: number | string; timeSpent: number }, // Return type
	SaveAnswerArgs, // Argument type
	{ rejectValue: string; state: { exam: ExamState } }
>(
	'exam/saveAnswer',
	async (params, { getState, rejectWithValue }) => {
		try {
			const state = getState();
			const { session, answers } = state.exam;

			if (!session) {
				throw new Error('Không tìm thấy session');
			}

			await examService.saveAnswer(session.id, params.questionId, params.answer);

			return {
				questionId: params.questionId,
				answer: params.answer,
				timeSpent: answers[params.questionId]?.timeSpent || 0
			};
		} catch (error) {
			return rejectWithValue(error instanceof Error ? error.message : 'Không thể lưu câu trả lời');
		}
	}
);

export const submitExam = createAsyncThunk<
	ExamResult, // Return type
	void, // No argument
	{ rejectValue: string; state: { exam: ExamState } }
>(
	'exam/submitExam',
	async (_, { getState, rejectWithValue }) => {
		try {
			const state = getState();
			const { currentExam, session, answers, startTime } = state.exam;

			if (!currentExam || !session || !startTime) {
				throw new Error('Thiếu thông tin cần thiết để nộp bài');
			}

			const timeSpent = Math.round((Date.now() - startTime) / 60000); // minutes
			const submission: ExamSubmission = {
				examId: currentExam.id,
				sessionId: session.id,
				answers: Object.values(answers),
				timeSpent,
				submittedAt: new Date().toISOString()
			};

			const result = await examService.submitExam(submission);
			return result;
		} catch (error) {
			return rejectWithValue(error instanceof Error ? error.message : 'Không thể nộp bài thi');
		}
	}
);

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    // Navigation
    setCurrentQuestion: (state, action: PayloadAction<number>) => {
      const questionIndex = action.payload;
      if (questionIndex >= 0 && questionIndex < state.questions.length) {
        state.currentQuestionIndex = questionIndex;
        if (!state.visitedQuestions.includes(questionIndex)) {
          state.visitedQuestions.push(questionIndex);
        }
      }
    },
    
    goToNextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
        if (!state.visitedQuestions.includes(state.currentQuestionIndex)) {
          state.visitedQuestions.push(state.currentQuestionIndex);
        }
      }
    },
    
    goToPreviousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
        if (!state.visitedQuestions.includes(state.currentQuestionIndex)) {
          state.visitedQuestions.push(state.currentQuestionIndex);
        }
      }
    },
    
    goToQuestion: (state, action: PayloadAction<number>) => {
      const questionIndex = action.payload;
      if (questionIndex >= 0 && questionIndex < state.questions.length) {
        state.currentQuestionIndex = questionIndex;
        if (!state.visitedQuestions.includes(questionIndex)) {
          state.visitedQuestions.push(questionIndex);
        }
      }
    },
    
    // Answer management
    updateAnswer: (state, action: PayloadAction<{ questionId: number; answer: any }>) => {
      const { questionId, answer } = action.payload;
      const existingAnswer = state.answers[questionId];
      
      state.answers[questionId] = {
        questionId,
        answer,
        timeSpent: existingAnswer?.timeSpent || 0
      };
    },
    
    // Timer management
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
    
    tickTimer: (state) => {
      if (state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      } else if (state.status === 'active') {
        state.status = 'finished';
      }
    },
    
    // Camera management
    setCameraReady: (state, action: PayloadAction<boolean>) => {
      state.isCameraReady = action.payload;
    },
    
    setCameraError: (state, action: PayloadAction<string | null>) => {
      state.cameraError = action.payload;
    },
    
    // Question flagging
    toggleQuestionFlag: (state, action: PayloadAction<number>) => {
      const questionId = action.payload;
      const index = state.flaggedQuestions.indexOf(questionId);
      if (index > -1) {
        state.flaggedQuestions.splice(index, 1);
      } else {
        state.flaggedQuestions.push(questionId);
      }
    },
    
    // Reset exam state
    resetExam: (state) => {
      return {
        ...initialState,
        // Preserve some state if needed
      };
    },
    
    // Set pre-check status
    setPreCheckStatus: (state, action: PayloadAction<'idle' | 'loading' | 'ready'>) => {
      if (action.payload === 'ready') {
        state.status = 'pre-check';
      }
    },
    
    // Set status directly
    setStatus: (state, action: PayloadAction<ExamState['status']>) => {
      state.status = action.payload;
    }
  },
  
  extraReducers: (builder) => {
    // Fetch exam details
    builder
      .addCase(fetchExamDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchExamDetails.fulfilled, (state, action) => {
        state.status = 'idle';
        state.currentExam = action.payload;
        state.questions = action.payload.questions;
        state.timeRemaining = action.payload.duration * 60; // convert to seconds
        state.error = null;
      })
      .addCase(fetchExamDetails.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      });
    
    // Start exam session
    builder
      .addCase(startExamSession.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(startExamSession.fulfilled, (state, action) => {
        state.session = {
          id: action.payload.sessionId,
          examId: state.currentExam?.id || '',
          startTime: action.payload.startTime,
          status: 'active'
        };
        state.startTime = Date.now();
        state.status = 'pre-check';
      })
      .addCase(startExamSession.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      });
    
    // Save answer
    builder
      .addCase(saveAnswer.fulfilled, (state, action) => {
        // Answer is already saved in the reducer, just log success
        console.log('Answer saved successfully:', action.payload);
      })
      .addCase(saveAnswer.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Submit exam
    builder
      .addCase(submitExam.pending, (state) => {
        state.status = 'submitting';
      })
      .addCase(submitExam.fulfilled, (state, action) => {
        state.status = 'finished';
        state.session = state.session ? { ...state.session, status: 'completed' } : null;
        state.submissionId = action.payload.submissionId; // ✅ Store submission ID
      })
      .addCase(submitExam.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload as string;
      });
  }
});

export const {
  setCurrentQuestion,
  goToNextQuestion,
  goToPreviousQuestion,
  goToQuestion,
  updateAnswer,
  updateTimeRemaining,
  tickTimer,
  setCameraReady,
  setCameraError,
  toggleQuestionFlag,
  resetExam,
  setPreCheckStatus,
  setStatus
} = examSlice.actions;

export default examSlice.reducer;

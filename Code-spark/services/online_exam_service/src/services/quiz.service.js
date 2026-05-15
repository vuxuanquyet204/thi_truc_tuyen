// file: src/services/quiz.service.js

const db = require('../models');
const gradingService = require('./grading.service');
const proctoringIntegrationService = require('./proctoring.integration');

// ==========================================
// 1. IMPORT KAFKA PRODUCER ĐỂ GỬI THÔNG BÁO
// ==========================================
const notificationProducer = require('./notification.producer');

/**
 * Tinh toan va luu ranking/percentile cho submission.
 * studentId da la UUID (BigInt da chuyen sang UUID theo exam_db ERD).
 */
async function calculateAndStoreRanking(quizId, submissionId, studentId, score) {
  try {
    const allSubmissions = await db.QuizSubmission.findAll({
      where: {
        quizId,
        submittedAt: { [db.Sequelize.Op.ne]: null }
      },
      attributes: ['id', 'score'],
      order: [['score', 'DESC']]
    });

    const totalSubmissions = allSubmissions.length;
    const rank = allSubmissions.findIndex(s => s.id === submissionId) + 1;
    const submissionsWithLowerScore = allSubmissions.filter(s => s.score < score).length;
    const percentile = totalSubmissions > 1
      ? Math.round((submissionsWithLowerScore / (totalSubmissions - 1)) * 100)
      : 100;

    await db.QuizRanking.upsert({
      quizId,
      studentId,
      submissionId,
      score,
      percentile,
      rank,
      totalSubmissions
    });
  } catch (error) {
    console.error('Error calculating ranking:', error);
  }
}

/**
 * Xu ly logic khi sinh vien bat dau lam bai.
 * studentId den tu JWT (identity_db users.id = UUID).
 */
async function startQuiz(userId, quizId, authToken) {
  const quiz = await db.Quiz.findByPk(quizId);
  if (!quiz) {
    throw new Error(`Khong tim thay bai quiz voi ID: ${quizId}`);
  }

  // Kiem tra submission chua nop (dung submittedAt thay vi status)
  const existingSubmission = await db.QuizSubmission.findOne({
    where: {
      studentId: userId,
      quizId,
      submittedAt: { [db.Sequelize.Op.eq]: null }
    }
  });

  if (existingSubmission) {
    const quizWithDetails = await db.Quiz.findByPk(quizId, {
      include: {
        model: db.Question,
        as: 'questions',
        through: { attributes: ['displayOrder'] },
        include: {
          model: db.QuestionOption,
          as: 'options',
        },
      },
      order: [
        [{ model: db.Question, as: 'questions' }, db.ExamQuestion, 'displayOrder', 'ASC'],
      ],
    });

    const error = new Error('Ban da bat dau bai thi nay roi va chua hoan thanh.');
    error.submissionId = existingSubmission.id;
    error.quizDetails = quizWithDetails;
    error.isConflict = true;
    throw error;
  }

  // Tao submission moi
  const newSubmission = await db.QuizSubmission.create({
    studentId: userId,
    quizId,
    startedAt: new Date(),
    isFinal: false,
  });

  // Goi proctoring service
  if (authToken) {
    try {
      await proctoringIntegrationService.startMonitoringSession(userId, quizId, authToken);
    } catch (proctoringError) {
      console.warn('Canh bao: Khong the khoi dong dich vu giam sat, nhung van cho phep thi.',
        proctoringError.message);
    }
  }

  // Lay cau hoi de tra ve cho Frontend
  const quizWithDetails = await db.Quiz.findByPk(quizId, {
    include: {
      model: db.Question,
      as: 'questions',
      through: { attributes: ['displayOrder'] },
      include: {
        model: db.QuestionOption,
        as: 'options',
      },
    },
    order: [
      [{ model: db.Question, as: 'questions' }, db.ExamQuestion, 'displayOrder', 'ASC'],
    ],
  });

  return {
    submissionId: newSubmission.id,
    quizDetails: quizWithDetails,
  };
}

/**
 * Xu ly logic khi sinh vien nop bai.
 * 1. Cap nhat submission voi cau tra loi.
 * 2. Luu chi tiet tung cau tra loi vao bang answers (exam_db).
 * 3. Cham diem tu dong.
 * 4. Tinh ranking.
 */
async function submitQuiz(submissionId, answers, authHeader) {
  const submission = await db.QuizSubmission.findByPk(submissionId);

  if (!submission) {
    throw new Error(`Khong tim thay bai lam voi ID: ${submissionId}`);
  }

  // Kiem tra da nop chua (dung submittedAt thay vi status)
  if (submission.submittedAt) {
    throw new Error('Bai thi nay da duoc nop truoc do.');
  }

  // --- Tim proctoring session truoc khi cap nhat submission ---
  let proctoringSessionId = null;
  try {
    const activeSessions = await proctoringIntegrationService.getActiveSessions(authHeader || undefined);
    const sessions = Array.isArray(activeSessions) ? activeSessions : (activeSessions?.data || []);

    const matchingSession = sessions.find(s => {
      return String(s.examId || s.exam_id || '') === String(submission.quizId)
        && String(s.userId || s.user_id || '') === String(submission.studentId)
        && (String(s.status).toLowerCase() === 'in_progress');
    });

    if (matchingSession) {
      proctoringSessionId = matchingSession.id || matchingSession.sessionId;
    }
  } catch (error) {
    console.warn('[QUIZ SERVICE] Khong the lay danh sach proctoring sessions (non-critical):', error.message || error);
  }

  // --- Luu chi tiet cau tra vao bang answers (exam_db) ---
  // Xoa cau tra loi cu (phong resubmit)
  await db.Answer.destroy({ where: { submissionId: submission.id } });

  // -------------------------------------------------------------
  // ĐÃ SỬA LỖI DATABASE Ở ĐÂY: Hỗ trợ cả 2 tên biến từ Frontend gửi lên
  // -------------------------------------------------------------
  const answerRecords = answers.map(answer => ({
    submissionId: submission.id,
    questionId: answer.questionId,
    selectedAnswer: answer.selectedOptionId || answer.selectedAnswer, 
    score: null,
    isCorrect: null,
  }));

  await db.Answer.bulkCreate(answerRecords);

  // --- Cap nhat submission ---
  const submittedAt = new Date();
  submission.answers = JSON.stringify(answers);
  submission.submittedAt = submittedAt;
  submission.isFinal = true;

  if (submission.startedAt) {
    submission.timeSpentSeconds = Math.round((submittedAt - submission.startedAt) / 1000);
  }

  await submission.save();

  // --- Cham diem tu dong ---
  const gradingResult = await gradingService.autoGrade(submissionId);
  const finalScore = gradingResult.score;

  await db.QuizSubmission.update(
    {
      correctAnswers: gradingResult.correctAnswers,
      wrongAnswers: gradingResult.wrongAnswers,
      totalQuestions: gradingResult.totalQuestions,
      score: finalScore
    },
    { where: { id: submissionId } }
  );

  // --- Tinh ranking (non-blocking) ---
  try {
    await calculateAndStoreRanking(submission.quizId, submissionId, submission.studentId, finalScore);
  } catch (error) {
    console.error('Lỗi tính ranking:', error.message);
  }

  // --- Hoan tat proctoring session (non-blocking) ---
  if (proctoringSessionId) {
    try {
      await proctoringIntegrationService.completeMonitoringSession(proctoringSessionId, authHeader || undefined);
    } catch (error) {
      console.warn('Khong the hoan tat phien giam sat (non-critical):', error.message || error);
    }
  }

  return {
    submissionId,
    score: finalScore,
    scoreRaw: finalScore,
    message: "Nop bai va cham diem thanh cong!",
  };
}

/**
 * Lay danh sach tat ca cac quiz (cho trang danh sach bai thi).
 * Chi tra ve cac exam da xuat ban (status = 'OPEN' trong exam_db).
 * exam_db status: DRAFT, SCHEDULED, OPEN, CLOSED, CANCELLED
 */
async function getAllQuizzes() {
  const quizzes = await db.Quiz.findAll({
    where: {
      status: ['PUBLISHED', 'OPEN']
    },
    attributes: ['id', 'title', 'description', 'durationMinutes', 'passScore',
      'startAt', 'endAt', 'totalQuestions', 'createdAt'],
    order: [['id', 'ASC']],
  });

  return await Promise.all(
    quizzes.map(async (quiz) => {
      const participantCount = await db.QuizSubmission.count({
        where: { quizId: quiz.id },
      });
      return { ...quiz.toJSON(), participantCount };
    })
  );
}

/**
 * Lay chi tiet quiz (khong tao submission).
 */
async function getQuizDetails(quizId) {
  console.log(`[QUIZ SERVICE] Truy vấn chi tiết ID: ${quizId}`);

  const quiz = await db.Quiz.findByPk(quizId, {
    include: {
      model: db.Question,
      as: 'questions',
      through: { attributes: ['displayOrder'] },
      include: {
        model: db.QuestionOption,
        as: 'options',
      },
    },
    order: [
      [{ model: db.Question, as: 'questions' }, db.ExamQuestion, 'displayOrder', 'ASC'],
    ],
  });

  if (!quiz) {
    throw new Error(`Khong tim thay bai quiz voi ID: ${quizId}`);
  }

  return quiz;
}

/**
 * Lay tat ca submissions cua mot student.
 * studentId tu JWT (UUID).
 */
async function getStudentSubmissions(studentId) {
  return await db.QuizSubmission.findAll({
    where: { studentId },
    order: [['id', 'DESC']],
  });
  return submissions;
}

/**
 * Lay trang thai mot submission (tra ve ca trang thai in-progress).
 */
async function getSubmissionStatus(submissionId, userId) {
  const submission = await db.QuizSubmission.findOne({
    where: { id: submissionId, studentId: userId },
    include: [{
      model: db.Quiz,
      as: 'quiz',
      attributes: ['id', 'title', 'description', 'durationMinutes', 'timeLimitMinutes']
    }]
  });

  if (!submission) {
    return null;
  }

  return {
    id: submission.id,
    quizId: submission.quizId,
    studentId: submission.studentId,
    score: submission.score,
    submittedAt: submission.submittedAt,
    answers: submission.answers,
    status: submission.submittedAt ? 'submitted' : 'in-progress',
    startedAt: submission.startedAt,
    timeSpentSeconds: submission.timeSpentSeconds,
    correctAnswers: submission.correctAnswers,
    wrongAnswers: submission.wrongAnswers,
    totalQuestions: submission.totalQuestions,
    quiz: submission.quiz ? {
      id: submission.quiz.id,
      title: submission.quiz.title,
      description: submission.quiz.description,
      durationMinutes: submission.quiz.durationMinutes || submission.quiz.timeLimitMinutes,
    } : null
  };
}

/**
 * Lay ket qua chi tiet cua mot submission.
 * userId tu JWT (UUID) -> so sanh voi studentId trong exam_db (UUID).
 */
async function getSubmissionResult(submissionId, userId) {
  const submission = await db.QuizSubmission.findOne({
    where: { id: submissionId, studentId: userId },
    include: [
      {
        model: db.Quiz,
        as: 'quiz',
        include: {
          model: db.Question,
          as: 'questions',
          include: { model: db.QuestionOption, as: 'options' },
        },
      },
      { model: db.Answer, as: 'answersDetail' },
      { model: db.QuizRanking, as: 'ranking', required: false }
    ],
  });

  if (!submission) {
    throw new Error('Khong tim thay bai thi hoac ban khong co quyen xem ket qua nay');
  }

  if (!submission.submittedAt) {
    throw new Error('Bai thi nay chua nop bai');
  }

  const totalQuestions = submission.totalQuestions || submission.quiz.questions.length;
  const score = submission.score || 0;
  const passed = score >= (submission.quiz.passScore || 70);

  const questionResults = submission.quiz.questions.map(question => {
    const studentAnswer = submission.answersDetail.find(a => a.questionId === question.id);

    let isCorrect = false;
    let correctOptionIds = [];
    let studentSelectedOptionId = null;
    let studentAnswerText = null;
    let optionsArray = [];

    if (studentAnswer && studentAnswer.selectedAnswer) {
      studentSelectedOptionId = studentAnswer.selectedAnswer;
    }

    // Options tu JSONB content
    if (question.content && typeof question.content === 'object' && Array.isArray(question.content.options)) {
      optionsArray = question.content.options.map((optText, idx) => ({
        id: `${question.id}-opt-${idx}`,
        text: optText,
        isCorrect: idx === question.content.correctAnswer,
      }));
    } else if (question.options && question.options.length > 0) {
      optionsArray = question.options.map(opt => ({
        id: opt.id,
        text: opt.optionText,
        isCorrect: opt.isCorrect,
      }));
    }

    correctOptionIds = optionsArray.filter(opt => opt.isCorrect).map(opt => opt.id);

    const normalizedType = (question.type || '').toLowerCase();

    if (normalizedType === 'multiple_choice' || normalizedType === 'single_choice'
      || normalizedType === 'true_false' || normalizedType.includes('choice')) {
      if (studentSelectedOptionId) {
        isCorrect = correctOptionIds.includes(studentSelectedOptionId);
      }
    } else if (normalizedType === 'essay') {
      if (studentAnswer) {
        studentAnswerText = studentAnswer.selectedAnswer;
        isCorrect = studentAnswer.score > 0;
      }
    }

    let questionText = question.text || '';
    if (!questionText && question.content) {
      if (typeof question.content === 'object') {
        questionText = question.content.question || question.content.text
          || question.content.questionText || '';
      } else if (typeof question.content === 'string') {
        try {
          const parsed = JSON.parse(question.content);
          questionText = parsed.question || parsed.text || parsed.questionText || question.content;
        } catch {
          questionText = question.content;
        }
      }
    }

    if (!questionText) {
      questionText = `Question ${question.id}`;
    }

    return {
      questionId: question.id,
      questionText,
      questionType: question.type,
      isCorrect,
      correctOptionIds,
      studentSelectedOptionId,
      studentAnswerText,
      earnedPoints: studentAnswer?.score || 0,
      maxPoints: question.score || question.points || 1,
      options: optionsArray,
    };
  });

  return {
    submissionId: submission.id,
    examId: submission.quizId,
    examTitle: submission.quiz.title,
    score: Math.round(score * 10) / 10,
    totalQuestions,
    correctAnswers: submission.correctAnswers || 0,
    wrongAnswers: submission.wrongAnswers || 0,
    passed,
    submittedAt: submission.submittedAt,
    timeSpentSeconds: submission.timeSpentSeconds,
    questionResults,
    percentile: submission.ranking?.percentile || null,
    rank: submission.ranking?.rank || null,
    totalSubmissions: submission.ranking?.totalSubmissions || null,
  };
}

/**
 * DONG TU KHOI TAO - them cuoi file, truoc module.exports
 * Sync quiz tu Course Service (Java) sang Online Exam Service.
 * Tao moi hoac cap nhat quiz + questions + options.
 */
async function syncQuizFromCourseService(quizData) {
  const { quizId, title, description, timeLimit, passScore, questions = [] } = quizData;

  if (!quizId) {
    throw new Error('quizId is required');
  }

  // Tao hoac cap nhat Quiz
  const [quiz, created] = await db.Quiz.upsert({
    id: quizId,
    title: title || `Quiz ${quizId}`,
    description: description || '',
    timeLimit: timeLimit || 30,
    passScore: passScore || 70,
    status: 'published',
  });

  // Xoa cau hoi cu (neu can reset)
  if (!created) {
    await db.ExamQuestion.destroy({ where: { examId: quizId } });
    await db.Question.destroy({ where: { quizId } });
  }

  // Tao cau hoi moi
  for (const q of questions) {
    const question = await db.Question.create({
      id: q.id || `${quizId}-q-${q.order}`,
      quizId,
      type: q.type || 'single_choice',
      text: q.text || q.questionText || '',
      content: q.content || null,
      score: q.score || q.points || 1,
      displayOrder: q.order || q.displayOrder || 0,
    });

    // Tao cac tuy chon (neu co)
    if (q.options && q.options.length > 0) {
      for (let i = 0; i < q.options.length; i++) {
        const opt = q.options[i];
        // Handle both string options and object options
        const isCorrect = typeof opt === 'object' 
          ? (opt.isCorrect || false)
          : (q.correctAnswer === i); // Use correctAnswer index for string options
        const optionText = typeof opt === 'object' 
          ? (opt.text || opt.optionText || '') 
          : opt;
        
        await db.QuestionOption.create({
          id: typeof opt === 'object' ? (opt.id || `${question.id}-opt-${i}`) : `${question.id}-opt-${i}`,
          questionId: question.id,
          optionText: optionText,
          isCorrect: isCorrect,
          displayOrder: typeof opt === 'object' ? (opt.order || opt.displayOrder || i) : i,
        });
      }
    } else if (q.correctAnswer !== undefined) {
      // Neu chi co correctAnswer (index), tao options tu dong
      await db.QuestionOption.create({
        questionId: question.id,
        optionText: 'True',
        isCorrect: q.correctAnswer === 0 || q.correctAnswer === true,
        displayOrder: 0,
      });
      await db.QuestionOption.create({
        questionId: question.id,
        optionText: 'False',
        isCorrect: q.correctAnswer === 1 || q.correctAnswer === false,
        displayOrder: 1,
      });
    }

    // Lien ket cau hoi voi quiz qua ExamQuestion
    await db.ExamQuestion.create({
      examId: quizId,
      questionId: question.id,
      displayOrder: question.displayOrder,
    });
  }

  return { quizId, title: quiz.title, questionsCount: questions.length, synced: true };
}

module.exports = {
  startQuiz,
  submitQuiz,
  getAllQuizzes,
  getQuizDetails,
  getStudentSubmissions,
  getSubmissionStatus,
  getSubmissionResult,
  syncQuizFromCourseService
};
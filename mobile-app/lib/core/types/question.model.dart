/// Question model for exam session
class Question {
  const Question({
    required this.id,
    required this.examId,
    required this.text,
    required this.type,
    required this.options,
    this.correctOptionIndex,
    this.points = 1,
    this.explanation,
    this.category,
    this.difficulty,
  });

  final String id;
  final String examId;
  final String text;
  final QuestionType type;
  final List<String> options;
  final int? correctOptionIndex;
  final int points;
  final String? explanation;
  final String? category;
  final String? difficulty; // easy, medium, hard

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] as String,
      examId: json['exam_id'] as String,
      text: json['text'] as String,
      type: QuestionType.fromString(json['type'] as String?),
      options: (json['options'] as List<dynamic>).cast<String>(),
      correctOptionIndex: json['correct_option_index'] as int?,
      points: json['points'] as int? ?? 1,
      explanation: json['explanation'] as String?,
      category: json['category'] as String?,
      difficulty: json['difficulty'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'exam_id': examId,
        'text': text,
        'type': type.name,
        'options': options,
        'correct_option_index': correctOptionIndex,
        'points': points,
        'explanation': explanation,
        'category': category,
        'difficulty': difficulty,
      };

  Question copyWith({
    String? id,
    String? examId,
    String? text,
    QuestionType? type,
    List<String>? options,
    int? correctOptionIndex,
    int? points,
    String? explanation,
    String? category,
    String? difficulty,
  }) {
    return Question(
      id: id ?? this.id,
      examId: examId ?? this.examId,
      text: text ?? this.text,
      type: type ?? this.type,
      options: options ?? this.options,
      correctOptionIndex: correctOptionIndex ?? this.correctOptionIndex,
      points: points ?? this.points,
      explanation: explanation ?? this.explanation,
      category: category ?? this.category,
      difficulty: difficulty ?? this.difficulty,
    );
  }
}

enum QuestionType {
  singleChoice,
  multipleChoice,
  trueFalse,
  essay;

  String get displayName => switch (this) {
        QuestionType.singleChoice => 'Chọn một đáp án',
        QuestionType.multipleChoice => 'Chọn nhiều đáp án',
        QuestionType.trueFalse => 'Đúng / Sai',
        QuestionType.essay => 'Tự luận',
      };

  static QuestionType fromString(String? value) => switch (value) {
        'multiple_choice' => QuestionType.multipleChoice,
        'true_false' => QuestionType.trueFalse,
        'essay' => QuestionType.essay,
        _ => QuestionType.singleChoice,
      };
}

/// Answer submitted by candidate
class Answer {
  const Answer({
    required this.questionId,
    this.selectedOptionIndices = const [],
    this.textAnswer,
    this.isFlagged = false,
  });

  final String questionId;
  final List<int> selectedOptionIndices;
  final String? textAnswer;
  final bool isFlagged;

  Answer copyWith({
    String? questionId,
    List<int>? selectedOptionIndices,
    String? textAnswer,
    bool? isFlagged,
  }) {
    return Answer(
      questionId: questionId ?? this.questionId,
      selectedOptionIndices: selectedOptionIndices ?? this.selectedOptionIndices,
      textAnswer: textAnswer ?? this.textAnswer,
      isFlagged: isFlagged ?? this.isFlagged,
    );
  }

  Map<String, dynamic> toJson() => {
        'question_id': questionId,
        'selected_option_indices': selectedOptionIndices,
        'text_answer': textAnswer,
        'is_flagged': isFlagged,
      };
}

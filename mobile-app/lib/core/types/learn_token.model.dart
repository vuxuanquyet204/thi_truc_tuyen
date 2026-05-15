/// LearnToken model — balance, transactions, rewards
class LearnToken {
  const LearnToken({
    required this.id,
    required this.userId,
    required this.balance,
    this.totalEarned = 0,
    this.totalSpent = 0,
    this.transactions = const [],
    this.rewards = const [],
  });

  final String id;
  final String userId;
  final int balance;
  final int totalEarned;
  final int totalSpent;
  final List<TokenTransaction> transactions;
  final List<TokenReward> rewards;

  factory LearnToken.fromJson(Map<String, dynamic> json) {
    return LearnToken(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      balance: json['balance'] as int,
      totalEarned: json['total_earned'] as int? ?? 0,
      totalSpent: json['total_spent'] as int? ?? 0,
      transactions: (json['transactions'] as List<dynamic>?)
              ?.map((e) => TokenTransaction.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      rewards: (json['rewards'] as List<dynamic>?)
              ?.map((e) => TokenReward.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'user_id': userId,
        'balance': balance,
        'total_earned': totalEarned,
        'total_spent': totalSpent,
        'transactions': transactions.map((e) => e.toJson()).toList(),
        'rewards': rewards.map((e) => e.toJson()).toList(),
      };
}

enum TransactionType {
  earned,
  spent;

  String get label => switch (this) {
        TransactionType.earned => 'Đã nhận',
        TransactionType.spent => 'Đã chi tiêu',
      };
}

/// Token transaction history entry
class TokenTransaction {
  const TokenTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.description,
    required this.createdAt,
  });

  final String id;
  final TransactionType type;
  final int amount;
  final String description;
  final DateTime createdAt;

  bool get isEarned => type == TransactionType.earned;

  factory TokenTransaction.fromJson(Map<String, dynamic> json) {
    return TokenTransaction(
      id: json['id'] as String,
      type: json['type'] == 'earned'
          ? TransactionType.earned
          : TransactionType.spent,
      amount: json['amount'] as int,
      description: json['description'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type.name,
        'amount': amount,
        'description': description,
        'created_at': createdAt.toIso8601String(),
      };
}

/// Reward item in LearnToken shop
class TokenReward {
  const TokenReward({
    required this.id,
    required this.title,
    required this.price,
    this.description,
    this.imageUrl,
    this.stock,
    this.requiredRank,
  });

  final String id;
  final String title;
  final int price;
  final String? description;
  final String? imageUrl;
  final int? stock;
  final int? requiredRank;

  bool get isAvailable => stock == null || stock! > 0;

  factory TokenReward.fromJson(Map<String, dynamic> json) {
    return TokenReward(
      id: json['id'] as String,
      title: json['title'] as String,
      price: json['price'] as int,
      description: json['description'] as String?,
      imageUrl: json['image_url'] as String?,
      stock: json['stock'] as int?,
      requiredRank: json['required_rank'] as int?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'price': price,
        'description': description,
        'image_url': imageUrl,
        'stock': stock,
        'required_rank': requiredRank,
      };
}

/// User model
class User {
  const User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.mssv,
    this.avatarUrl,
    this.phone,
    this.faculty,
    this.learnTokenBalance = 0,
    this.rank,
  });

  final String id;
  final String email;
  final String name;
  final UserRole role;
  final String? mssv;
  final String? avatarUrl;
  final String? phone;
  final String? faculty;
  final int learnTokenBalance;
  final int? rank;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      role: UserRole.fromString(json['role'] as String?),
      mssv: json['mssv'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      phone: json['phone'] as String?,
      faculty: json['faculty'] as String?,
      learnTokenBalance: json['learn_token_balance'] as int? ?? 0,
      rank: json['rank'] as int?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'role': role.name,
        'mssv': mssv,
        'avatar_url': avatarUrl,
        'phone': phone,
        'faculty': faculty,
        'learn_token_balance': learnTokenBalance,
        'rank': rank,
      };

  User copyWith({
    String? id,
    String? email,
    String? name,
    UserRole? role,
    String? mssv,
    String? avatarUrl,
    String? phone,
    String? faculty,
    int? learnTokenBalance,
    int? rank,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      role: role ?? this.role,
      mssv: mssv ?? this.mssv,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      phone: phone ?? this.phone,
      faculty: faculty ?? this.faculty,
      learnTokenBalance: learnTokenBalance ?? this.learnTokenBalance,
      rank: rank ?? this.rank,
    );
  }
}

/// User roles in the system
enum UserRole {
  candidate,
  admin,
  proctor;

  String get displayName => switch (this) {
        UserRole.candidate => 'Thí sinh',
        UserRole.admin => 'Quản trị viên',
        UserRole.proctor => 'Giám thị',
      };

  static UserRole fromString(String? value) => switch (value) {
        'admin' => UserRole.admin,
        'proctor' => UserRole.proctor,
        _ => UserRole.candidate,
      };
}

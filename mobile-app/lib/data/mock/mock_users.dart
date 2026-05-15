/// Mock user data
class MockUser {
  const MockUser({
    required this.id,
    required this.email,
    required this.name,
    required this.mssv,
    required this.faculty,
    required this.role,
    this.avatarUrl,
    this.phone,
    this.learnTokenBalance = 0,
    this.rank,
  });

  final String id;
  final String email;
  final String name;
  final String mssv;
  final String faculty;
  final UserRole role;
  final String? avatarUrl;
  final String? phone;
  final int learnTokenBalance;
  final int? rank;
}

enum UserRole { candidate, admin, proctor }

final List<MockUser> mockUsers = [
  const MockUser(
    id: 'user_001',
    email: 'khoi.nm214532@sis.hust.edu.vn',
    name: 'Nguyễn Minh Khôi',
    mssv: '20214532',
    faculty: 'Trường Công nghệ Thông tin và Truyền thông',
    role: UserRole.candidate,
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    learnTokenBalance: 1250,
    rank: 142,
  ),
  const MockUser(
    id: 'user_002',
    email: 'admin@academicluminary.edu.vn',
    name: 'Trần Văn Admin',
    mssv: 'admin_001',
    faculty: 'Phòng Kế hoạch Tổng hợp',
    role: UserRole.admin,
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    learnTokenBalance: 0,
  ),
  const MockUser(
    id: 'user_003',
    email: 'proctor@academicluminary.edu.vn',
    name: 'Lê Thị Giám thị',
    mssv: 'proctor_001',
    faculty: 'Trường Công nghệ Thông tin và Truyền thông',
    role: UserRole.proctor,
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    learnTokenBalance: 0,
  ),
  const MockUser(
    id: 'user_004',
    email: 'sarah.j@sis.hust.edu.vn',
    name: 'Sarah Jenkins',
    mssv: '20214533',
    faculty: 'Trường Ngoại ngữ',
    role: UserRole.candidate,
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    learnTokenBalance: 890,
    rank: 456,
  ),
  const MockUser(
    id: 'user_005',
    email: 'david.c@sis.hust.edu.vn',
    name: 'David Chen',
    mssv: '20214534',
    faculty: 'Trường Kinh tế',
    role: UserRole.candidate,
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    learnTokenBalance: 2100,
    rank: 89,
  ),
];

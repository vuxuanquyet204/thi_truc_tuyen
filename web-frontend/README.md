# 🎓 NCKH Online Examination System

> Hệ thống thi trực tuyến hiện đại với giám sát camera AI và xác thực blockchain

[![React](https://img.shields.io/badge/React-18.3.1-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.9-646cff?logo=vite)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.9.0-764abc?logo=redux)](https://redux-toolkit.js.org/)

## ✨ Tính năng nổi bật

### 🎓 Hệ thống thi trực tuyến
- 🎥 **Giám sát camera AI thời gian thực** - Phát hiện gian lận bằng AI
- ⏱️ **Quản lý thời gian thông minh** - Đồng hồ đếm ngược và cảnh báo
- 🔒 **Bảo mật cao** - Chống gian lận với nhiều lớp bảo mật + Blockchain
- 📊 **Dashboard trực quan** - Theo dõi tiến độ và kết quả
- 💾 **Auto-save** - Tự động lưu câu trả lời mỗi 30 giây
- 🚨 **Violation Alerts** - Cảnh báo vi phạm với auto-stop exam

### 🛠️ Admin Panel chuyên nghiệp (13 pages)
- 👥 **Quản lý người dùng** - CRUD đầy đủ + Excel import/export
- 📝 **Quản lý bài thi** - 10 tính năng: tạo, sửa, sao chép, sinh đề ngẫu nhiên, Excel
- 🎯 **Giám sát real-time** - Proctoring dashboard với 13 loại vi phạm
- 🔐 **Bảo mật & Blockchain** - Dashboard 4 module blockchain
- 🎁 **Hệ thống thưởng** - Quản lý token ERC-20 và reward store
- 📄 **Bản quyền tài liệu** - Đăng ký và bảo vệ bản quyền trên blockchain

### 🔗 Blockchain & Token System
- 🪙 **Token ERC-20** - Smart contract LearnToken với thưởng tự động
- 💰 **Ví đa chữ ký** - Bảo mật cao cho giao dịch
- 🏪 **Reward Store** - Đổi token lấy khóa học và quà tặng (50+ items)
- 🏦 **Rút tiền** - Chuyển token về 19 ngân hàng Việt Nam
- 🛡️ **Copyright Registry** - Smart contract bảo vệ bản quyền tài liệu

### 🎨 Giao diện & Trải nghiệm
- 🎨 **Giao diện hiện đại** - Dark/Light theme với Glassmorphism
- 📱 **Responsive design** - Hoạt động mượt mà trên mọi thiết bị
- ⚡ **Performance tối ưu** - React.memo, useMemo, useCallback (75% improvement)
- ♿ **Accessibility** - ARIA labels và keyboard navigation

## 🚀 Bắt đầu nhanh

### Yêu cầu hệ thống
- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Camera** (để sử dụng tính năng giám sát)
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+
- **MetaMask** (để sử dụng blockchain features)

### Cài đặt Frontend

```bash
# Clone repository
git clone https://github.com/vutong-coder/hoc_onl.git
cd hoc_onl/web-frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Mở trình duyệt và truy cập: `http://localhost:5173`

### Cài đặt Backend Services

#### Proctoring Service (Node.js + Python AI)

```bash
cd Code-spark/services/proctoring-service

# Windows
start-all.bat

# Linux/Mac
chmod +x start-all.sh
./start-all.sh
```

Services sẽ chạy trên:
- **Python AI Service**: http://localhost:8000
- **Node.js Backend**: http://localhost:8082

### Deploy Smart Contracts

```bash
# Di chuyển vào thư mục contracts
cd contracts

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env

# Cấu hình .env với API keys
# - SEPOLIA_RPC_URL (Infura/Alchemy)
# - PRIVATE_KEY (MetaMask private key)
# - ETHERSCAN_API_KEY

# Deploy lên Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Verify contract trên Etherscan
npx hardhat run scripts/verify.js --network sepolia
```

### Cấu hình Frontend với Smart Contract

```bash
# Thêm contract addresses vào .env
echo "VITE_LEARN_TOKEN_ADDRESS=0xYourContractAddress" >> .env
echo "VITE_COPYRIGHT_REGISTRY_ADDRESS=0xYourContractAddress" >> .env

# Restart dev server
npm run dev
```

### Build cho production

```bash
# Build project
npm run build

# Preview production build
npm run preview
```

## 📁 Cấu trúc dự án

```
web-frontend/
├── src/
│   ├── admin/               # 🛠️ Admin Module (13 pages)
│   │   ├── components/      # Admin components
│   │   │   ├── common/      # Reusable components
│   │   │   ├── exams/       # Exam management
│   │   │   ├── proctoring/  # Proctoring dashboard
│   │   │   ├── security/    # Security & blockchain
│   │   │   └── users/       # User management
│   │   ├── pages/           # 13 admin pages
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── styles/          # CSS modules
│   ├── components/          # User Components
│   │   ├── atoms/           # Button, Input, Card...
│   │   ├── molecules/       # ExamQuestion, Timer...
│   │   └── sections/        # Hero, Features...
│   ├── pages/               # User Pages
│   ├── hooks/               # Custom hooks
│   │   ├── useCamera.ts
│   │   ├── useAICameraMonitor.ts
│   │   ├── useFrameStorage.ts
│   │   └── useTokenRewards.ts
│   ├── services/            # API services
│   │   ├── api/             # API clients
│   │   │   ├── proctoringApi.ts
│   │   │   └── tokenApi.ts
│   │   └── blockchain/      # Blockchain services
│   ├── store/               # Redux store
│   └── test/               # Testing setup
├── contracts/               # 🔗 Smart Contracts
│   ├── LearnToken.sol       # ERC-20 Token
│   ├── CopyrightRegistry.sol # Copyright protection
│   └── scripts/             # Deployment scripts
└── public/                  # Public assets
```

## 🎯 Luồng hoạt động hệ thống thi

```
1. Dashboard → Xem danh sách bài thi
2. Click "Start Exam"
3. Pre-Check Page → Kiểm tra camera với AI monitoring
4. Exam Taking Page → Làm bài với:
   - Camera giám sát hiển thị (ProctoringView)
   - AI phân tích ẩn (AICameraMonitor)
   - Auto-save mỗi 30s
   - Screenshot mỗi 10s
   - Violation alerts với countdown 15s
5. Submit hoặc hết giờ
6. Result Page → Hiển thị kết quả và thống kê
```

## 🎥 Hệ thống Camera AI Proctoring

### Dual Camera System

**1. ProctoringView (Camera hiển thị)**
- Hiển thị cho thí sinh thấy camera đang hoạt động
- Kích thước: 352x264px trong sidebar
- Có thể thu nhỏ/phóng to
- Status indicator

**2. AICameraMonitor (Camera phân tích)**
- Ẩn (display: none) - chỉ phân tích
- Tự động bật sau 2 giây
- Phân tích frame để phát hiện vi phạm
- Ghi log lên blockchain

### AI Detection Types

1. **FACE_NOT_DETECTED** - Không phát hiện khuôn mặt
2. **MULTIPLE_FACES** - Nhiều người trong frame
3. **MOBILE_PHONE_DETECTED** - Phát hiện điện thoại
4. **CAMERA_TAMPERED** - Camera bị che (phân tích độ sáng)
5. **LOOKING_AWAY** - Nhìn ra khỏi màn hình
6. **TAB_SWITCH** - Chuyển tab/cửa sổ

### Violation Alert System

- **Severity Levels**: Low, Medium, High, Critical
- **Alert Modal**: Hiển thị khi phát hiện vi phạm
- **Countdown Timer**: 15 giây với progress bar
- **Auto-stop Exam**: Tự động dừng nếu không phản hồi
- **Blockchain Logging**: Ghi vi phạm lên blockchain

### Frame Storage System

- Lưu trữ frames (base64) và AI responses
- Tính toán statistics (violation types, severity counts)
- Auto cleanup old data
- Export data as JSON
- Storage size tracking

## 🛠️ Admin Module Chi Tiết

### 📝 Quản lý Bài Thi (10 tính năng)

1. **➕ Thêm đề thi** - Form 14 trường với validation
2. **✏️ Chỉnh sửa** - Pre-filled form với auto-calculation
3. **📋 Sao chép** - Duplicate với 1 click
4. **🗑️ Xóa** - Confirmation modal
5. **👁️ Xem chi tiết** - Full information modal
6. **🔀 Sinh đề ngẫu nhiên** - 4 modes độ khó:
   - Mixed Auto (40-40-20)
   - Mixed Custom (tùy chỉnh phân bổ)
   - Easy/Medium/Hard only
7. **⬆️ Nhập từ Excel** - Import với preview và validation
8. **⬇️ Xuất Excel** - Export 19 columns với Vietnamese labels
9. **🔍 Tìm kiếm & Lọc** - 4 filters kết hợp
10. **📄 Phân trang** - 10 items/trang với navigation

### 🎯 Giám sát Real-time (Proctoring Dashboard)

- **Live Stats**: Active sessions, high-risk sessions, violations
- **Session Cards**: Hiển thị 6 metrics:
  - User info + Exam title
  - Risk level badge
  - Camera/Audio status
  - Connection status
  - Face detection count
  - Violations count
- **Detail Modal**: Video stream area, stats grid, event log
- **Violation Tracking**: 13 loại vi phạm với 4 severity levels
- **Admin Actions**: Send warning, terminate session
- **Auto-refresh**: Every 3-5 seconds

### 🔐 Bảo mật & Blockchain

**4 Blockchain Modules:**
1. **Anti-cheat** (Ethereum) - Immutable exam records
2. **Copyright Protection** (Ethereum) - Document hash registry
3. **Token Rewards** (Polygon) - Low-cost token distribution
4. **Multisig Wallet** (Ethereum) - Enhanced security

**Dashboard Features:**
- Module status monitoring
- Real-time transactions tracking
- Security alerts (8 types, 4 severity levels)
- Activity log (8 activity types)
- Performance metrics

### 📄 Bản quyền Tài liệu

**Tính năng:**
- Đăng ký tài liệu mới (file hoặc text)
- Upload với metadata đầy đủ
- Blockchain hash registration
- Tìm kiếm và lọc tài liệu
- Xác minh tài liệu
- Quản lý tranh chấp
- Thống kê và báo cáo
- Export dữ liệu (Excel, CSV, JSON)

**Smart Contract:** CopyrightRegistry.sol
- SHA-256 hash storage
- Timestamp verification
- Access control
- IPFS support

## 🔗 API Integration

### Backend Services Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      WEB FRONTEND                            │
│                    (React + Redux)                           │
└─────────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│   exam-service   │          │online_exam_service│
│  (Java Spring)   │          │   (Node.js)       │
│   Port: 9005     │          │   Port: 3000      │
└──────────────────┘          └──────────────────┘
        │                               │
        ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│   PostgreSQL     │          │   PostgreSQL     │
│   Port: 5433     │          │   Port: 5432     │
│   exam_db        │          │ online_exam_db   │
└──────────────────┘          └──────────────────┘
```

### Exam Service Integration (Admin)

**Backend:** `exam-service` (Java Spring Boot, port 9005)

**API Endpoints:**
- `POST /exams` - Create exam
- `GET /exams/{id}` - Get exam
- `PUT /exams/{id}/config` - Update exam config
- `DELETE /exams/{id}` - Delete exam
- `POST /exams/{id}/schedule` - Schedule exam
- `POST /exams/{id}/generate-questions` - Generate questions
- `GET /exams/schedules` - Get all exams

**Files:**
- `src/services/api/examApi.ts` - Main Exam API
- `src/admin/services/examApi.ts` - Admin Exam API
- `src/admin/hooks/useExams.ts` - Uses real API

**Status:** ✅ **COMPLETE** - All CRUD operations integrated, mock data removed

### Online Exam Service Integration (User)

**Backend:** `online_exam_service` (Node.js Express, port 3000)

**API Endpoints:**
- `GET /api/quizzes` - Get all quizzes (published only)
- `POST /api/quizzes/:quizId/start` - Start exam
- `POST /api/submissions/:submissionId/submit` - Submit exam
- `GET /api/quizzes/:quizId` - Get quiz details
- `GET /api/submissions/:submissionId/result` - Get result

**Files:**
- `src/services/api/onlineExamApi.ts` - Online Exam API
- `src/services/examService.ts` - Exam business logic
- `src/pages/ExamPage.tsx` - Exam list page

**Status:** ✅ **COMPLETE** - All user exam features integrated

### Course Service Integration

**Backend:** `course-service` (Java Spring Boot, port 9001)

**API Endpoints:**
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `GET /api/courses/{id}` - Get course details
- `PUT /api/courses/{id}` - Update course

**Status:** ✅ **COMPLETE**

### Token Reward Service Integration

**Backend:** `token-reward-service` (Node.js, port 3000)

**API Endpoints:**
- `POST /api/tokens/grant` - Grant tokens
- `POST /api/tokens/spend` - Spend tokens
- `GET /api/tokens/balance/:studentId` - Get balance
- `GET /api/tokens/history/:studentId` - Get history

**Status:** ✅ **COMPLETE**

### Proctoring API

**Endpoints:**
```
GET    /api/proctoring/sessions              # Lấy tất cả sessions
GET    /api/proctoring/sessions/:id          # Chi tiết session
POST   /api/proctoring/sessions/:id/terminate # Dừng session
GET    /api/sessions/:id/events              # Lấy events của session
PATCH  /api/proctoring/events/:id/review     # Đánh dấu đã xử lý
GET    /api/proctoring/events/:id/media      # Lấy screenshots
POST   /api/proctoring/analyze-frame         # Phân tích frame AI
```

**Data Flow:**
```
Frontend → proctoringApi.ts → Backend API (8082) → Python AI (8000) → PostgreSQL
```

### Copyright API

**Endpoints:**
```
POST   /api/copyright/register              # Đăng ký tài liệu
POST   /api/copyright/register-text         # Đăng ký văn bản
POST   /api/copyright/verify/:hash          # Xác minh tài liệu
GET    /api/copyright/document/:hash        # Thông tin tài liệu
POST   /api/copyright/search                # Tìm kiếm
GET    /api/copyright/statistics            # Thống kê
```

## 🪙 Token System ERC-20

### Smart Contract Features

```solidity
contract LearnToken is ERC20, Ownable, Pausable {
    // Auto-reward functions
    function awardLessonCompletion(address user)      // 10 tokens
    function awardExamPass(address user, uint256 score) // 50 tokens
    function awardDailyStreak(address user)           // 5 tokens/day
    function awardCertification(address user)         // 200 tokens
    function awardContestWin(address user, uint256 rank) // 500 tokens
    
    // Security
    function pause() external onlyOwner
    function addMinter(address minter) external onlyOwner
}
```

### Reward Store (50+ items)

- **Courses**: Python, React/Node, Data Science, Mobile App
- **Vouchers**: Shopee, Grab Food, Lazada, Starbucks, CGV
- **Electronics**: Tai nghe, chuột gaming, webcam, loa
- **Physical**: Áo thun, balo, bình nước, sổ tay

### Bank Integration

- 19 ngân hàng Việt Nam
- Minimum withdrawal: 100 tokens
- Transaction fee: 2%
- Processing time: 1-3 ngày

## 🧪 Testing

### Test Setup

**Vitest 3.2.4** - Fast unit testing framework
- React Testing Library
- Jest DOM matchers
- 28 tests passing (100%)

**Test Coverage:**
- Button Component (10 tests)
- ExamNavigation Component (9 tests)
- useCamera Hook (9 tests)

**Run Tests:**
```bash
npm test                    # Run all tests
npm run test:ui            # Run với UI
npm run test:coverage      # Coverage report
```

## 🎨 Design System

### Colors (OKLCH)
- Primary: `oklch(0.65 0.25 30)` - Orange
- Success: `oklch(0.70 0.20 140)` - Green
- Error: `oklch(0.60 0.25 20)` - Red
- Warning: `oklch(0.75 0.20 80)` - Yellow

### Typography
- Display: Poppins
- Body: Inter
- Mono: JetBrains Mono

## 📊 Performance Optimization

### Metrics
- **Button re-renders**: ↓ 75% (từ 50-60 → 10-15)
- **ExamQuestion re-renders**: ↓ 50% (từ 30-40 → 15-20)
- **Bundle size**: 617.71 KB

### Techniques
- React.memo cho components
- useMemo cho expensive calculations
- useCallback cho stable references
- Code splitting & lazy loading

## 🔧 Scripts

```bash
npm run dev            # Development server
npm run build          # Production build
npm run preview        # Preview build
npm test               # Run tests
npm run lint           # Lint code
```

## 📖 Hướng dẫn sử dụng

### Cho học sinh
1. Đăng ký/Đăng nhập
2. Xem danh sách bài thi
3. Pre-check camera
4. Làm bài thi (có AI monitoring)
5. Xem kết quả

### Cho admin
1. Truy cập `/admin/dashboard`
2. Quản lý users, exams, proctoring
3. Giám sát real-time violations
4. Quản lý blockchain modules

## 🐛 Bug Fixes & Features

### Bug Fixes

#### 1. Exam Creation Button Not Working
**Issue:** "Thêm đề thi" button không hoạt động khi click  
**Fix:** Fixed form selection logic in `AddExamModal.tsx` - use `document.querySelector()` instead of `.closest()` to find form element  
**Files:** `src/admin/modal/Exams/AddExamModal.tsx`, `src/admin/modal/Exams/EditExamModal.tsx`  
**Status:** ✅ Fixed

#### 2. Empty Options Array in Questions
**Issue:** Questions imported from exam-service had empty options  
**Fix:** Extract options from JSONB `content.options` in mapper  
**Files:** `src/mappers/quiz.mapper.js`  
**Status:** ✅ Fixed

#### 3. Grading Returns 0 Points
**Issue:** Students scored 0 even when answering correctly  
**Fix:** Extract `correctAnswer` from JSONB `content.correctAnswer` in grading service  
**Files:** `src/services/grading.service.js`  
**Status:** ✅ Fixed

### New Features

#### 1. Generate Questions for Existing Exams
**Feature:** Generate random questions for existing exams (not just new exams)  
**Components:** `GenerateQuestionsModal.tsx`  
**Features:**
- Select exam from list with search/filter
- Configure difficulty (easy/medium/hard/mixed)
- Custom distribution for mixed difficulty
- Validation for custom distribution
**Status:** ✅ Complete

#### 2. Exam Subjects from API
**Feature:** Load subjects dynamically from question tags instead of hardcode  
**Implementation:** `getAllSubjects()` function extracts unique tags from questions  
**Fallback:** Default subjects list if API fails  
**Status:** ✅ Complete

#### 3. Published Exams Filter
**Feature:** Only show exams with status = 'PUBLISHED' to students  
**Implementation:** Backend filter in `online_exam_service`  
**Status:** ✅ Complete

## 🔍 Troubleshooting

### Camera không hoạt động
- Kiểm tra quyền browser
- Đảm bảo HTTPS/localhost
- Không có app khác dùng camera

### Lỗi kết nối backend
- Kiểm tra services đang chạy
- Xem console logs
- Clear cache và reload

### MetaMask không kết nối
- Cài đặt extension
- Kiểm tra network (Sepolia cho testnet)
- Refresh page

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết chi tiết.

---

<div align="center">
  <strong>🎓 NCKH Online Examination System</strong>
  <br>
  <em>Modern, Secure, Blockchain-Powered</em>
  <br><br>
  <strong>Made with ❤️ using React + TypeScript + Blockchain</strong>
  <br>
  <sub>© 2024 NCKH Online Examination System - Production Ready ✅</sub>
</div>
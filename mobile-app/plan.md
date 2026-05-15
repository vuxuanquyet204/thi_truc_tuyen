# KẾ HOẠCH CHI TIẾT: XÂY DỰNG MOBILE APP FLUTTER — ACADEMIC LUMINARY

> Phiên bản: 1.0.0 | Ngày: 2026-04-13 | Trạng thái: Đang thực hiện

---

## PHẦN I: TỔNG QUAN HỆ THỐNG

### 1.1. Tên dự án
**Academic Luminary** — Nền tảng thi cử thông minh với AI proctoring và hệ thống LearnToken.

### 1.2. Vai trò người dùng

| Vai trò | Người dùng | Mô tả |
|---------|------------|-------|
| **Candidate** | Thí sinh / Sinh viên | Thi cử, xem kết quả, quản lý LearnToken |
| **Admin** | Quản trị viên / Giám thị | Giám sát phòng thi, phân tích hệ thống |

### 1.3. Màn hình cần xây dựng

#### Candidate (8 màn hình)
1. **Home** — Thông báo thi sắp tới, thống kê, LearnToken, chứng chỉ, lịch thi
2. **Exam List** — Ongoing / Upcoming / Completed, exam details panel
3. **Exam Session** — Làm bài thi (timer, câu hỏi, navigation)
4. **Results List** — Danh sách kết quả
5. **Result Detail** — Điểm số, radar chart, insight, career path
6. **Profile** — Avatar, stats, nhóm cài đặt
7. **Edit Profile** — Form chỉnh sửa hồ sơ
8. **LearnToken** — Balance, rewards shop, transaction history

#### Admin (2 màn hình)
1. **Admin Dashboard** — Bento grid stats, biểu đồ phân bố, activity feed, LearnToken economy
2. **Proctoring Monitor** — Grid camera, session cards với trạng thái NORMAL/WARNING/FLAGGED

#### Auth (2 màn hình)
1. **Login** — Email/SIS login
2. **OTP** — Xác thực OTP 6 số, timer, resend

---

## PHẦN II: DESIGN SYSTEM — ACADEMIC LUMINARY

### 2.1. Nguyên tắc thiết kế cốt lõi

```
1. NO SOLID BORDERS — Ngăn cách bằng surface color shifts, không dùng border 1px
2. GLASS & GRADIENT — Hero: gradient primary→primary_container 135°
3. TONAL LAYERING — Tạo depth bằng nested surface-container tiers
4. AMBIENT SHADOWS — Floating: 0 12px 40px rgba(7,30,39,0.06)
5. GHOST BORDER — Chỉ khi bắt buộc: outline_variant @ 15% opacity
6. PROGRESS RIBBON — 4px ribbon ở top viewport, màu secondary
7. EDITORIAL TYPOGRAPHY — Manrope cho headline (≥24px), Inter cho body
```

### 2.2. Color Palette

| Token | Hex | Mô tả |
|-------|-----|-------|
| `primary` | #003178 | Deep Blue - trust, authority |
| `primaryContainer` | #0d47a1 | |
| `surface` | #f3faff | Background base |
| `surfaceContainerLow` | #e6f6ff | Secondary area |
| `surfaceContainerHigh` | #d5ecf8 | Active component |
| `surfaceContainerHighest` | #cfe6f2 | Navigation tint |
| `surfaceContainerLowest` | #ffffff | Floating elements |
| `onSurface` | #071e27 | Text (KHÔNG dùng pure black) |
| `secondary` | #006a6a | Achievement Teal |
| `tertiaryFixedDim` | #fabd00 | LearnToken Gold |
| `onTertiaryFixedVariant` | #5b4300 | Gold text |
| `error` | #ba1a1a | Error state |
| `outlineVariant` | #c3c6d4 | Ghost border (15% opacity) |

### 2.3. Typography

| Font | Trọng lượng | Dùng cho |
|------|-------------|----------|
| **Manrope** | 700, 800 | Headlines, Display, Platform headers, Card headings |
| **Inter** | 400, 500, 600 | Body text, Labels, Navigation, Buttons |

Letter-spacing: `-0.02em` cho headline-lg và display.

### 2.4. Component Patterns

**Button Variants:**
- `primary`: bg=primary, text=white, pill (full radius), no shadow
- `secondary`: bg=secondaryContainer, text=onSecondaryContainer
- `achievement`: bg=tertiaryFixedDim (#fabd00), text=onTertiaryFixed — DÙNG CHO "Claim Reward", "Start Exam"

**Cards:**
- NO divider lines — separate bằng 48px whitespace hoặc shift surface color
- Candidate: `xl` radius (12px), Admin: `md` radius (8px)
- Shadow: `0 12px 40px rgba(7,30,39,0.06)` (ambient shadow, không dùng hard shadow)

**Proctoring Status:**
- `NORMAL`: secondary (#006a6a) glow 8px blur
- `WARNING`: tertiaryFixedDim background
- `FLAGGED`: error (#ba1a1a) pulse animation + error container wash

**Progress Ribbon:** 4px, màu secondary, ở top viewport, glow effect.

**Bottom Nav:** Glassmorphism — bg=white/20, backdrop-blur 16px, rounded-top-3xl.

---

## PHẦN III: CẤU TRÚC THƯ MỤC

```
mobile-app/
├── pubspec.yaml
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── config/
│   │   │   ├── app_config.dart
│   │   │   └── api_endpoints.dart
│   │   ├── constants/
│   │   │   ├── app_constants.dart
│   │   │   └── storage_keys.dart
│   │   ├── theme/
│   │   │   ├── app_colors.dart
│   │   │   ├── app_typography.dart
│   │   │   ├── app_spacing.dart
│   │   │   ├── app_radius.dart
│   │   │   └── app_theme.dart
│   │   ├── types/
│   │   │   ├── user.model.dart
│   │   │   ├── exam.model.dart
│   │   │   ├── question.model.dart
│   │   │   ├── result.model.dart
│   │   │   ├── learn_token.model.dart
│   │   │   ├── certificate.model.dart
│   │   │   ├── proctor_session.model.dart
│   │   │   └── admin_stats.model.dart
│   │   ├── hooks/
│   │   │   ├── use_auth.dart
│   │   │   ├── use_exam_timer.dart
│   │   │   └── use_otp_timer.dart
│   │   ├── utils/
│   │   │   ├── formatters.dart
│   │   │   ├── validators.dart
│   │   │   └── helpers.dart
│   │   └── components/
│   │       ├── al_button.dart
│   │       ├── al_card.dart
│   │       ├── al_text_field.dart
│   │       ├── al_chip.dart
│   │       ├── al_bottom_nav.dart
│   │       ├── al_progress_ribbon.dart
│   │       ├── al_avatar.dart
│   │       ├── al_app_bar.dart
│   │       ├── al_badge.dart
│   │       ├── al_glass_panel.dart
│   │       └── al_stat_card.dart
│   ├── infrastructure/
│   │   ├── http/
│   │   │   ├── http_client.dart
│   │   │   ├── auth_interceptor.dart
│   │   │   └── error_handler.dart
│   │   ├── api/
│   │   │   ├── auth.api.dart
│   │   │   ├── user.api.dart
│   │   │   ├── exam.api.dart
│   │   │   ├── result.api.dart
│   │   │   ├── learn_token.api.dart
│   │   │   ├── proctoring.api.dart
│   │   │   ├── analytics.api.dart
│   │   │   └── admin.api.dart
│   │   ├── storage/
│   │   │   ├── secure_storage.dart
│   │   │   └── local_storage.dart
│   │   └── socket/
│   │       └── proctoring_socket.dart
│   ├── navigation/
│   │   ├── app_router.dart
│   │   ├── routes.dart
│   │   ├── auth_navigator.dart
│   │   ├── candidate_navigator.dart
│   │   ├── admin_navigator.dart
│   │   └── middleware/
│   │       └── auth_guard.dart
│   ├── contexts/
│   │   ├── auth_context.dart
│   │   └── exam_context.dart
│   ├── features/
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── login_screen.dart
│   │   │   │   └── otp_screen.dart
│   │   │   ├── components/
│   │   │   │   ├── otp_input.dart
│   │   │   │   └── otp_timer.dart
│   │   │   └── hooks/
│   │   ├── home/
│   │   │   ├── screens/
│   │   │   │   └── home_screen.dart
│   │   │   ├── components/
│   │   │   │   ├── exam_notification_banner.dart
│   │   │   │   ├── academic_journey_card.dart
│   │   │   │   ├── learn_token_card.dart
│   │   │   │   ├── credential_vault.dart
│   │   │   │   └── upcoming_schedule_list.dart
│   │   │   └── hooks/
│   │   ├── exams/
│   │   │   ├── screens/
│   │   │   │   ├── exam_list_screen.dart
│   │   │   │   ├── exam_detail_screen.dart
│   │   │   │   ├── exam_session_screen.dart
│   │   │   │   └── exam_rules_screen.dart
│   │   │   ├── components/
│   │   │   │   ├── exam_card.dart
│   │   │   │   ├── exam_detail_panel.dart
│   │   │   │   ├── question_view.dart
│   │   │   │   ├── question_navigator.dart
│   │   │   │   ├── exam_timer.dart
│   │   │   │   ├── answer_option.dart
│   │   │   │   └── exam_progress_bar.dart
│   │   │   └── hooks/
│   │   ├── results/
│   │   │   ├── screens/
│   │   │   │   ├── results_list_screen.dart
│   │   │   │   └── result_detail_screen.dart
│   │   │   ├── components/
│   │   │   │   ├── score_glass_card.dart
│   │   │   │   ├── skill_radar_chart.dart
│   │   │   │   ├── proficiency_bar.dart
│   │   │   │   ├── mastery_insight_card.dart
│   │   │   │   └── career_path_grid.dart
│   │   │   └── hooks/
│   │   ├── profile/
│   │   │   ├── screens/
│   │   │   │   ├── profile_screen.dart
│   │   │   │   └── edit_profile_screen.dart
│   │   │   ├── components/
│   │   │   │   ├── profile_header.dart
│   │   │   │   ├── profile_stats_bento.dart
│   │   │   │   ├── settings_group.dart
│   │   │   │   ├── settings_item.dart
│   │   │   │   └── toggle_switch.dart
│   │   │   └── hooks/
│   │   ├── learn_token/
│   │   │   ├── screens/
│   │   │   │   └── learn_token_screen.dart
│   │   │   ├── components/
│   │   │   │   ├── balance_hero_card.dart
│   │   │   │   ├── balance_stats_row.dart
│   │   │   │   ├── reward_card.dart
│   │   │   │   └── transaction_item.dart
│   │   │   └── hooks/
│   │   └── admin/
│   │       ├── screens/
│   │       │   ├── admin_dashboard_screen.dart
│   │       │   └── proctoring_monitor_screen.dart
│   │       ├── components/
│   │       │   ├── admin_sidebar.dart
│   │       │   ├── bento_stats_card.dart
│   │       │   ├── distribution_chart.dart
│   │       │   ├── activity_feed.dart
│   │       │   ├── learn_token_economy.dart
│   │       │   ├── session_card.dart
│   │       │   ├── session_status_chip.dart
│   │       │   └── camera_thumbnail.dart
│   │       └── hooks/
│   └── data/
│       └── mock/
│           ├── mock_exams.dart
│           ├── mock_users.dart
│           ├── mock_results.dart
│           ├── mock_tokens.dart
│           └── mock_proctoring.dart
├── assets/
│   ├── fonts/
│   │   ├── Manrope/
│   │   └── Inter/
│   └── images/
│       ├── logo.svg
│       └── placeholders/
└── test/
```

---

## PHẦN IV: GIAI ĐOẠN THỰC HIỆN

### TUẦN 1: Project Setup & Design System Foundation

#### 1.1. Flutter Project Initialization
- `flutter create --org com.academicluminary --project_name academic_luminary`
- Setup pubspec.yaml với dependencies
- Cài đặt fonts Manrope + Inter vào assets

#### 1.2. Design System
- `core/theme/app_colors.dart` — Tất cả màu từ palette, không hardcode
- `core/theme/app_typography.dart` — Manrope + Inter text theme
- `core/theme/app_spacing.dart` — Spacing scale (4, 8, 12, 16, 24, 32, 48...)
- `core/theme/app_radius.dart` — Border radius scale
- `core/theme/app_theme.dart` — LightThemeData builder

#### 1.3. Core Primitives (7 files)
- `al_button.dart` — Primary / Secondary / Achievement variants
- `al_card.dart` — Bento card, no borders
- `al_text_field.dart` — Input field với icon support
- `al_chip.dart` — Status chips
- `al_bottom_nav.dart` — Glassmorphism nav bar
- `al_progress_ribbon.dart` — 4px top ribbon
- `al_glass_panel.dart` — Glassmorphism container

#### 1.4. Infrastructure Base
- `infrastructure/http/http_client.dart` — Dio instance
- `infrastructure/storage/secure_storage.dart` — Token storage
- `navigation/app_router.dart` — GoRouter setup
- `contexts/auth_context.dart` — User, token, role provider

### TUẦN 2: Authentication

#### 2.1. Login Screen
- Email input + Continue button
- Loading state, error handling

#### 2.2. OTP Screen
- `otp_input.dart` — 6-digit input với auto-advance, paste support
- `otp_timer.dart` — Countdown timer với resend
- Verify OTP → store token → navigate

### TUẦN 3: Candidate Core

#### 3.1. Home Screen
- Exam notification banner (gradient hero)
- Academic journey card (stats bento)
- LearnToken card (gold achievement)
- Credential vault (horizontal scroll)
- Upcoming schedule list (asymmetric)

#### 3.2. Exam List Screen
- Ongoing section (pulsing dot)
- Upcoming section (2-column grid)
- Completed section (list)
- Exam detail panel (glass, sticky)

#### 3.3. Exam Session Screen
- Full screen (no nav bar)
- Timer countdown
- Question display + answer options
- Question navigator grid
- Progress bar

### TUẦN 4: Candidate Detail

#### 4.1. Results
- Results list screen
- Result detail: score glass card, radar chart, mastery insight, career path grid

#### 4.2. Profile
- Profile screen: avatar, stats, settings groups
- Edit profile screen: form fields

#### 4.3. LearnToken
- Balance hero card (gradient)
- Stats row
- Rewards shop (grid)
- Transaction history (list)

### TUẦN 5: Admin Module

#### 5.1. Admin Dashboard
- Admin sidebar (drawer)
- Bento stats cards
- Distribution bar chart
- Activity feed
- LearnToken economy section

#### 5.2. Proctoring Monitor
- Session card grid
- Status system (NORMAL/WARNING/FLAGGED)
- Camera thumbnails
- Filter bar
- Pagination

### TUẦN 6: Polish & Integration

- Mock data đầy đủ cho tất cả features
- API integration (thực tế khi backend ready)
- Performance optimization
- Final UI polish

---

## PHẦN V: CÔNG NGHỆ SỬ DỤNG

| Thư viện | Version | Mục đích |
|----------|---------|----------|
| `flutter` | SDK >=3.0 | Framework |
| `google_fonts` | ^6.1.0 | Manrope + Inter fonts |
| `go_router` | ^13.0.0 | Navigation |
| `dio` | ^5.4.0 | HTTP client |
| `flutter_secure_storage` | ^9.0.0 | Token storage |
| `provider` | ^6.1.0 | State management |
| `shared_preferences` | ^2.2.0 | Local preferences |
| `fl_chart` | ^0.66.0 | Radar chart, bar charts |
| `shimmer` | ^3.0.0 | Loading states |
| `cached_network_image` | ^3.3.0 | Image caching |
| `flutter_svg` | ^2.0.0 | SVG icons |

---

## PHẦN VI: CHECKLIST CHẤT LƯỢNG

- [ ] Tất cả màu sắc từ `AppColors`, không hardcode hex trong widgets
- [ ] Manrope cho headline-lg (≥24px), Inter cho body
- [ ] Không có border 1px solid trong UI
- [ ] Progress ribbon 4px secondary ở top
- [ ] Bottom nav: glassmorphism, backdrop-blur, rounded-top-3xl
- [ ] Pill buttons cho primary/secondary/achievement
- [ ] Gold (tertiaryFixedDim) CHỈ dùng cho LearnToken
- [ ] Card hover effects với surface color transitions
- [ ] OTP: auto-advance, paste, shake on error, timer countdown
- [ ] Radar chart cho results screen
- [ ] Admin sidebar: active item border-left-4 + surface tint

---

## PHẦN VII: GHI CHÚ TRIỂN KHAI

### Phase 1: Chỉ làm Candidate + Auth (TUẦN 1-4)
Admin module sẽ triển khai sau khi backend admin API sẵn sàng.

### Mock Data
Tất cả features sẽ sử dụng mock data trước, API integration thực hiện sau.

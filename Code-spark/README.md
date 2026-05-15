# CodeSpark - Nền tảng Microservices cho E-Learning

Một hệ thống microservices hoàn chỉnh được xây dựng bằng Spring Boot 3, phục vụ như nền tảng học tập trực tuyến (e-learning platform) tích hợp blockchain cho bảo vệ bản quyền và hệ thống phần thưởng token.

## Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc](#kiến-trúc)
- [Services](#services)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cách chạy](#cách-chạy)
- [API Endpoints](#api-endpoints)
- [Cấu hình](#cấu-hình)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)

---

## Tổng quan

**CodeSpark** là một nền tảng e-learning đa service với các tính năng:

- **Authentication đa yếu tố** - JWT + OAuth2 + WebAuthn (Yubikey)
- **AI Essay Scoring** - Chấm điểm essay tự động bằng Spring AI + OpenRouter
- **Blockchain Copyright** - Đăng ký bản quyền trên Ethereum (Ganache)
- **Real-time Proctoring** - Giám sát thi trực tuyến qua WebSocket
- **Token Rewards** - Hệ thống phần thưởng tích hợp multisig wallet

### Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Spring Boot 3.3.0 |
| Language | Java 21 |
| Build | Maven 3.6+ |
| Service Discovery | Netflix Eureka |
| API Gateway | Spring Cloud Gateway |
| Database | PostgreSQL 17 + MongoDB 7 |
| Cache | Redis 7 |
| Message Broker | Apache Kafka |
| Monitoring | Prometheus + Grafana |
| Blockchain | Ganache (Ethereum) |
| AI | Spring AI 1.0.0-M4 |

---

## Kiến trúc

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                     │
│              (Web Frontend, Mobile App, API Clients)                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (8080)                            │
│              Routing • Auth • Rate Limiting • CORS                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────┬───────────┬───────────┬───────────┬─────────────┐
        ▼           ▼           ▼           ▼           ▼             ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐
   │Identity │ │ Course  │ │  Exam   │ │ Profile │ │  File   │ │Analytics  │
   │Service  │ │ Service │ │ Service │ │ Service │ │ Service │ │ Service   │
   │ (9000)  │ │ (9001)  │ │ (9005)  │ │ (9002)  │ │ (9003)  │ │  (9004)   │
   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────────┘
        │           │           │           │           │             │
        └───────────┴───────────┴───────────┴───────────┴─────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         KAFKA (9092)                                 │
│              exam-submissions • notifications • analytics            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      NOTIFICATION SERVICE (9009)                     │
│                    Email • Push Notifications                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  DISCOVERY (9999)  │  CONFIG SERVER (8888)  │  POSTGRES (5432)    │
│  Eureka Server     │  Spring Cloud Config    │  5 Databases        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Services

### Infrastructure Services

| Service | Port | Technology | Description |
|---------|------|------------|-------------|
| **Discovery Service** | 9999 | Netflix Eureka Server | Service registry & discovery |
| **Config Server** | 8888 | Spring Cloud Config | Centralized configuration |
| **Prometheus** | 9090 | Prometheus | Metrics collection |
| **Grafana** | 3000 | Grafana | Dashboards & visualization |

### Business Services

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| **API Gateway** | 8080 | - | Routing, auth gateway, rate limiting |
| **Identity Service** | 9000 | identity_db | Authentication, JWT, RBAC, OAuth2, WebAuthn |
| **User Service** | 9010 | identity_db | User management, profile CRUD |
| **Profile Service** | 9002 | profile_db | Extended profiles, certificates, rewards |
| **Course Service** | 9001 | course_db | Courses, materials, quizzes, progress |
| **Exam Service** | 9005 | exam_db | Exams, questions, AI scoring |
| **File Service** | 9003 | - | File upload/download (Cloudinary/S3) |
| **Notification Service** | 9009 | Kafka | Event-driven notifications |
| **Analytics Service** | 9004 | analytics_db | Learning analytics, proctoring events |

### Supporting Services

| Service | Port | Description |
|---------|------|-------------|
| **Common Library** | - | Shared DTOs, exceptions, Feign clients |
| **Copyright Service** | - | Blockchain copyright registration (Ganache) |
| **Token Reward Service** | 3001 | Token rewards with multisig wallet |
| **Multisig Service** | 3003 | Multisig wallet operations |
| **Proctoring Service** | 8082 | Real-time exam proctoring (WebSocket) |

---

## Yêu cầu hệ thống

### Software Requirements

```bash
- Java Development Kit 21+
- Apache Maven 3.6+
- Docker Desktop 4.0+
- Git
```

### Hardware Requirements (Minimum)

```bash
- CPU: 4 cores
- RAM: 8 GB (16 GB recommended)
- Disk: 20 GB free space
```

---

## Cách chạy

### 1. Khởi động Infrastructure (Docker)

```bash
# Di chuyển vào thư mục project
cd d:\code\nckh\Code-spark

# Chạy toàn bộ infrastructure containers
docker-compose up -d

# Hoặc chỉ chạy các container cần thiết (khuyến nghị cho development)
docker-compose up -d postgres-db redis kafka prometheus grafana ganache
```

### 2. Build Project

```bash
# Build toàn bộ project
mvn clean compile

# Chạy tests
mvn clean test

# Package tất cả services
mvn clean package -DskipTests
```

### 3. Khởi động Services

**Quan trọng:** Phải khởi động theo thứ tự để đảm bảo dependency resolution.

```bash
# Thứ tự khởi động:

# 1. Discovery Service (Eureka)
cd services/discovery-service
mvn spring-boot:run
# Truy cập: http://localhost:9999

# 2. Config Server
cd services/config-server
mvn spring-boot:run
# Truy cập: http://localhost:8888

# 3. API Gateway
cd services/api-gateway
mvn spring-boot:run
# Truy cập: http://localhost:8080

# 4. Identity Service (Authentication)
cd services/identity-service
mvn spring-boot:run
# API: http://localhost:9000

# 5. Các services còn lại (có thể chạy song song)
cd services/user-service && mvn spring-boot:run &
cd services/profile-service && mvn spring-boot:run &
cd services/course-service && mvn spring-boot:run &
cd services/exam-service && mvn spring-boot:run &
cd services/file-service && mvn spring-boot:run &
cd services/notification-service && mvn spring-boot:run &
cd services/analytics-service && mvn spring-boot:run &
```

### 4. Tài khoản mặc định

```
Admin: admin@codespark.com / admin123
User:  user@codespark.com  / user123
```

### 5. Truy cập Dashboards

| Service | URL | Credentials |
|---------|-----|-------------|
| API Gateway | http://localhost:8080 | - |
| Eureka Dashboard | http://localhost:9999 | - |
| Swagger UI | http://localhost:8080/swagger-ui.html | - |
| Grafana | http://localhost:3000 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| Grafana Dashboards | Import từ `infra/grafana/` | - |

---

## API Endpoints

### Authentication (`/api/v1/auth`)

```http
POST /api/v1/auth/register    - Đăng ký user mới
POST /api/v1/auth/login       - Đăng nhập (nhận JWT)
POST /api/v1/auth/refresh     - Refresh access token
GET  /api/v1/auth/validate    - Validate JWT token
```

### User Management (`/api/v1/users`)

```http
GET  /api/v1/users/profile     - Lấy thông tin user hiện tại
GET  /api/v1/users/{id}       - Lấy user theo ID
GET  /api/v1/users/           - Danh sách users (ADMIN only)
PUT  /api/v1/users/{id}       - Cập nhật user
PUT  /api/v1/users/{id}/roles - Gán roles (ADMIN only)
DELETE /api/v1/users/{id}     - Xóa user (ADMIN only)
```

### Inter-Service APIs (`/api/v1/inter-service`)

```http
POST /api/v1/inter-service/validate-token        - Validate JWT token
POST /api/v1/inter-service/check-permission      - Kiểm tra permission
POST /api/v1/inter-service/check-role           - Kiểm tra role
POST /api/v1/inter-service/check-any-role        - Kiểm tra nhiều roles
POST /api/v1/inter-service/generate-service-token - Generate service token
```

### Gateway Routes

| Path | Service | Description |
|------|---------|-------------|
| `/identity/**` | identity-service | Auth & user APIs |
| `/user/**` | user-service | User CRUD |
| `/profile/**` | profile-service | Profile APIs |
| `/course/**` | course-service | Course management |
| `/exam/**` | exam-service | Exam management |
| `/files/**` | file-service | File upload/download |
| `/api/copyrights/**` | copyright-service | Blockchain copyright |
| `/api/tokens/**` | token-reward-service | Token operations |
| `/api/v1/notifications/**` | notification-service | Notifications |
| `/analytics/**` | analytics-service | Analytics |
| `/ws/**` | proctoring-service | WebSocket proctoring |
| `/api/v1/multisig/**` | multisig-service | Multisig wallet |

---

## Cấu hình

### Environment Variables

Tạo file `.env` trong thư mục gốc:

```bash
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_password
POSTGRES_PORT=5433

# MongoDB
MONGO_USER=admin
MONGO_PASSWORD=mongo_password

# Redis
REDIS_PORT=6380

# Ethereum
GANACHE_MNEMONIC=your_mnemonic_phrase_here

# JWT
JWT_SECRET=your-very-long-and-secure-jwt-secret-key-min-256-bits

# Eureka
EUREKA_URL=http://localhost:9999/eureka/

# External Services
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

OPENROUTER_API_KEY=your_openrouter_api_key
```

### Database Configuration (PostgreSQL)

```properties
# identity_db - Users, Roles, Permissions
# profile_db  - Profiles, Certificates
# course_db   - Courses, Materials, Progress
# exam_db     - Exams, Questions, Submissions
# analytics_db - Analytics events

spring.datasource.url=jdbc:postgresql://localhost:5433/identity_db
spring.datasource.username=postgres
spring.datasource.password=postgres_password
```

### Kafka Configuration

```properties
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=code-spark-group
```

---

## Development Guidelines

### Thêm Permission mới

```java
// 1. Thêm permission trong DataInitializer
createPermissionIfNotExists("NEW_PERMISSION", "Description", "RESOURCE", "ACTION");

// 2. Gán permission cho roles
role.getPermissions().add(newPermission);

// 3. Sử dụng trong controller
@PreAuthorize("hasAuthority('NEW_PERMISSION')")
```

### Thêm Role mới

```java
// 1. Tạo role trong DataInitializer
Role newRole = createRoleIfNotExists("NEW_ROLE", "Description");

// 2. Gán permissions
newRole.setPermissions(permissionSet);

// 3. Sử dụng trong security
@PreAuthorize("hasRole('NEW_ROLE')")
```

### Thêm Service mới

1. Tạo module trong `services/`
2. Thêm vào parent POM:

```xml
<modules>
    <module>services/new-service</module>
</modules>
```

3. Cấu hình trong API Gateway routes
4. Thêm Feign client trong common-library (nếu cần inter-service call)

### Exception Handling

```java
// Dùng AppException trong Service layer
throw new AppException("Thông báo lỗi", HttpStatus.NOT_FOUND);

// GlobalExceptionHandler tự động xử lý và trả về ApiResponse.error
```

---

## Database Schema

### Identity Service (identity_db)

```
users
├── id (PK)
├── email
├── password (BCrypt)
├── fullName
├── isEnabled
├── createdAt
└── updatedAt

roles
├── id (PK)
├── name
├── description
└── createdAt

permissions
├── id (PK)
├── name
├── resource
├── action
└── description

user_roles (N:N)
├── user_id (FK)
└── role_id (FK)

role_permissions (N:N)
├── role_id (FK)
└── permission_id (FK)
```

### Course Service (course_db)

```
courses
├── id (PK)
├── title
├── description
├── instructorId
├── category
├── difficulty
├── status
└── createdAt

materials
├── id (PK)
├── courseId (FK)
├── title
├── type (VIDEO, PDF, TEXT)
├── url
└── order

quizzes
├── id (PK)
├── courseId (FK)
├── title
└── timeLimit
```

### Exam Service (exam_db)

```
exams
├── id (PK)
├── title
├── courseId (FK)
├── duration (minutes)
├── totalPoints
├── status (DRAFT, PUBLISHED, CLOSED)
└── createdAt

questions
├── id (PK)
├── examId (FK)
├── type (MULTIPLE_CHOICE, ESSAY, CODE)
├── content
├── points
└── correctAnswer (JSON for MCQ)

exam_submissions
├── id (PK)
├── examId (FK)
├── userId
├── score
├── aiScore (for essays)
├── status (IN_PROGRESS, SUBMITTED, GRADED)
└── submittedAt
```

---

## Security

### JWT Configuration

```properties
# Access Token: 24 hours
# Refresh Token: 7 days
jwt.access-token-expiration=86400000
jwt.refresh-token-expiration=604800000
```

### RBAC Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **ADMIN** | Full system access | All permissions |
| **MANAGER** | User & content management | USER_READ, USER_WRITE, COURSE_READ, COURSE_WRITE |
| **USER** | Basic user | COURSE_READ, EXAM_TAKE |

### Default Permissions

```
USER_READ, USER_WRITE, USER_DELETE
ROLE_READ, ROLE_WRITE, ROLE_DELETE
FILE_READ, FILE_WRITE, FILE_DELETE
COURSE_READ, COURSE_WRITE, COURSE_DELETE
EXAM_READ, EXAM_WRITE, EXAM_DELETE, EXAM_TAKE
```

---

## Monitoring

### Prometheus Metrics

```http
GET /actuator/prometheus  # trên mỗi service
```

### Health Checks

```http
GET /actuator/health       # trên mỗi service
GET /actuator/info         # Application info
```

### JVM Tuning

```bash
# Chạy với JVM tuning profile
mvn spring-boot:run -Pjvm-tuning

# JVM settings trong parent POM:
# -XX:+UseZGC
# -XX:MaxGCPauseMillis=100
# -XX:+HeapDumpOnOutOfMemoryError
```

---

## Troubleshooting

### Vấn đề thường gặp

| Vấn đề | Nguyên nhân | Giải pháp |
|---------|-------------|-----------|
| Service không đăng ký Eureka | Discovery Service chưa chạy | Khởi động Discovery Service trước |
| Lỗi kết nối Database | PostgreSQL container chưa chạy | `docker ps` kiểm tra, `docker-compose restart postgres-db` |
| Lỗi Kafka | Kafka container chưa start hoàn tất | Đợi 30s, kiểm tra `docker logs kafka` |
| JWT validation failed | JWT secret không khớp | Kiểm tra biến JWT_SECRET |
| Port conflict | Port đã được sử dụng | `netstat -ano \| findstr :PORT` để tìm process |
| Out of Memory | JVM heap quá nhỏ | Tăng -Xmx trong VM arguments |

### Kiểm tra trạng thái

```bash
# Kiểm tra containers đang chạy
docker ps

# Xem logs của một container
docker logs -f postgres-db
docker logs -f kafka

# Restart một container
docker-compose restart postgres-db

# Xem tất cả networks
docker network ls

# Dọn dẹp volumes (cẩn thận - xóa data!)
docker-compose down -v
```

### Reset Database

```bash
# Xóa và tạo lại PostgreSQL data
docker-compose down -v
docker-compose up -d postgres-db

# Xóa và tạo lại MongoDB data
docker-compose down -v
docker-compose up -d mongo-db
```

---

## Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/your-feature-name`
3. Commit changes: `git commit -m "Add: your feature description"`
4. Push branch: `git push origin feature/your-feature-name`
5. Tạo Pull Request với mô tả chi tiết

---

## License

MIT License - Xem file LICENSE để biết thêm chi tiết.

---

## Liên hệ

- Email: support@codespark.com
- Documentation: https://docs.codespark.com

---

Build with ❤️ using Spring Boot + Docker + Kafka + Blockchain

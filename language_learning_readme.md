# 🌍 Language Learning App - AI-Powered Translation Practice

> Ứng dụng học ngôn ngữ thông minh với AI feedback chi tiết, giúp cải thiện kỹ năng dịch thuật tiếng Anh - Việt

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green.svg)](https://spring.io/projects/spring-boot)
[![Groq API](https://img.shields.io/badge/Groq-AI%20Powered-orange.svg)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng chính](#-tính-năng-chính)
- [Kiến trúc hệ thống](#️-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#️-cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [API Documentation](#-api-documentation)
- [Database Schema](#️-database-schema)
- [AI Integration](#-ai-integration)
- [Roadmap](#-roadmap)

---

## 🎯 Tổng quan

Language Learning App là nền tảng học ngôn ngữ hiện đại, tận dụng sức mạnh của AI (Groq/Ollama) để:
- Đánh giá bản dịch của người học một cách thông minh
- Phát hiện lỗi ngữ pháp, từ vựng chi tiết
- Đưa ra gợi ý cải thiện cụ thể
- Theo dõi tiến độ học tập với hệ thống gamification

**Demo:**
```
Original: "Tôi muốn cảm ơn bạn vì món quà đáng yêu này"
User: "I want thank you for the lovely gift"
AI Feedback: ❌ Missing "to" after "want" (60% accuracy)
```

---

## ✨ Tính năng chính

### 🎓 Core Features
- ✅ **Translation Practice**: Dịch câu từ tiếng Việt sang tiếng Anh
- ✅ **AI Feedback**: Phân tích lỗi sai chi tiết với AI
- ✅ **Smart Scoring**: Tính điểm dựa trên độ chính xác (0-100)
- ✅ **Context Learning**: Học trong ngữ cảnh thực tế (email, thư, hội thoại)

### 🏆 Gamification
- 🔥 **Streak System**: Theo dõi chuỗi ngày học liên tiếp
- 🎖️ **Achievements**: Huy hiệu thành tựu (Bright Mind, Fast Learner, etc.)
- 📊 **Progress Tracking**: Thống kê tiến độ học tập
- ⭐ **Level System**: Hệ thống cấp độ dựa trên điểm tích lũy

### 📚 Learning Tools
- 📖 **Dictionary**: Tra từ nhanh trong bài học
- 💡 **Hint System**: Gợi ý khi gặp khó khăn
- 📝 **Detailed Explanation**: Giải thích lỗi bằng tiếng Việt
- 🎯 **Personalized Practice**: Luyện tập theo điểm yếu

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Exercise   │  │   Feedback   │  │ Achievement  │      │
│  │   Component  │  │    Panel     │  │   Tracker    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                 │               │
│           └────────────────┴─────────────────┘               │
│                            │                                 │
│                      REST API (axios)                        │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                  Backend (Spring Boot)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Translation  │  │   Feedback   │  │ Achievement  │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         │                 │                                  │
│         │    ┌────────────┴────────────┐                    │
│         │    │    AI Service Layer     │                    │
│         │    │  ┌──────────────────┐   │                    │
│         │    │  │  Groq/Ollama API │   │                    │
│         │    │  └──────────────────┘   │                    │
│         │    └─────────────────────────┘                    │
│         │                                                    │
│  ┌──────┴────────────────────────────────────────┐         │
│  │         PostgreSQL/MySQL Database              │         │
│  │  - Users  - Exercises  - Submissions           │         │
│  │  - Achievements  - Progress  - Feedback        │         │
│  └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User submits translation
    ↓
React → Axios POST /api/translate
    ↓
Spring Boot Controller receives request
    ↓
TranslationService validates input
    ↓
AIService calls Groq API with prompt
    ↓
Groq returns structured feedback (JSON)
    ↓
FeedbackService parses & saves to DB
    ↓
AchievementService updates user stats
    ↓
Response returns to React
    ↓
UI updates with feedback & achievements
```

---

## 🛠 Công nghệ sử dụng

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI Framework |
| **TanStack Router** | 1.x | Type-safe Routing & Navigation |
| **Axios** | 1.x | HTTP Client |
| **Tailwind CSS** | 3.x | Styling |
| **Zustand/Redux** | - | State Management |
| **Bun** | 1.x | JavaScript Runtime & Package Manager |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Spring Boot** | 3.2.x | Backend Framework |
| **Spring Security** | 6.x | Authentication |
| **Spring Data JPA** | 3.x | ORM |
| **PostgreSQL** | 15.x | Primary Database |
| **Redis** | 7.x | Caching (optional) |
| **Lombok** | 1.18.x | Boilerplate reduction |

### AI & External Services
| Service | Purpose | Cost |
|---------|---------|------|
| **Groq API** | AI Translation Evaluation | FREE (14,400 req/day) |
| **Ollama** (Alternative) | Local AI Model | FREE |
| **DeepL API** (Optional) | Translation Reference | FREE Tier available |

### DevOps
- **Docker** & **Docker Compose**: Containerization
- **Maven**: Build tool
- **Git**: Version control
- **GitHub Actions**: CI/CD (optional)

---

## 💻 Yêu cầu hệ thống

### Development
- **Bun**: 1.0+ (JavaScript runtime & package manager)
- **Java**: JDK 17 hoặc cao hơn
- **Maven**: 3.8+
- **PostgreSQL**: 15.x hoặc MySQL 8.x
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 2GB free space

### Production
- **RAM**: 2GB minimum (4GB recommended)
- **CPU**: 2 cores minimum
- **Storage**: 10GB+ (cho database growth)

---

## 📦 Cài đặt

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/language-learning-app.git
cd language-learning-app
```

### 2️⃣ Backend Setup

```bash
cd backend

# Cài đặt dependencies
mvn clean install

# Tạo database
createdb language_learning_db

# Chạy migrations (nếu dùng Flyway)
mvn flyway:migrate
```

### 3️⃣ Frontend Setup

```bash
cd frontend

# Cài đặt Bun (nếu chưa có)
curl -fsSL https://bun.sh/install | bash

# Cài đặt dependencies
bun install
```

### 4️⃣ Cấu hình môi trường

#### Backend (`backend/src/main/resources/application.yml`)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/language_learning_db
    username: your_db_user
    password: your_db_password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

# Groq API Configuration
groq:
  api:
    key: ${GROQ_API_KEY}
    url: https://api.groq.com/openai/v1/chat/completions
    model: llama-3.1-8b-instant
    max-tokens: 1000
    temperature: 0.3

# Security
jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000 # 24 hours

# Server
server:
  port: 8080
```

#### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Language Learning App
VITE_ENABLE_ANALYTICS=false
```

---

## ⚙️ Cấu hình

### Lấy Groq API Key

1. Truy cập: https://console.groq.com/
2. Đăng ký tài khoản (free)
3. Vào **API Keys** → **Create API Key**
4. Copy key và set vào environment:

```bash
# Linux/Mac
export GROQ_API_KEY="${GROQ_API_KEY:your-api-key-here}_key_here"

# Windows
set GROQ_API_KEY=${GROQ_API_KEY:your-api-key-here}_key_here
```

### Alternative: Chạy Local với Ollama

```bash
# Cài đặt Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull model
ollama pull llama3.2:3b

# Chạy server
ollama serve

# Update application.yml
groq:
  api:
    url: http://localhost:11434/api/generate
    model: llama3.2:3b
```

---

## 🚀 Chạy ứng dụng

### Development Mode

#### Terminal 1 - Backend
```bash
cd backend
mvn spring-boot:run

# Hoặc
./mvnw spring-boot:run
```

#### Terminal 2 - Frontend
```bash
cd frontend
bun run dev
```

Truy cập: http://localhost:5173

### Production Build

#### Backend
```bash
cd backend
mvn clean package
java -jar target/language-learning-app-0.0.1-SNAPSHOT.jar
```

#### Frontend
```bash
cd frontend
bun run build
bun run preview

# Hoặc deploy dist folder lên Nginx/Apache
```

### Docker Compose (Recommended)

```bash
# Chạy toàn bộ stack
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng
docker-compose down
```

---

## 📡 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "Nguyen Van A"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "streakCount": 5
  }
}
```

### Translation & Feedback

#### Submit Translation
```http
POST /api/translate/evaluate
Authorization: Bearer {token}
Content-Type: application/json

{
  "exerciseId": 123,
  "originalText": "Tôi muốn cảm ơn bạn vì món quà đáng yêu này",
  "userTranslation": "I want thank you for the lovely gift"
}

Response:
{
  "submissionId": 456,
  "score": 60,
  "feedback": {
    "errors": [
      {
        "type": "GRAMMAR",
        "position": "after 'want'",
        "missing": "to",
        "explanation": "Cần dùng 'to' sau động từ 'want'"
      }
    ],
    "suggestions": [
      "Use 'want to' instead of 'want'",
      "Consider adding 'this' before 'lovely gift'"
    ],
    "correctTranslation": "I want to thank you for this lovely gift"
  },
  "achievementsUnlocked": ["FIRST_SUBMISSION"]
}
```

#### Get Exercise
```http
GET /api/exercises/random?difficulty=MEDIUM
Authorization: Bearer {token}

Response:
{
  "id": 123,
  "content": "Dear Emily, I hope this message finds you well...",
  "targetSentence": "Tôi muốn cảm ơn bạn vì món quà đáng yêu này",
  "difficulty": "MEDIUM",
  "category": "FORMAL_LETTER"
}
```

### User Progress

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer {token}

Response:
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "Nguyen Van A",
  "streakCount": 5,
  "totalPoints": 1250,
  "level": 3,
  "achievements": [
    {
      "id": 1,
      "type": "STREAK_3_DAYS",
      "name": "3 Day Streak",
      "icon": "🔥",
      "earnedAt": "2024-12-10T10:00:00Z"
    }
  ]
}
```

#### Get Statistics
```http
GET /api/users/statistics
Authorization: Bearer {token}

Response:
{
  "totalSubmissions": 50,
  "averageScore": 75.5,
  "streakCount": 5,
  "lastPracticeDate": "2024-12-17T08:30:00Z",
  "progressByDifficulty": {
    "EASY": { "completed": 20, "avgScore": 85 },
    "MEDIUM": { "completed": 25, "avgScore": 70 },
    "HARD": { "completed": 5, "avgScore": 60 }
  }
}
```

---

## 🗄️ Database Schema

```sql
-- Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_
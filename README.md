<div align="center">

# 🧠 Kriya — Personalized AI Learning Platform

### An intelligent full-stack learning platform powered by AI, built with the MERN stack

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Kriya-4CAF50?style=for-the-badge&logo=vercel)](https://kriya-pro.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-TechExplorer15-181717?style=for-the-badge&logo=github)](https://github.com/TechExplorer15/lms-platform)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

</div>

---

## 🚀 Live Demo

👉 **[kriya-pro.vercel.app](https://kriya-pro.vercel.app)**

---

## ✨ Features

- 🤖 **AI-Personalized Learning** — Adaptive content recommendations based on learner progress and behavior
- 🔐 **JWT Authentication** — Secure login/register for students and instructors
- 📖 **Course Management** — Create, update, and organize courses with structured content
- 🎥 **Video Lectures** — Stream lecture videos per module and course
- 📊 **Progress Tracking** — Students track completion, scores, and learning milestones
- 💳 **Payment Integration** — Enroll in premium courses via payment gateway
- 📱 **Responsive UI** — Fully optimized for mobile and desktop

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React.js, CSS Modules / Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens) |
| AI Layer | Personalization engine for adaptive learning |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## 📁 Project Structure

```
lms-platform/
├── lms-frontend/          # React.js client
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
│
└── lms-backend/           # Node.js + Express REST API
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    └── server.js
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/TechExplorer15/lms-platform.git
cd lms-platform
```

#### Backend
```bash
cd lms-backend
npm install
npm run dev
```

#### Frontend
```bash
cd lms-frontend
npm install
npm start
```

---

## 📸 Screenshots

> <img width="1912" height="862" alt="Screenshot 2026-06-16 131633" src="https://github.com/user-attachments/assets/a3d93563-3edb-4f0d-9242-9b6d9df6612e" />
<img width="1918" height="861" alt="Screenshot 2026-06-16 131658" src="https://github.com/user-attachments/assets/e44186e6-61de-4d4f-af02-25f2384525a5" />
<img width="1906" height="827" alt="Screenshot 2026-06-16 131819" src="https://github.com/user-attachments/assets/1a622096-b180-4dda-b94f-2b71be85b094" />
<img width="1768" height="827" alt="Screenshot 2026-06-16 131853" src="https://github.com/user-attachments/assets/cbdf55a5-a52a-4abc-b7e7-54bfd8b27fa2" />





---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/courses` | Get all courses |
| POST | `/api/courses` | Create course (instructor) |
| GET | `/api/courses/:id` | Get single course |
| POST | `/api/enroll/:id` | Enroll in a course |
| GET | `/api/progress/:userId` | Get learner progress |

---

## 🙋‍♂️ Author

**TechExplorer15**
- GitHub: [@TechExplorer15](https://github.com/TechExplorer15)
- Live: [kriya-pro.vercel.app](https://kriya-pro.vercel.app)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

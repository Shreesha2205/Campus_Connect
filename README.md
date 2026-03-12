<div align="center">

# 🎓 CampusConnect

**A full-stack campus social platform — available on mobile, web, and powered by a shared REST API.**

[![React Native](https://img.shields.io/badge/React%20Native-Expo%2054-blue?logo=expo)](https://expo.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb)](https://mongodb.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image%20Hosting-3448C5?logo=cloudinary)](https://cloudinary.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📖 Project Overview

**CampusConnect** is a social networking platform built exclusively for students. It lets students sign up, share posts, like content, and manage their campus profile — all within a modern, dark-themed UI. The project is structured as a **monorepo** containing three separate apps that share a single backend API:

| App | Framework | Purpose |
|-----|-----------|---------|
| 📱 `apps/mobile` | React Native (Expo) | Native iOS & Android app |
| 🌐 `apps/web` | React + Vite | Browser-based web client |
| ⚙️ `Backend` | Node.js + Express | Shared REST API |

---

## ✨ Features

### 🔐 Authentication
- **Register** with name, email, and password
- **Login** with JWT token — persisted via `AsyncStorage` (mobile) or `localStorage` (web)
- **Auto-login** on app relaunch using stored token
- **Protected routes** — unauthenticated users are redirected to login
- Passwords hashed with **bcryptjs**, tokens signed with **jsonwebtoken**

### 📰 Social Feed
- Browse all campus posts in reverse chronological order
- See post author's name, profile picture, and department
- Real-time **like / unlike** toggle with like count
- **Delete your own posts** with authorization guard

### ✍️ Create Posts
- Compose and publish campus posts
- Minimum character limit enforced
- Optimistic UI updates on mobile

### 👤 Profile Management
- View and edit your **name**, **email**, **bio**, **department**, and **year**
- Upload a **profile photo** — stored on Cloudinary
- All profile changes reflected globally across the app instantly

### 📱 Mobile-Specific
- Expo Router (file-based navigation)
- Dark-themed custom tab bar with animated icons
- Smooth animated login screen with tab switching (Sign In / Register)
- Branded loading screen with live timer and server wake-up message (Render free tier)
- Keyboard-avoiding forms

### 🌐 Web-Specific
- React + Vite SPA
- Matching dark UI theme with the mobile app
- Axios-powered API client with auth interceptor

---

## 🛠 Tech Stack

### Mobile (`apps/mobile/Campus`)
| Technology | Version | Role |
|---|---|---|
| Expo | ~54.0 | Build & dev tooling |
| React Native | 0.81.5 | Native UI framework |
| Expo Router | ~6.0 | File-based navigation |
| React Native Reanimated | ~4.1 | Smooth animations |
| React Native Safe Area Context | ~5.6 | Safe area handling |
| AsyncStorage | 2.2.0 | Token persistence |
| Axios | ^1.13 | HTTP client |
| Expo Image Picker | ~17.0 | Profile photo upload |
| TypeScript | ~5.9 | Type safety |

### Web (`apps/web/Campus`)
| Technology | Version | Role |
|---|---|---|
| React | ^19.2 | UI framework |
| Vite | ^7.3 | Dev server & bundler |
| Axios | ^1.13 | HTTP client |

### Backend (`Backend/`)
| Technology | Version | Role |
|---|---|---|
| Node.js + Express | ^5.2 | REST API server |
| MongoDB + Mongoose | ^9.2 | Database & ODM |
| bcryptjs | ^3.0 | Password hashing |
| jsonwebtoken | ^9.0 | JWT auth tokens |
| Cloudinary | ^2.9 | Profile image storage |
| Multer | ^2.1 | File upload middleware |
| dotenv | ^17.3 | Environment variables |
| Nodemon | ^3.1 | Dev auto-restart |

---

## 🏗 Architecture

```
Campus/
├── Backend/                    # Shared REST API
│   ├── server.js               # Entry point — Express app
│   └── src/
│       ├── config/
│       │   ├── db.js           # MongoDB connection
│       │   └── cloudinary.js   # Cloudinary config
│       ├── models/
│       │   ├── User.js         # User schema (name, email, bio, dept, year, profileImage)
│       │   └── Post.js         # Post schema (content, user ref, likes[])
│       ├── controllers/
│       │   ├── authController.js   # register, login, getProfile, updateProfile
│       │   └── postController.js   # createPost, getPosts, toggleLike, deletePost
│       ├── routes/
│       │   ├── authRoutes.js   # POST /api/auth/register|login, GET|PUT /api/auth/profile
│       │   └── postRoutes.js   # GET|POST /api/posts, PUT /api/posts/:id/like, DELETE /api/posts/:id
│       └── middleware/
│           └── authMiddleware.js  # JWT verify → attach req.user
│
├── apps/
│   ├── mobile/Campus/          # React Native (Expo) app
│   │   ├── app/
│   │   │   ├── _layout.tsx     # Root layout — AuthProvider + Stack navigator + loading screen
│   │   │   ├── login.tsx       # Login & Register screen
│   │   │   └── (tabs)/
│   │   │       ├── _layout.tsx # Tab bar (Feed, Compose, Profile)
│   │   │       ├── feed.tsx    # Posts feed with like/delete
│   │   │       ├── post.tsx    # New post composer
│   │   │       └── profile.tsx # Profile view & edit
│   │   └── src/
│   │       ├── context/
│   │       │   └── AuthContext.tsx  # Global auth state (user, login, register, logout, updateUser)
│   │       └── api/
│   │           └── axios.ts    # Axios instance with JWT interceptor
│   │
│   └── web/Campus/             # React + Vite web app
│       └── src/
│           ├── components/
│           │   ├── LoginPage.jsx
│           │   ├── Feed.jsx
│           │   └── Profile.jsx
│           ├── context/        # Auth context (web)
│           └── api/            # Axios instance (web)
```

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login & get JWT |
| `GET` | `/api/auth/profile` | ✅ | Get current user |
| `PUT` | `/api/auth/profile` | ✅ | Update profile + photo |
| `GET` | `/api/posts` | ✅ | Get all posts (populated) |
| `POST` | `/api/posts` | ✅ | Create a new post |
| `PUT` | `/api/posts/:id/like` | ✅ | Toggle like on post |
| `DELETE` | `/api/posts/:id` | ✅ | Delete own post |

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** v18+
- **npm** v9+
- **MongoDB** (local or [MongoDB Atlas](https://cloud.mongodb.com))
- **Cloudinary** account (free tier)
- **Expo Go** app on your phone (for mobile dev)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/campus-connect.git
cd campus-connect
```

---

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file inside `Backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The API will be running at `http://localhost:5000`

---

### 3. Mobile App Setup

```bash
cd apps/mobile/Campus
npm install
```

Update the base URL in `src/api/axios.ts`:
```ts
// For local development — use your machine's local IP (not localhost)
baseURL: "http://192.168.x.x:5000/api"

// For production (deployed backend)
baseURL: "https://your-backend.onrender.com/api"
```

Start Expo:

```bash
npx expo start
```

Then scan the QR code with **Expo Go** on your phone (make sure your phone and PC are on the **same Wi-Fi network**).

---

### 4. Web App Setup

```bash
cd apps/web/Campus
npm install
npm run dev
```

Update the base URL in `src/api/axios.js` similarly to the mobile setup.

The web app will be at `http://localhost:5173`

---

## 📸 Screenshots

> _Screenshots coming soon — scan the QR from `npx expo start` to see the live app._

| Screen | Description |
|--------|-------------|
| 🔐 Login / Register | Animated dark-themed auth screen with tab switcher |
| 📰 Feed | Social feed with posts, likes, and user avatars |
| ✍️ Compose | Post creation screen |
| 👤 Profile | Profile view with editable fields and photo upload |
| ⏳ Loading | Branded server wake-up screen with live elapsed timer |

---

## 🚀 Demo

- **Backend API (live):** [https://campus-connect-lv1j.onrender.com](https://campus-connect-lv1j.onrender.com)

> **Note:** The backend is hosted on Render's free tier. It may take **30–60 seconds** to respond on the first request after a period of inactivity (cold start). The mobile app displays a branded loading screen during this time.

---

## 🌱 Environment Variables Summary

| Variable | Where | Description |
|---|---|---|
| `PORT` | Backend | Server port (default: 5000) |
| `MONGO_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Secret key for signing JWTs |
| `CLOUDINARY_CLOUD_NAME` | Backend | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Backend | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Backend | Cloudinary API secret |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ for campus communities
</div>

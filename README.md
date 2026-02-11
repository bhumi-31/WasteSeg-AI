<p align="center">
  <img src="https://img.icons8.com/color/96/recycle-sign.png" alt="WasteSeg AI Logo" width="80"/>
</p>

<h1 align="center">WasteSeg AI</h1>

<p align="center">
  <strong>AI-Powered Waste Segregation & Classification System</strong>
</p>

<p align="center">
  <a href="https://wastesegai.vercel.app">
    <img src="https://img.shields.io/badge/Live_Demo-Visit-22c55e?style=for-the-badge&logo=vercel" alt="Live Demo"/>
  </a>
  <img src="https://img.shields.io/badge/SDG_12-Responsible_Consumption-FFA500?style=for-the-badge" alt="SDG 12"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai" alt="OpenAI"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss" alt="TailwindCSS"/>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 Overview

**WasteSeg AI** is an intelligent waste segregation assistant that helps users make informed decisions about waste disposal. Using computer vision and AI, the application analyzes images of waste items and provides:

- **Accurate Classification** — Identifies waste as Recyclable, Organic, or Hazardous
- **Disposal Guidance** — Step-by-step instructions for proper disposal
- **Educational Content** — Environmental tips and awareness information
- **Location Services** — Finds nearby recycling centers and disposal points

> *"Can technology help people make the right choice at the right moment?"*

---

## 🎯 Problem Statement

**SDG 12 – Responsible Consumption and Production**

Every day, tons of waste are collected in cities worldwide. Yet, recycling rates remain low because most citizens:
- Don't know whether an item is recyclable, organic, or hazardous
- Lack access to proper disposal facilities
- Need guidance at the **point of decision**

WasteSeg AI addresses this gap by providing **instant, AI-powered waste classification** directly on users' smartphones.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📷 **Smart Scan** | Capture or upload images for instant AI classification |
| 🎨 **Visual Classification** | Color-coded results (Blue/Green/Red) for easy understanding |
| 📝 **Disposal Steps** | Actionable instructions for each waste type |
| 💡 **Environmental Tips** | "Did You Know?" facts to promote awareness |
| ⚠️ **Safety Warnings** | Alerts for hazardous materials |
| 🗺️ **Find Centers** | Interactive map with nearby disposal points |
| 🧭 **Turn-by-Turn Navigation** | Real-time directions to selected locations |
| 📊 **Impact Statistics** | Track your environmental contribution |
| 🏆 **Leaderboard** | Gamification to encourage participation |
| 🎯 **Daily Challenges** | Earn bonus points by completing tasks |
| 📜 **Scan History** | Cloud-synced history of all scans |
| 📱 **PWA Support** | Install as a native app on any device |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool & Dev Server |
| TailwindCSS | Styling |
| React Router | Navigation |
| React Leaflet | Interactive Maps |
| Lucide Icons | Icon Library |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Web Framework |
| MongoDB Atlas | Database |
| Mongoose | ODM |
| OpenAI GPT-4o-mini | Vision AI |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Frontend Hosting |
| Render | Backend Hosting |
| MongoDB Atlas | Database Hosting |
| Cloudinary | Media Storage |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Camera  │  │  Result  │  │   Find   │  │  Stats/History   │ │
│  │   Scan   │  │   Page   │  │  Centers │  │   Leaderboard    │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │             │                  │           │
│       └─────────────┴─────────────┴──────────────────┘           │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────┼───────────────────────────────────┐
│                         SERVER (Express)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      API Routes                           │   │
│  │  POST /api/analyze  │  GET /api/scans  │  GET /api/stats  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Services                             │   │
│  │  OpenAI Service (GPT-4o-mini Vision API)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                      MongoDB Atlas                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │    Scans    │  │    Stats    │  │       Challenges        │  │
│  │  Collection │  │  Collection │  │       Collection        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/atlas))
- **OpenAI API Key** ([Get key](https://platform.openai.com/api-keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/bhumi-31/WasteSeg-AI.git
cd WasteSeg-AI

# Install dependencies for all packages
npm run install:all

# Or install individually
npm install                    # Root
cd client && npm install       # Frontend
cd ../server && npm install    # Backend
```

### Environment Setup

**Create `server/.env`:**
```env
PORT=3001
OPENAI_API_KEY=sk-your-openai-api-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wastewise
NODE_ENV=development
```

### Running Locally

```bash
# Start both frontend and backend concurrently
npm run dev

# Or run separately
npm run dev:client    # http://localhost:5173
npm run dev:server    # http://localhost:3001
```

### Building for Production

```bash
cd client
npm run build         # Output in client/dist/
```

---

## 📡 API Documentation

### Base URL
- **Development:** `http://localhost:3001`
- **Production:** `https://wasteseg-api.onrender.com`

### Endpoints

#### Analyze Waste Image
```http
POST /api/analyze
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQ...",
  "userId": "user_device_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "recyclable",
    "itemName": "Plastic Water Bottle",
    "binType": "Recycling Bin",
    "binColor": "Blue",
    "confidence": 95,
    "disposalSteps": [
      "Empty any remaining liquid",
      "Remove cap and label if possible",
      "Rinse the bottle",
      "Place in recycling bin"
    ],
    "environmentalTip": "Recycling one plastic bottle saves enough energy to power a 60W light bulb for 6 hours.",
    "warnings": []
  }
}
```

#### Get Scan History
```http
GET /api/scans/:userId
```

#### Get User Statistics
```http
GET /api/stats/:userId
```

#### Health Check
```http
GET /health
```

---

## 🌐 Deployment

### Frontend (Vercel)

1. Import repository on [Vercel](https://vercel.com)
2. Configure:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Deploy

### Backend (Render)

1. Create Web Service on [Render](https://render.com)
2. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
3. Add Environment Variables:
   - `OPENAI_API_KEY`
   - `MONGODB_URI`
   - `NODE_ENV=production`
4. Deploy

---

## 📁 Project Structure

```
WasteSeg-AI/
├── client/                     # Frontend Application
│   ├── public/                 # Static assets
│   │   ├── favicon.svg
│   │   └── manifest.json       # PWA manifest
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── Camera.jsx
│   │   │   ├── Header.jsx
│   │   │   └── BottomNav.jsx
│   │   ├── pages/              # Route pages
│   │   │   ├── Landing.jsx
│   │   │   ├── Scan.jsx
│   │   │   ├── Result.jsx
│   │   │   ├── FindCenters.jsx
│   │   │   ├── Stats.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── Challenges.jsx
│   │   ├── lib/                # Utilities
│   │   │   ├── api.js          # API client
│   │   │   ├── storage.js      # Local/cloud sync
│   │   │   └── utils.js        # Helpers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # React context providers
│   │   ├── App.jsx             # Root component
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend Application
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/                 # Mongoose schemas
│   │   ├── Scan.js
│   │   ├── Stats.js
│   │   └── Challenge.js
│   ├── routes/                 # Express routes
│   │   ├── analyze.js          # POST /api/analyze
│   │   ├── history.js          # GET /api/scans
│   │   └── challenges.js       # GET /api/challenges
│   ├── services/
│   │   └── openai.js           # OpenAI Vision integration
│   ├── index.js                # Server entry point
│   └── package.json
│
├── package.json                # Root package (monorepo scripts)
├── .gitignore
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Style
- Use ESLint configuration provided
- Follow existing naming conventions
- Write meaningful commit messages

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👏 Acknowledgments

- [OpenAI](https://openai.com) for GPT-4o Vision API
- [OpenStreetMap](https://www.openstreetmap.org) for map data
- [Leaflet](https://leafletjs.com) for mapping library
- [Lucide](https://lucide.dev) for icons
- [shadcn/ui](https://ui.shadcn.com) for UI components

---

<p align="center">
  <strong>Built with 💚 for a cleaner planet</strong>
</p>

<p align="center">
  <a href="https://wastesegai.vercel.app">Live Demo</a> •
  <a href="https://github.com/bhumi-31/WasteSeg-AI/issues">Report Bug</a> •
  <a href="https://github.com/bhumi-31/WasteSeg-AI/issues">Request Feature</a>
</p>

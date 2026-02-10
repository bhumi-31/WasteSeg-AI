# WasteWise AI - Smart Waste Segregation Application

An AI-powered waste management application that helps users identify and properly dispose of waste items.

## Project Structure

```
wastewise-ai/
├── client/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities and API functions
│   │   ├── hooks/        # Custom React hooks
│   │   └── context/      # React context providers
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
│
├── server/               # Backend (Node.js + Express)
│   ├── config/           # Database configuration
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   └── package.json      # Backend dependencies
│
├── package.json          # Root package.json (scripts to run both)
└── README.md
```

## Tech Stack

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Lucide React Icons
- React Router
- React Leaflet (Maps)

**Backend:**
- Node.js
- Express
- MongoDB + Mongoose
- OpenAI API

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd wastewise-ai

# Install all dependencies (root + client + server)
npm run install:all

# Or install individually:
npm install           # Root dependencies
cd client && npm install  # Frontend dependencies  
cd ../server && npm install  # Backend dependencies
```

### Environment Variables

Create `.env` files:

**Root `.env`** (or `server/.env`):
```env
OPENAI_API_KEY=your_openai_api_key
MONGODB_URI=your_mongodb_connection_string
```

### Running the Application

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run them separately:
npm run dev:client    # Frontend on http://localhost:8082
npm run dev:server    # Backend on http://localhost:3001
```

### Build for Production

```bash
npm run build         # Builds the frontend
```

## Features

- 📷 **Camera Scan** - Capture waste items for AI classification
- 🗂️ **Smart Classification** - AI identifies waste type (Recyclable, Organic, Hazardous)
- 📍 **Find Centers** - Locate nearby waste disposal points with real-time navigation
- 📊 **Statistics** - Track your environmental impact
- 🏆 **Leaderboard** - Compete with others to save the planet
- 🎯 **Daily Challenges** - Complete tasks to earn bonus points
- 📜 **Scan History** - View past scans with MongoDB persistence
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

# AI-Powered Content Scheduling & Recommendation Platform

A production-ready SaaS platform that analyzes historical content engagement and uses OpenAI to recommend optimal publishing times and high-performing headlines.



## 🚀 Features

### 📊 Analytics Dashboard
- **KPI Cards** - Total posts, engagement rate, best time & day
- **Engagement Heatmap** - Visual day/hour performance matrix
- **Time-series Charts** - Engagement trends over time
- **Top Performing Posts** - Ranked by normalized engagement score
- **Best Time Slots** - AI-ranked optimal publishing times with confidence scores

### 📅 Content Scheduler
- **Drag-and-Drop Calendar** - FullCalendar integration
- **Create & Edit Posts** - Modal editor with platform selection
- **Reschedule with Undo** - Move posts, revert if needed
- **AI Headline Suggestions** - Generate & apply in one click
- **Status Tracking** - Draft, Scheduled, Published states

### 🤖 AI-Powered Insights (OpenAI)
- **Headline Generation** - 5 suggestions with confidence scores
- **Content Rewriting** - Tone adjustment & optimization
- **Timing Explanation** - AI explains why certain times work
- **Tone Classification** - Professional, playful, urgent, etc.
- **Usage Tracking** - Monitor API costs and cache efficiency

### 📤 Export & Publishing
- **CSV Export** - Download scheduled content
- **Mock Publishing** - Simulated API with status updates
- **Webhook Simulation** - Test integration workflows

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS v4 |
| **UI Components** | FullCalendar, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **AI** | OpenAI API (GPT-3.5/4) |
| **Styling** | Custom design system with dark mode |

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom hooks
│   │   └── services/       # API client
│   └── index.html
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # DB & OpenAI config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, rate limiting
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── data/           # Sample dataset & seed script
│   └── .env.example
│
└── README.md
```

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment

```bash
# server/.env
cp .env.example .env
# Edit .env with your MongoDB URL and OpenAI API key
```

### 3. Seed Database

```bash
cd server
npm run seed
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Visit `http://localhost:5173`

## 🔗 API Endpoints

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | KPI summary |
| GET | `/api/analytics/heatmap` | Day/hour engagement data |
| GET | `/api/analytics/timeseries` | Engagement trend |
| GET | `/api/analytics/top-posts` | Best performing content |
| GET | `/api/analytics/best-slots` | Optimal publishing times |

### Scheduled Content
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scheduled` | List all scheduled posts |
| GET | `/api/scheduled/calendar` | Calendar events format |
| POST | `/api/scheduled` | Create new scheduled post |
| PUT | `/api/scheduled/:id` | Update post |
| DELETE | `/api/scheduled/:id` | Delete post |
| POST | `/api/scheduled/:id/undo-reschedule` | Revert schedule change |

### AI (OpenAI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/headlines` | Generate headline suggestions |
| POST | `/api/ai/rewrite` | Rewrite content with new tone |
| POST | `/api/ai/explain-timing` | AI explanation of timing |
| POST | `/api/ai/classify-tone` | Classify content tone |
| GET | `/api/ai/usage` | Usage statistics |

### Publishing & Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/publish/:id` | Mock publish content |
| GET | `/api/export/csv` | Export to CSV |
| GET | `/api/export/json` | Export to JSON |

## 🎨 Design Features

- **Dark/Light Mode** - System preference + manual toggle
- **Responsive** - Mobile-first design
- **Accessible** - Keyboard navigation, ARIA labels
- **Animations** - Smooth transitions & micro-interactions
- **Loading States** - Skeleton loaders throughout

## 🔐 Security

- ✅ API keys server-side only
- ✅ Rate limiting on all endpoints
- ✅ AI-specific rate limiting (10 req/min)
- ✅ Input validation with express-validator
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ AI response caching to reduce costs

## 📊 AI Usage & Costs

The platform tracks OpenAI usage:
- Request count & cache hits
- Token consumption
- Estimated cost (USD)
- Daily breakdown

AI responses are cached to minimize redundant API calls:
- Headlines: 1 hour TTL
- Insights: 24 hour TTL

## 🧪 Testing the Flow

1. **Import Sample Data** - Click "Import Sample Data" on dashboard
2. **View Analytics** - Explore heatmap, charts, best slots
3. **Schedule Content** - Click a calendar date, fill form
4. **Generate Headlines** - Click "Generate Headlines" in editor
5. **Apply Suggestion** - Click "Apply" on a headline
6. **Drag to Reschedule** - Move event on calendar
7. **Undo** - Click "Undo" in toast notification
8. **Export** - Download CSV from schedule page

## 📝 License

MIT

---

Built with ❤️ using OpenAI, React, and Express

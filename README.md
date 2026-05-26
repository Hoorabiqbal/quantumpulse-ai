
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1e40af,100:06b6d4&height=200&section=header&text=QuantumPulse%20AI&fontSize=60&fontColor=ffffff&fontAlignY=35&desc=AI-Powered%20Financial%20Market%20Intelligence%20Platform&descAlignY=55&descSize=18" width="100%"/>

<br/>

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/Groq_LLM-FF6B35?style=for-the-badge&logo=lightning&logoColor=white)](https://groq.com/)

<br/>

**QuantumPulse AI** is a production-grade, AI-powered financial intelligence platform that combines real-time market data, multi-model AI analysis, and sentiment detection to deliver institutional-quality insights — accessible to everyone.

<br/>

[🚀 Live Demo](#) · [📸 Screenshots](#-screenshots) · [🐛 Report Bug](../../issues) · [💡 Request Feature](../../issues)

<br/>

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#-usage)
- [AI Models Used](#-ai-models-used)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧠 About the Project

Traditional financial tools are either too complex for retail investors or too simplistic to be useful. **QuantumPulse AI** bridges that gap.

This platform ingests live financial and crypto news, runs it through a **dual-AI pipeline** (Google Gemini + Groq LLaMA), extracts market sentiment, calculates risk levels, and delivers human-readable insights in real time — all from a single, beautiful dashboard.

> Built as a Final Year Project demonstrating the practical application of large language models in the fintech domain.

**Problems Solved:**
- 🔴 Information overload in financial news → **AI filters and summarizes**
- 🔴 Emotional trading decisions → **Objective sentiment scoring**
- 🔴 No accessible risk tools for retail investors → **Real-time risk calculator**
- 🔴 Fragmented market data → **Unified intelligent dashboard**

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Sentiment Analyzer** | Dual-model NLP pipeline (Gemini + Groq) classifies market sentiment as Bullish, Bearish, or Neutral with confidence scoring |
| 📰 **Live News Intelligence** | Real-time financial & crypto news feed with AI-powered relevance filtering and instant analysis |
| 📊 **Market Dashboard** | Live price tracking for stocks and cryptocurrencies via Alpha Vantage & Finnhub APIs |
| 😨 **Crypto Fear & Greed Index** | Real-time market psychology indicator with historical trend visualization |
| ⚖️ **Risk Calculator** | AI-assisted position sizing and risk/reward analysis tool for trade planning |
| 🧠 **AI Reasoning Cards** | Transparent, step-by-step AI reasoning for every market prediction |
| 📈 **Analysis History Log** | Persistent storage of all user analyses with trend tracking over time |
| 👤 **User Authentication** | Secure Supabase-powered auth with personalized analytics dashboard |
| 📉 **Trading Performance Tracker** | Visual charts of analysis accuracy and personal trading insights |
| 💡 **Smart Trading Tips** | Curated, context-aware financial education content |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| TypeScript | 5.8 | Type-safe development |
| Vite | 6.x | Build tool & dev server |
| Recharts | 3.x | Data visualization & charts |

### AI & Intelligence Layer
| Technology | Purpose |
|---|---|
| Google Gemini 2.0 Flash | Primary LLM for sentiment analysis & market insights |
| Groq (LLaMA 3) | High-speed fallback LLM with rate-limit management |
| Custom Intelligence Service | Query preprocessing, intent classification, spell correction |

### Backend & Data
| Technology | Purpose |
|---|---|
| Supabase | Authentication, PostgreSQL database, real-time subscriptions |
| Alpha Vantage API | Stock market data & technical indicators |
| Finnhub API | Real-time financial data & company metrics |
| News APIs | Live financial & crypto news aggregation |

---

## 🏗 Architecture Overview

```
QuantumPulse AI
├── 🧠 Intelligence Pipeline
│   ├── Intelligence Service   → Query preprocessing & intent detection
│   ├── Gemini Service         → Primary AI analysis (with retry logic)
│   └── Groq Service           → Fallback LLM (rate-limited, 30 RPM)
│
├── 📊 Data Services
│   ├── Market Data Service    → Alpha Vantage + Finnhub integration
│   ├── News Service           → Live news aggregation
│   └── Analysis Service       → Result storage & retrieval
│
├── 🔐 Auth & Storage
│   ├── Auth Service           → Supabase authentication
│   └── Storage Service        → Local + cloud persistence
│
└── 🎨 UI Components (19 components)
    ├── SentimentAnalyzer      → Core AI analysis interface
    ├── MarketDashboard        → Live market overview
    ├── RiskCalculator         → Position sizing tool
    ├── HistoryLog             → Analysis tracking
    └── ... (15 more)
```

---

## 📸 Screenshots

<div align="center">

### 🏠 Main Dashboard
><img width="1891" height="876" alt="Main Dashboard" src="https://github.com/user-attachments/assets/bcb45f8d-70bd-4317-94fb-3f43ff20108f" />


### 🤖 AI Sentiment Analysis
> <img width="1888" height="872" alt="AI Sentiment Analysis" src="https://github.com/user-attachments/assets/0d8b82af-b6aa-4b57-90e7-be556c4867e0" />


### 📊 Market Intelligence
> <img width="1882" height="861" alt="Market Intelligence" src="https://github.com/user-attachments/assets/8f7e3bfd-df50-483e-a003-a6a3390cc6f5" />


### ⚖️ Risk Calculator
> <img width="351" height="598" alt="Risk Calculator" src="https://github.com/user-attachments/assets/f1b4bc46-ea26-47f3-bfb2-595e730a8f2d" />



</div>

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

```bash
node --version    # v18.0.0 or higher required
npm --version     # v9.0.0 or higher
```

### Installation

**Step 1:** Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/quantumpulse-ai.git
cd quantumpulse-ai
```

**Step 2:** Install dependencies
```bash
npm install
```

**Step 3:** Set up environment variables (see below)

**Step 4:** Start the development server
```bash
npm run dev
```

The app will be running at `http://localhost:5173` 🎉

### Environment Variables

Create a `.env.local` file in the project root and add the following:

```env
# ── AI Services ──────────────────────────────────────────
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here

# ── Market Data ───────────────────────────────────────────
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
VITE_FINNHUB_API_KEY=your_finnhub_api_key_here

# ── Authentication & Database ─────────────────────────────
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Where to get API keys:**

| Service | Free Tier | Link |
|---|---|---|
| Google Gemini | ✅ Yes | [ai.google.dev](https://ai.google.dev/) |
| Groq | ✅ Yes | [console.groq.com](https://console.groq.com/) |
| Alpha Vantage | ✅ Yes (500 req/day) | [alphavantage.co](https://www.alphavantage.co/) |
| Finnhub | ✅ Yes | [finnhub.io](https://finnhub.io/) |
| Supabase | ✅ Yes (generous free tier) | [supabase.com](https://supabase.com/) |

> ⚠️ **Security Note:** Never commit your `.env.local` file. It is already included in `.gitignore`.

### Build for Production

```bash
npm run build       # Creates optimized build in /dist
npm run preview     # Preview the production build locally
```

---

## 📱 Usage

1. **Analyze News** — Paste any financial or crypto news headline into the Sentiment Analyzer and get instant AI-powered sentiment scoring with reasoning
2. **Track Markets** — View live prices and trends across stocks and crypto on the Market Dashboard
3. **Calculate Risk** — Use the Risk Calculator to determine position sizes and risk/reward ratios before any trade
4. **Review History** — Access your full analysis history log to spot patterns in your research

---

## 🤖 AI Models Used

**Primary: Google Gemini 2.0 Flash**
- Ultra-low latency financial sentiment analysis
- Structured JSON output with confidence scoring
- Automatic retry with exponential backoff (3 retries)
- Rate limiting: 10 RPM / 250 RPD (configurable)

**Fallback: Groq LLaMA 3**
- Activates automatically when Gemini is rate-limited
- High-throughput processing at 30 RPM
- Identical output schema for seamless switching

**Intelligence Pre-processing Layer**
- Intent classification (explain / define / compare / analyze / sentiment)
- Financial term normalization & spell correction
- Query optimization before LLM submission

---

## 🗺 Future Roadmap

- [ ] 🌐 **Portfolio Tracker** — Connect brokerage APIs to analyze your real holdings
- [ ] 📱 **Mobile App** — React Native version for iOS & Android
- [ ] 🔔 **Smart Alerts** — Push notifications when sentiment shifts on tracked assets
- [ ] 📊 **Backtesting Engine** — Test AI predictions against historical market data
- [ ] 🌍 **Multi-language Support** — Arabic, Urdu, French, Spanish markets
- [ ] 🤝 **Social Sentiment** — Twitter/Reddit integration for crowd sentiment signals
- [ ] 🏦 **Institutional Dashboard** — Advanced analytics for professional traders
- [ ] 🔗 **Webhook API** — Let developers integrate QuantumPulse signals into their own apps

---

## 🤝 Contributing

Contributions are what make open source amazing. Any contributions are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a PR.

---

## 👨‍💻 Author

Hoorab Iqbal
- LinkedIn:(www.linkedin.com/in/hoorab-iqbal-689ba725b)
- GitHub: [@Hoorabiqbal](https://github.com/Hoorabiqbal)
- Email: hoorabiqbal93@gmail.com

*Final Year Project — University of Agriculture Faisalabad, 2025*

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgements

- [Google Gemini AI](https://ai.google.dev/) for the powerful LLM backbone
- [Groq](https://groq.com/) for ultra-fast inference
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Recharts](https://recharts.org/) for beautiful data visualization
- [Vite](https://vitejs.dev/) for the blazing-fast dev experience

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:06b6d4,50:1e40af,100:0f172a&height=100&section=footer" width="100%"/>

**⭐ If you found this project useful, please star the repository!**

*Built with ❤️ and a lot of ☕*

</div>

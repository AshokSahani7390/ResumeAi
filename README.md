# ResumeAI — AI-Powered Resume Builder & ATS Optimizer

ResumeAI is a production-ready SaaS application designed to help users create high-impact, ATS-optimized resumes and cover letters using OpenAI. 

## 🚀 Features

- **🤖 AI Resume Engine**: Generate professional summaries and bullet points using specialized prompts.
- **✉️ AI Cover Letter**: Personalized, engaging cover letters in seconds.
- **📊 ATS Audit Report**: Real-time scoring (0-100) with strengths, weaknesses, and missing keyword analysis.
- **⚡ Smart Keyword Boost**: One-click optimization to inject industry-relevant keywords.
- **🎨 Premium Templates**: Choose between Professional, Modern, and Minimal layouts.
- **🔐 Secure Persistence**: Built-in authentication (JWT) with real-time cloud sync (Prisma + PostgreSQL).
- **📥 PDF Export**: High-quality PDF generation for job applications.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+ (App Router), React 19, TailwindCSS 4.
- **Backend**: Next.js API Routes, JWT Auth.
- **Database**: PostgreSQL (via Neon), Prisma ORM 7.
- **AI**: OpenAI API (GPT-4o-mini).

## ⚙️ Setup Instructions

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd resumeai-app
npm install
```

### 2. Environment Variables
Create a `.env` file in the root (and `.env.local` for local dev):
```env
DATABASE_URL="your_neon_postgresql_url"
JWT_SECRET="your_secure_random_string"
OPENAI_API_KEY="your_openai_api_key"
```

### 3. Database Sync
```bash
# Push schema to Neon
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see your app.

## 📁 Project Structure

- `src/app/api`: Backend logic and AI endpoints.
- `src/app/create`: Multi-step resume builder logic.
- `src/app/dashboard`: User's saved resume management.
- `src/lib`: Shared utilities (Auth, Prisma Client).
- `prisma/schema.prisma`: Database models.

## 📄 License
MIT

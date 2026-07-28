# Cyber Academy - Gamified Cyber-OS Operator Interface

An interactive, gamified cybersecurity learning platform built as a virtual "Cyber-OS Desktop" environment. Users take on the role of an Operator, deploying hacking sandboxes, executing terminal shell commands to exploit simulated vulnerabilities, analyzing defender logs, and submitting target flags to level up.

![Aesthetic Dashboard Preview](https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1200&q=80)

---

## 🖥️ Core Features

- **Draggable & Resizable Window Manager**: The dashboard mimics a native operating system desktop. You can arrange, resize, minimize, maximize, and close the **Terminal Console**, **Mission Control (Curriculum)**, and **Operator Database (Lesson Details)** windows to customize your workspace.
- **Hidden Locked Levels**: Prevents spoilers and keeps the curriculum relevant. Tiers like *Mediator* and *Advanced* remain hidden from view until all previous lessons are successfully completed and their corresponding assessment contract reports are approved.
- **Sleek Taskbar & Shortcuts**: Dock minimized windows to the bottom taskbar or restore/open them using the desktop quick-launch shortcuts. The taskbar also displays operator level, XP, and a real-time system clock.
- **Interactive AI Assistant Onboarding**: Welcomes new operators automatically, guiding them step-by-step through selecting a mission, using the terminal, reviewing telemetry, and submitting target flags.
- **Deep Sandbox & Telemetry Details**: Provides distinct tabs for Theory, Sandbox walkthroughs, Blue Team IDS telemetry logs, and secure code Remediation examples.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Vanilla CSS + Tailwind CSS 3
- **Animations**: Framer Motion 12
- **Terminal Emulator**: Xterm.js 6 (equipped with fit addons for dynamic resizing)
- **State Management**: Zustand 5

### Backend (Server)
- **Runtime**: Node.js
- **API Framework**: Express 5 + TSX execution
- **Database ORM**: Prisma 6
- **Database Engine**: PostgreSQL

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v20+ recommended)
- **PostgreSQL** running locally

---

### 1. Database Setup
Create a database named `cyber_academy` in your PostgreSQL instance.

---

### 2. Backend Configuration & Execution
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file (or update the existing one):
   ```env
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/cyber_academy?schema=public"
   JWT_SECRET="your_jwt_secret_key_here"
   PORT=3000
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Push the database schema:
   ```bash
   npx prisma db push
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

---

### 3. Frontend Configuration & Execution
1. Return to the project root:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser at `http://localhost:5173`.

---

## 📂 Project Structure

```
├── backend/                  # Express REST API Server
│   ├── prisma/               # Prisma schema & configs
│   ├── src/
│   │   ├── controllers/      # Route request controllers
│   │   ├── data/             # Static curriculum JSON database
│   │   ├── middleware/       # JWT Authentication middleware
│   │   ├── routes/           # Express router files
│   │   └── app.ts            # Express server initialization
│   └── .env                  # Backend environment variables
│
├── src/                      # Vite Frontend Application
│   ├── components/
│   │   └── Terminal/         # XTerm.js terminal window component
│   ├── context/              # React Authentication contexts
│   ├── pages/
│   │   ├── Auth/             # Register & Login page
│   │   └── Dashboard/        # Cyber-OS Desktop & Window manager page
│   ├── services/             # Axios API client integrations
│   └── main.tsx              # React entry file
│
├── tailwind.config.js        # Custom cyberpunk color tokens
└── package.json              # Main frontend configurations
```

---

## 🛡️ Security Assessment & Progress Contracts
Once you complete all lessons inside a curriculum tier (e.g., Beginner Tier), a flashing **📝 Fulfill Contract Report** button will appear in the curriculum menu. You must submit a structured security assessment report addressing:
1. The **core vulnerability** discovered.
2. The **exploitation methodology**.
3. The **recommended mitigation / remediation**.

Submitting this report awards **+200 XP**, issues a permanent badge, and unlocks the next curriculum tier!

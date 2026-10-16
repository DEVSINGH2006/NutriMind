# Frontend Module (React Technology)

This folder contains the complete modern React + TypeScript + Material UI user interface for the Smart Diet Plan Generator.

---

## 📂 Folder Structure

```
Frontend/
├── public/                    # Static assets, index.html, favicons, manifest
├── src/
│   ├── api/                   # API clients and mock handlers
│   ├── components/            # React UI components (Dashboard, DietPlan, Achievements, Progress, UserForm)
│   │   └── Auth/              # Authentication & login pages
│   ├── contexts/              # React Context state (UserContext, ProgressContext, NotificationContext)
│   ├── hooks/                 # Custom React hooks (useUserFormData)
│   ├── theme/                 # Material UI custom theme & styling
│   ├── types/                 # TypeScript interfaces and type declarations
│   ├── config.ts              # API configuration (http://localhost:5000)
│   ├── App.tsx                # Main application component & routes
│   └── index.tsx              # React DOM root entrypoint
├── package.json               # NPM package configuration
├── tsconfig.json              # TypeScript compiler settings
└── README.md                  # Documentation
```

---

## 🚀 Running the Frontend

### 1. Install Dependencies
```bash
cd Frontend
npm install
```

### 2. Start the Development Server
```bash
npm start
```

The application will launch automatically at:
[http://localhost:3000](http://localhost:3000)

---

## 🎨 Key Features & Technologies
- **React 18/19 & TypeScript**: Strong typing and robust component architecture.
- **Material UI (MUI v6)**: Rich cards, linear progress bars, chips, theme toggles.
- **Framer Motion**: Smooth page transitions and micro-interactions.
- **Context API**: Global state for user profile, authentication, and progress tracking.
- **REST Integration**: Talks to the Python Flask backend at `http://localhost:5000`.

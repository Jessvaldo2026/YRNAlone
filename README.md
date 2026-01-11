# 💜 YRNAlone - You aRe Not alone

Mental health & wellness app built with React + Firebase.

## ✅ Quick Start

```bash
npm install
npm run dev
```

That's it! The app will run at http://localhost:5173

## 📁 What's Inside

```
src/
├── App.jsx          # Main app (5,400+ lines, everything works)
├── main.jsx         # Entry point
├── firebase.js      # Firebase config
├── index.css        # Styles
│
├── enterprise/      # 🏢 Admin & Therapist dashboards (for later)
│   ├── AdminDashboard.jsx
│   ├── TherapistDashboard.jsx
│   ├── SessionNotes.jsx
│   ├── BillingManager.jsx
│   └── ...
│
├── services/        # 🔧 Backend services (for later)
│   ├── crisisService.js
│   ├── auditService.js
│   ├── analyticsService.js
│   └── ...
│
└── components/      # 🧩 Extra components (for later)
    ├── CompanionCustomizer.jsx
    ├── OnboardingFlow.jsx
    └── ...
```

## ✨ What Works NOW

The App.jsx is self-contained and includes:

- ✅ User authentication (login/signup)
- ✅ Support groups (11 groups)
- ✅ Mood tracking
- ✅ Journal entries
- ✅ Breathing exercises
- ✅ Themes (kawaii, goth, nature, etc.)
- ✅ Premium system with Stripe links
- ✅ Organization/enterprise access codes
- ✅ Multilingual support
- ✅ Companion system (buddy)
- ✅ Voice messages
- ✅ Crisis resources

## 🚫 What Was Removed

- ❌ Bouncing teddy bear that floated around the screen
- ❌ Random popup messages every 10 seconds
- ❌ Bouncing loading animation

The companion (buddy) feature still exists - it just doesn't bounce around annoyingly anymore.

## 🏢 Enterprise Features (For Later)

The files in `/enterprise` and `/services` are ready when you want to:

1. Add admin dashboards for organizations
2. Add therapist tools and session notes
3. Integrate crisis detection services
4. Add analytics and reporting

To integrate, you would import them into App.jsx.

## 💳 Stripe Payment Links

Already configured:
- Monthly: $6.99/month
- Yearly: $59.99/year (29% savings)

## 🔥 Firebase

Project: yrnalone-1cc5e

Already set up for:
- Authentication
- Firestore database
- User profiles

---

Made with 💜 by Jess

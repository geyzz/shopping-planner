# Plan_.ed

<p align="center">
  <img src="./assets/images/plan_ed-logo.jpg" alt="Plan_.ed Logo" width="120" />
</p>

A mall-connected shopping and errand planner mobile application built with React Native and Expo.

---

## Features

- **Shopping Lists**: Create, manage, and check off items with quantities and units.
- **Mall & Store Directory**: Link items directly to local shopping malls (SM City Clark, Marquee Mall, Nepo Mall, Newpoint Mall) and specific shops.
- **Cost Estimation**: Automatic running total calculations with formatted currency (`₱0,000.00`).
- **Calendar & Reminders**: Schedule shopping trips with native device notifications and alarms.
- **Offline & Cloud Sync**: Local-first caching via AsyncStorage with cloud database sync via Supabase.
- **Theming**: Dark and Light mode support with adaptive safe-area layouts.

---

## Tech Stack

- **Framework**: React Native (v0.86.3), Expo (SDK 57), Expo Router
- **Languages**: JavaScript (JSX), SQL
- **Backend & Database**: Supabase (PostgreSQL, Authentication, Row-Level Security)
- **Local Storage**: AsyncStorage
- **APIs & Services**: Expo Notifications API, Supabase REST API
- **Core Algorithms & Logic**:
  - Offline-first cache-and-network synchronization
  - Real-time budget aggregation and price calculation
  - Date-based reminder scheduling

---

## How to Run

### Development (Expo)

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on Android, or press `a` for Android Emulator / `w` for Web.

### Standalone APK (EAS Build)

```bash
npx eas-cli@latest build --platform android --profile preview
```

Download and install the generated `.apk` directly onto your Android device.

---

## Project Structure

```text
plan_ed/
├── assets/images/       # App logo, icons, and mall assets
├── src/
│   ├── app/             # Screens & Expo Router navigation
│   ├── components/      # UI components (atoms, molecules, organisms)
│   ├── lib/             # Supabase client, offline storage, notifications
│   └── theme/           # Colors, typography, and theme provider
├── app.json             # Expo app configuration
├── eas.json             # EAS build profiles
└── package.json         # Dependencies & scripts
```

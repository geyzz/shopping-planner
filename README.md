# Plan_.ed

<p align="center">
  <img src="./assets/images/plan_ed_banner.png" alt="Plan_.ed Logo" width="340" />
</p>

<p align="center">
  <a href="https://expo.dev/accounts/geyzz/projects/plan_ed/builds/7ab10b7e-9481-4a03-a32b-5c72b10bc365"><img src="https://img.shields.io/badge/Android_APK-Download-34A853?logo=android&logoColor=white" alt="Download APK" /></a>
  <a href="AI-USAGE.md"><img src="https://img.shields.io/badge/AI_Assisted-Claude-4F46E5" alt="AI Assisted" /></a>
  <img src="https://img.shields.io/badge/Expo-SDK_57-black?logo=expo" alt="Expo SDK" />
</p>

A smart, mall-connected shopping and errand planner mobile app built with React Native and Expo. Plan your shopping trips, organize checklists by store, estimate costs, and schedule reminder alarms.

---

## App Showcase

<p align="center">
  <img src="./assets/screenshots/mall_and_budget.jpg" width="220" alt="4 Malls Directory & Cost Estimation" />
  &nbsp;&nbsp;
  <img src="./assets/screenshots/home_dashboard.jpg" width="220" alt="Home Dashboard" />
  &nbsp;&nbsp;
  <img src="./assets/screenshots/errand_calendar.jpg" width="220" alt="Errand Calendar" />
</p>

<p align="center">
  <img src="./assets/screenshots/sort_and_order.jpg" width="220" alt="Sorting & Filtering" />
  &nbsp;&nbsp;
  <img src="./assets/screenshots/multi_select_delete.jpg" width="220" alt="Batch Multi-Select Mode" />
  &nbsp;&nbsp;
  <img src="./assets/screenshots/collapsible_header.jpg" width="220" alt="Collapsible Header" />
</p>

---

## Features

- **Smart Checklists**: Create shopping lists with quantities, store assignments, categories, and real-time cost calculation.
- **Mall Directory**: Link shopping items to 4 major Pampanga malls (SM City Clark, MarQuee Mall, Nepo Mall, Newpoint Mall) and specific retail stores.
- **Errand Calendar**: Schedule shopping dates and track upcoming trips on an interactive calendar.
- **Reminder Alarms**: Set native device alarms and notifications for planned shopping trips.
- **Cloud & Offline Sync**: Powered by Supabase (PostgreSQL with Row-Level Security) with offline local caching via AsyncStorage.
- **Light & Dark Theme**: Full theme support matching system appearance.

---

## Tech Stack

- **Framework**: React Native, Expo (SDK 57), Expo Router
- **Backend & Database**: Supabase (PostgreSQL, Authentication, RLS)
- **Local Storage**: AsyncStorage
- **Notifications**: Expo Notifications
- **Build**: EAS Build (Android APK)

---

## Getting Started

### Download APK
Download the Android app directly: [**Plan_.ed v1.0.0 APK (Latest Build)**](https://expo.dev/accounts/geyzz/projects/plan_ed/builds/7ab10b7e-9481-4a03-a32b-5c72b10bc365)

### Run in Development

```bash
npm install
npx expo start
```

Scan the QR code using **Expo Go** on Android, or press `a` for Android Emulator.

---

## Project Structure

```text
plan_ed/
├── AI-USAGE.md          # AI disclosure and rubric documentation
├── assets/              # App banners, launcher icons, store images
├── src/
│   ├── app/             # Screens & Expo Router navigation
│   ├── components/      # UI components (atoms, molecules, organisms)
│   ├── lib/             # Supabase client, storage cache, notifications
│   └── theme/           # Color palettes and theme context
├── app.json             # Expo configuration
└── eas.json             # EAS build profiles
```

---

> **AI Disclosure**: This project was built with AI pair-programming assistance from Claude (Anthropic). All core UI components, database architecture, and bug fixes were authored by the developer. See [AI-USAGE.md](AI-USAGE.md) for full records.

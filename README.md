# Plan_.ed

<p align="center">
  <img src="./assets/images/plan_ed_banner.png" alt="Plan_.ed Logo" width="400" />
</p>

<p align="center">
  <a href="PASTE_YOUR_APK_LINK_HERE">
    <img src="https://img.shields.io/badge/Download-Android_APK-success?style=for-the-badge&logo=android" alt="Download Android APK" />
  </a>
  <a href="AI-USAGE.md">
    <img src="https://img.shields.io/badge/Made_with-AI_assistance-blue?style=for-the-badge" alt="Made with AI" />
  </a>
</p>

> 📲 **Download the App**: [Click here to download Plan_.ed Android APK (v1.0.0)](PASTE_YOUR_APK_LINK_HERE) *(Replace with your EAS APK URL or GitHub Release link)*

> **AI Disclosure**: This project was built with AI pair-programming assistance from Claude (Anthropic). Frontend interface components, responsive design, database modeling, and bug corrections were authored by the developer. For full attribution and development records, see [AI-USAGE.md](AI-USAGE.md).

---

## About the Application

**Plan_.ed** is a smart, mall-connected shopping and errand planner mobile application designed for shoppers and busy individuals. It streamlines errand planning by linking shopping items directly to local malls and stores, providing automatic cost estimations in Philippine Peso, and scheduling native device reminder alarms.

### What the Application Consists Of

1. **Home & Notes Dashboard (`src/app/screens/home.jsx`)**:
   - Displays all user shopping lists in an adaptive two-column grid.
   - Features a smooth, scroll-driven collapsible header that cleanly transitions the greeting banner and search bar into compact header icons.
   - Supports live search, multi-criteria sorting (Date Created, Last Opened, Ascending/Descending), and bulk selection for deletion.

2. **List & Item Editor (`src/app/screens/create_edit.jsx`)**:
   - Create and edit shopping lists with custom titles, color accents, and notes.
   - Add checklist items with quantity counts, units (pcs, kg, packs, etc.), and category tags.
   - Assign items to specific stores with estimated unit prices.
   - Calculates automatic running totals formatted in standard currency (`₱0,000.00`).

3. **Mall & Store Directory Integration**:
   - Connects items to local shopping malls (SM City Clark, Marquee Mall, Nepo Mall, Newpoint Mall).
   - Links items to department stores, supermarkets, pharmacies, and specialty shops for efficient one-stop shopping routes.

4. **Calendar & Errand Scheduler (`src/app/screens/calendar.jsx`)**:
   - Monthly calendar interface that highlights dates with scheduled shopping trips.
   - Selecting a date filters errands and lists planned for that specific day.
   - Configures date and time alarms via platform-native date/time pickers.

5. **Notification System (`src/app/screens/notif.jsx`)**:
   - Schedules exact native device reminder alarms via Expo Notifications (`SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`).
   - Dedicated notification screen to view upcoming and active reminders.

6. **Authentication & Profile Management (`src/app/auth/*`, `src/app/screens/settings.jsx`)**:
   - Email and password sign-up and sign-in powered by Supabase Authentication.
   - Email verification flow with deep linking to a dedicated confirmation screen (`src/app/auth/verified.jsx`).
   - Profile avatar uploading and camera gallery integration (`expo-image-picker`).
   - Row-Level Security (RLS) ensuring users only access their own private lists.

7. **Offline-First Storage Engine (`src/lib/lists_storage.js`)**:
   - Stale-While-Revalidate caching via `@react-native-async-storage/async-storage`.
   - Loads lists instantly from local device storage on launch, syncing with Supabase PostgreSQL in the background.

8. **Theme Engine & Safe-Area Layouts (`src/theme/*`)**:
   - Complete Light and Dark mode theming supporting system preferences.
   - Dynamic edge-to-edge layout handling for device notches, camera cutouts, and navigation bars (`react-native-safe-area-context`).

---

## Tech Stack

- **Framework**: React Native (v0.86.3), Expo (SDK 57), Expo Router
- **Languages**: JavaScript (JSX), SQL, TypeScript (schemas)
- **Backend & Database**: Supabase (PostgreSQL, Authentication, Row-Level Security)
- **Local Storage**: AsyncStorage (client-side offline cache)
- **Notifications**: Expo Notifications (`expo-notifications`)
- **Native Device APIs**: Expo Image Picker, DateTimePicker, Safe Area Context
- **Build System**: EAS Build (Expo Application Services)

---

## How to Run

### Development (Expo Go)

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on Android, or press `a` for Android Emulator / `w` for Web.

### Standalone Android APK (EAS Build)

> 📲 **Download Link**: [Download Plan_.ed v1.0.0 APK](PASTE_YOUR_APK_LINK_HERE) *(Replace this placeholder with the public URL from your EAS Build or GitHub Releases)*

To generate a new build from source:

```bash
npx eas-cli@latest build --platform android --profile preview
```

Download and install the generated `.apk` directly onto any Android device.

---

## Project Structure

```text
plan_ed/
├── AI-USAGE.md          # AI disclosure, rubric evidence, and author attribution
├── assets/images/       # App logo, launcher icons, and mall directory photos
├── src/
│   ├── app/             # Screens & Expo Router navigation routes
│   │   ├── auth/        # Login, Signup, and Email Verified screens
│   │   └── screens/     # Home, Calendar, Create/Edit, Settings, Notifications
│   ├── components/      # Atomic UI design system (atoms, molecules, organisms)
│   ├── lib/             # Supabase client, offline caching, notifications
│   └── theme/           # Colors, typography, and theme provider
├── app.json             # Expo app configuration & native permissions
├── eas.json             # EAS build profiles (APK preview)
└── package.json         # Dependencies & scripts
```

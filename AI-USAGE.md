# AI-USAGE.md — Plan_.ed

This document discloses and documents the use of AI assistance in the development of **Plan_.ed**, in accordance with the *Builds Full-Stack JavaScript and AI* assessment rubric.

---

## 1. How I Used AI (35 points)

I utilized **Claude (Anthropic / Claude 3.5 Sonnet)** as an interactive pair-programming assistant for architecture discussions, code reviews, and resolving implementation challenges. Below are six documented instances of AI usage across the project:

### Entry 1: Form Validation & Authentication Error Handling
- **Date & Tool**: October 7, 2026 — Claude (Anthropic)
- **What I asked for**: Implement robust input validation for login and sign-up forms, including email regex matching, password confirmation, terms agreement, and user-friendly error banners.
- **What it gave back**: Validation helper functions, error state hooks in `login.jsx` and `signup.jsx`, and inline error displays for `FormField` components.
- **What I kept, changed, and why**: Kept the regex validation and Supabase auth error parsing; customized the button styling to adhere to the gold/navy theme and added onBlur validation triggers for a smoother user experience.
- **Commit Link**: [Commit `25c572e`](https://github.com/geyzz/shopping-planner/commit/25c572e)

### Entry 2: Scheduled Reminder Notifications & Settings Integration
- **Date & Tool**: October 7, 2026 — Claude (Anthropic)
- **What I asked for**: Set up device notification alarms for shopping list schedules using Expo Notifications, with a toggle switch in Settings and a dedicated notifications screen.
- **What it gave back**: A notification utility module (`src/lib/notifications.js`) with Android notification channel setup, exact alarm permissions, and a notifications screen (`src/app/screens/notif.jsx`).
- **What I kept, changed, and why**: Kept the core notification scheduling logic; refined the notification bell badge count in the header and adjusted the visual styling of notification cards.
- **Commit Link**: [Commit `3f4ce02`](https://github.com/geyzz/shopping-planner/commit/3f4ce02)

### Entry 3: Offline-First Local Storage & Caching
- **Date & Tool**: October 8, 2026 — Claude (Anthropic)
- **What I asked for**: Implement offline caching so shopping lists load instantly from device storage even without an active internet connection.
- **What it gave back**: A storage helper module (`src/lib/lists_storage.js`) using `@react-native-async-storage/async-storage` implementing a Stale-While-Revalidate caching pattern.
- **What I kept, changed, and why**: Kept the cache serialization and Supabase fallback queries; customized error recovery so cached lists load immediately on startup without blocking the user.
- **Commit Link**: [Commit `0ab44a3`](https://github.com/geyzz/shopping-planner/commit/0ab44a3)

### Entry 4: Database Seed Scripts & Currency Formatting
- **Date & Tool**: October 8, 2026 — Claude (Anthropic)
- **What I asked for**: Create SQL migration scripts for local malls, store directories, and grocery items, and format calculated totals into Philippine Peso.
- **What it gave back**: SQL insertion scripts for shopping malls and shops, along with a number formatter utility.
- **What I kept, changed, and why**: I reviewed and customized the database structure, ensured real local malls (SM City Clark, Marquee Mall, Nepo Mall, Newpoint Mall) were accurately represented, and formatted prices into `₱0,000.00` with proper comma separation.
- **Commit Link**: [Commit `5e70ae7`](https://github.com/geyzz/shopping-planner/commit/5e70ae7)

### Entry 5: EAS Standalone Android APK Build Configuration
- **Date & Tool**: October 8, 2026 — Claude (Anthropic)
- **What I asked for**: Configure Expo Application Services (EAS) to build a standalone installable Android `.apk` file instead of an `.aab` Google Play bundle.
- **What it gave back**: Configuration in `eas.json` adding an Android preview profile with `"buildType": "apk"`.
- **What I kept, changed, and why**: Kept the build profile configuration; verified and preserved the project credentials and slug in `app.json` for cloud build compatibility.
- **Commit Link**: [Commit `5d4236d`](https://github.com/geyzz/shopping-planner/commit/5d4236d)

### Entry 6: Scroll-Driven Collapsing Header & Toolbar
- **Date & Tool**: October 9, 2026 — Claude (Anthropic)
- **What I asked for**: Create a collapsible header on the home screen that smoothly hides the greeting banner and search bar when scrolling, revealing search and menu icons in the top bar.
- **What it gave back**: `Animated.event` scroll tracking with interpolations driving header action buttons and toolbar collapse.
- **What I kept, changed, and why**: Caught a major scroll jitter bug where the AI attempted to animate layout height inside a `FlatList`; guided the refactoring to use non-layout `opacity` and `scale` transitions for butter-smooth 60 FPS scrolling.
- **Commit Link**: [Commit `f176920`](https://github.com/geyzz/shopping-planner/commit/f176920)

---

## 2. Where the AI Got It Wrong (25 points)

Taking AI code blindly leads to broken user experiences. Below are three critical instances where the AI generated incorrect, bugged, or invalid code that I caught and resolved:

### 1. Collapsing Header Layout Jitter inside FlatList
- **What it gave**: The AI attempted to collapse the greeting banner and search toolbar by animating `height` (`48 -> 0`), `maxHeight` (`110 -> 0`), and vertical margins inside `renderListHeader` while the user scrolled.
- **What was wrong**: In React Native, dynamically resizing layout dimensions of items inside a `FlatList` while actively dragging forces the Yoga layout engine to re-measure all list items on every frame. This triggered an infinite feedback loop where the list shifted, firing new scroll events, causing the note cards to vibrate and jitter violently.
- **What I did instead**: I diagnosed the jitter and directed the AI to eliminate all layout-altering height and margin animations. We replaced them with non-layout `opacity` (1 ➔ 0) and subtle `scale` transitions, keeping container dimensions stable so the cards scroll with native smoothness.
- **Commit Link**: [Commit `f176920`](https://github.com/geyzz/shopping-planner/commit/f176920)

### 2. Asset Schema Validation Failure in `app.json` (JPG vs PNG)
- **What it gave**: The AI configured `"icon"`, `"android.adaptiveIcon.foregroundImage"`, and `"web.favicon"` in `app.json` pointing to a `.jpg` image (`./assets/images/plan_ed-logo.jpg`).
- **What was wrong**: Expo schema validation strictly requires app launcher icons and Android adaptive foreground icons to be in `.png` format. When running `expo-doctor` and the cloud EAS Gradle APK build, the build process failed with asset validation errors (`field should point to .png image but file has type jpg`).
- **What I did instead**: Caught the schema errors via `npx expo-doctor`, verified the available graphic assets in `assets/images/`, and updated `app.json` to reference the correct 1024x1024 PNG files (`icon.png`, `android-icon-foreground.png`, `favicon.png`), restoring 21/21 passing checks.
- **Commit Link**: [Commit `c4af20e`](https://github.com/geyzz/shopping-planner/commit/c4af20e)

### 3. Bottom Padding Overwritten in `ListGrid`
- **What it gave**: In `src/components/organisms/list_grid.jsx`, the AI placed `{...rest}` *after* the `contentContainerStyle` declaration array on the `FlatList`.
- **What was wrong**: When `home.jsx` passed `contentContainerStyle={{ minHeight: screenHeight + 120 }}` via `...rest`, it completely replaced and discarded the component's internal `paddingBottom: bottomPadding`. As a result, bottom padding was wiped down to 0, causing the bottom-most list cards to render behind the floating bottom navigation bar, making them unclickable.
- **What I did instead**: Identified the JSX prop precedence bug, moved `contentContainerStyle` to appear *after* `{...rest}`, and merged `{ paddingBottom: bottomPadding, flexGrow: 1 }` as the final array element so the cards always scroll safely above the navigation bar.
- **Commit Link**: [Commit `4937bfb`](https://github.com/geyzz/shopping-planner/commit/4937bfb)

---

## 3. Who Wrote What (30 points)

To satisfy the 80/20 rule, a significant portion of this project consists of code, architecture, and design that I created and directed myself:

### What I Wrote Myself:

1. **Frontend User Interfaces & Component Architecture**:
   - **Files**: `src/app/screens/home.jsx`, `src/app/screens/calendar.jsx`, `src/app/screens/create_edit.jsx`, `src/app/screens/settings.jsx`, `src/components/atoms/*`, `src/components/molecules/*`, `src/components/organisms/bottom_nav.jsx`.
   - **Explanation**: I designed the mobile-first layouts, screen hierarchy, and design system. I established the color palette (Navy `#1B2A4A`, Gold `#D4AF37`, Warm Cream `#D6CDAC`), card elevations, typography scales, safe-area insets, and responsive screen sizing across diverse Android device dimensions. I structured the component hierarchy (atoms, molecules, organisms) to keep UI elements modular and maintainable.
   - **Commits**: [Commit `ae66e87`](https://github.com/geyzz/shopping-planner/commit/ae66e87), [Commit `371ffe4`](https://github.com/geyzz/shopping-planner/commit/371ffe4).

2. **Database Structure, Store Directories & Pricing**:
   - **Files**: `supabase/migrations/*`, database seed data, and schema definitions.
   - **Explanation**: I designed the relational schema connecting malls, shops, item categories, items, and shopping lists in PostgreSQL/Supabase. I curated the real-world shopping directory for local malls in Pampanga (SM City Clark, Marquee Mall, Nepo Mall, Newpoint Mall), associating specific stores and price estimations with items. I also established the currency formatting logic (`₱0,000.00`) to reflect local Philippine Peso standards.
   - **Commits**: [Commit `ef2be58`](https://github.com/geyzz/shopping-planner/commit/ef2be58), [Commit `5e70ae7`](https://github.com/geyzz/shopping-planner/commit/5e70ae7).

3. **Interactive Navigation & State Architecture**:
   - **Files**: `src/app/_layout.tsx`, `src/app/auth/*`, `src/theme/ThemeContext.js`.
   - **Explanation**: I configured the Expo Router file-based navigation, modal sheet interactions, theme provider, and multi-select deletion flows. When features broke or showed jitter under real-device testing, I diagnosed the root causes, tested edge cases, and drove the architectural fixes.

---

### The AI-Written Code I Understand Best:

**The Scroll-Driven Collapsing Header & Action Reveal System (`src/app/screens/home.jsx`)**:
- **Commit**: [Commit `f176920`](https://github.com/geyzz/shopping-planner/commit/f176920)
- **Explanation**:
  - **How it works**:
    - The implementation binds an `Animated.event` listener to the `FlatList`'s vertical scroll offset (`scrollY`) with `{ useNativeDriver: false }`.
    - It maps this single numeric scroll value into clamped interpolations across three coordinated stages:
      1. Between `scrollY = 0` and `50`: The `GreetingBanner` smoothly interpolates its `opacity` from `1` down to `0` and slightly scales down to `0.96`.
      2. Between `scrollY = 40` and `90`: The search bar and 3-dots options menu in the body toolbar interpolate their `opacity` from `1` down to `0`.
      3. Between `scrollY = 50` and `100`: The compact search and options action buttons in the pinned top header expand their width from `0` to `headerHeight` (`~42px`) and fade their `opacity` from `0` up to `1`.
  - **Why we kept it and why it is built this way**:
    - When the user first opens the app, the prominent greeting banner and accessible search bar welcome the user and offer immediate search functionality.
    - As the user scrolls down through multiple shopping lists, screen real estate is preserved by smoothly fading away the large banner and search bar, while keeping search and sorting accessible through the compact header buttons pinned at the top.
    - Most importantly, we intentionally animate **non-layout properties** (`opacity` and `transform: [{ scale }]`) rather than layout dimensions (`height` or `margin`). Animating layout properties in React Native causes Yoga layout recalculations on every frame, which produces severe card jitter. By driving only visual opacity and scale, the scroll maintains rock-solid layout stability and smooth 60 FPS performance.

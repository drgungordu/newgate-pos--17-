# Newgate POS - Android Project

This directory contains the canonical Capacitor Android project for Newgate POS.

### Opening in Android Studio
1. Open Android Studio.
2. Select **Open** and navigate directly to:
   ```
   newgate-pos/android
   ```
   *(Do NOT open the root repository directory; open `/android`)*

### Project Configuration
- **Application ID:** `com.newgate.pos`
- **Run Configuration:** `app`
- **Main Activity:** `com.newgate.pos.MainActivity`
- **Min SDK:** 24
- **Target SDK:** 34
- **Compile SDK:** 34
- **Java / Kotlin Version:** Java 17

### Building Assets from Web
From the root directory:
```bash
npm run build
npx cap sync android
```
Then run the `app` target from Android Studio.

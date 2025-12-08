# Firebase Authentication Setup Guide

## Step 1: Install Firebase SDK

```bash
npm install firebase
```

If you get permission errors, try:
```bash
sudo chown -R $(whoami) ~/.npm
npm install firebase
```

## Step 2: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ > **Project Settings**
4. Scroll down to **Your apps** section
5. If you haven't added a web app, click **Add app** > Web (</> icon)
6. Copy the config values (apiKey, authDomain, etc.)

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

**OR** edit `src/firebase/config.js` directly and replace the placeholder values.

## Step 4: Enable Authentication Methods

In Firebase Console:
1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** (click and toggle "Enable")
3. Enable **Google** (click, toggle "Enable", and add your project support email)

## Step 5: Set Up Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click **Create database**
3. Start in **test mode** (for development) or production mode
4. Choose a location close to your users

### Firestore Security Rules (for production)

In Firestore > Rules, use:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 6: Build and Deploy

```bash
npm run build
firebase deploy
```

## Features Implemented

✅ **Email/Password Authentication** - Users can sign up and sign in  
✅ **Google Sign-In** - One-click Google authentication  
✅ **Session Persistence** - Login saved between browser sessions  
✅ **State Selection** - Users can select their home state  
✅ **Golden Highlight** - User's state highlighted in gold on the chart  
✅ **User Menu** - Profile menu with state selection and logout  
✅ **Firestore Storage** - User preferences saved to database  

## How It Works

1. **Login**: Users can sign in with email/password or Google
2. **State Selection**: After login, users click their profile menu to select their state
3. **Golden Highlight**: The selected state appears with:
   - Gold bar color (#FFD700)
   - Gold border around the state row
   - Star icon (⭐) next to the state name
   - Subtle glow effect
4. **Persistence**: State preference saved to Firestore and localStorage, persists across sessions


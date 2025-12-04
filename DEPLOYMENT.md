# Deployment Guide

## To deploy your React app to Firebase:

### 1. Build the project first:
```bash
npm run build
```

This creates/updates the `dist` folder with all your built files, including the CSV data.

### 2. Verify the build:
- Check that `dist/index.html` exists
- Check that `dist/transportation-data.csv` exists (should be ~19MB)
- Check that `dist/assets/` folder has your JS and CSS files

### 3. Deploy to Firebase:
```bash
firebase deploy
```

Or if you need to initialize Firebase first:
```bash
firebase login
firebase init
# Select: Hosting
# Public directory: dist
# Single-page app: Yes
# Set up automatic builds: No (or Yes if you prefer)
```

### 4. The firebase.json is already configured to:
- Serve files from the `dist` folder
- Route all requests to `index.html` (for React Router compatibility)
- Ignore node_modules and other unnecessary files

### Important Notes:
- **Always run `npm run build` before deploying** - Firebase serves the built files, not your source code
- The CSV file in `public/` will automatically be copied to `dist/` during the build
- If you make changes, rebuild before redeploying


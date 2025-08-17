# Bitezy Food Ordering App - Deployment Guide

## 🚀 Quick Deploy to Firebase Hosting

### Prerequisites
1. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Account** and project "bitez-930cc" set up

3. **Node.js** (v14 or higher) and npm

### Step 1: Login to Firebase
```bash
firebase login
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build the App
```bash
npm run build
```

### Step 4: Deploy to Firebase Hosting
```bash
npm run deploy
```

Or manually:
```bash
firebase deploy --only hosting
```

## 🌐 Alternative Deployment Options

### Option 1: Firebase Hosting (Recommended)
- **Pros**: Free, fast, integrated with Firebase services
- **Cons**: Limited to Firebase ecosystem
- **Best for**: Production apps using Firebase

### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=build
```

### Option 3: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 4: GitHub Pages
```bash
# Add to package.json scripts
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# Install gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

## 🔧 Environment Configuration

### Firebase Configuration
The app is already configured with your Firebase project "bitez-930cc". If you need to change it:

1. Update `src/firebase/config.js` with new credentials
2. Update `.firebaserc` with new project ID
3. Update `firebase.json` if needed

### Environment Variables (Optional)
Create a `.env` file for sensitive data:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 📱 PWA Features

The app includes:
- ✅ Responsive design for mobile and desktop
- ✅ Offline capability (basic)
- ✅ Fast loading with optimized assets
- ✅ Modern UI with smooth animations

## 🧪 Testing Before Deployment

### Local Testing
```bash
# Start development server
npm start

# Build and test locally
npm run build
npm run serve
```

### Build Verification
```bash
# Check for build errors
npm run build

# Test production build locally
npx serve -s build -l 3000
```

## 🚨 Common Issues & Solutions

### Issue: Build Fails
**Solution**: Check for syntax errors and missing dependencies
```bash
npm install
npm run build
```

### Issue: Firebase Deploy Fails
**Solution**: Ensure you're logged in and project is correct
```bash
firebase login
firebase use bitez-930cc
firebase deploy
```

### Issue: App Not Loading After Deploy
**Solution**: Check Firebase hosting configuration and routing
- Verify `firebase.json` has correct rewrite rules
- Ensure all routes redirect to `index.html`

## 📊 Performance Optimization

### Build Optimization
- ✅ Code splitting with React Router
- ✅ Optimized images and assets
- ✅ Minified CSS and JavaScript
- ✅ Gzip compression enabled

### Runtime Optimization
- ✅ Lazy loading of components
- ✅ Efficient state management
- ✅ Optimized Firebase queries
- ✅ Responsive image loading

## 🔒 Security Considerations

### Firebase Security Rules
Ensure your Firestore and Storage rules are properly configured:

```javascript
// Example Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /canteens/{canteenId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
  }
}
```

## 📈 Monitoring & Analytics

### Firebase Analytics
- User behavior tracking
- Performance monitoring
- Error reporting
- Custom events

### Performance Monitoring
- Core Web Vitals
- Loading times
- User interactions
- Error rates

## 🎯 Next Steps After Deployment

1. **Test all features** on the live site
2. **Monitor performance** using Firebase Analytics
3. **Set up error tracking** and monitoring
4. **Configure custom domain** if needed
5. **Set up CI/CD** for automated deployments

## 📞 Support

For deployment issues:
1. Check Firebase Console for errors
2. Verify build output in `build/` folder
3. Check browser console for runtime errors
4. Review Firebase hosting logs

---

**Happy Deploying! 🎉**

Your Bitezy app is now ready for the world to enjoy delicious food ordering!

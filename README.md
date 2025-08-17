# 🍽️ Bitezy - Food Ordering App

A modern, responsive food ordering application built with React and Firebase, designed for college canteens and food services.

## ✨ Features

### 🚀 Core Functionality
- **User Authentication**: Email/password and Google Sign-in
- **Canteen Management**: Browse and select from multiple canteens
- **Menu Browsing**: Search and filter food items by category
- **Shopping Cart**: Add, remove, and manage order items
- **Order Tracking**: Real-time order status updates
- **Admin Panel**: Comprehensive management for canteen owners and super admins

### 🎨 User Experience
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Modern UI**: Beautiful animations and smooth interactions
- **Real-time Updates**: Live order status and menu changes
- **Search & Filters**: Easy navigation through menus and canteens
- **Dark/Light Theme**: Customizable user interface

### 🔐 Role-Based Access Control
- **Regular Users**: Browse menus, place orders, track deliveries
- **Canteen Staff**: Manage menus, update order statuses
- **Admins**: Manage canteens, view analytics, moderate content
- **Super Admin**: Full system access, user management, canteen approval

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, customizable icons
- **React Router** - Client-side routing and navigation

### Backend & Services
- **Firebase Authentication** - Secure user management
- **Firestore Database** - Real-time NoSQL database
- **Firebase Storage** - Image and file storage
- **Firebase Analytics** - User behavior tracking

### Development Tools
- **Create React App** - Modern React development setup
- **ESLint** - Code quality and consistency
- **PostCSS & Autoprefixer** - CSS processing and optimization

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project setup

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd bitezy/client

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication, Firestore, and Storage
3. Update `src/firebase/config.js` with your Firebase credentials
4. Configure Firestore security rules

## 📱 App Structure

### Pages
- **HomePage** (`/`) - Welcome screen with canteen selection
- **MenuPage** (`/menu`) - Browse food items and add to cart
- **CartPage** (`/cart`) - Review and manage order items
- **OrderPage** (`/orders`) - Track order status and history
- **ProfilePage** (`/profile`) - User profile and settings
- **AdminPanel** (`/admin`) - Administrative functions

### Components
- **Layout** - Main app structure and navigation
- **UI Components** - Reusable UI elements (cards, buttons, forms)
- **Navigation** - Bottom navigation and routing
- **Contexts** - Global state management (auth, cart)

### Firebase Services
- **Authentication** - User login, registration, and session management
- **Firestore** - Data storage for users, canteens, menus, and orders
- **Storage** - Image uploads for food items and canteen logos
- **Analytics** - User behavior and app performance tracking

## 🔧 Configuration

### Firebase Setup
```javascript
// src/firebase/config.js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### Security Rules
Configure Firestore and Storage security rules in Firebase Console:

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

## 🚀 Deployment

### Firebase Hosting (Recommended)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and deploy
firebase login
npm run deploy
```

### Alternative Platforms
- **Netlify**: `netlify deploy --prod --dir=build`
- **Vercel**: `vercel --prod`
- **GitHub Pages**: `npm run deploy`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📊 Data Models

### Users
```javascript
{
  uid: "user-id",
  email: "user@example.com",
  displayName: "User Name",
  role: "user" | "admin" | "super_admin" | "canteen_staff",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Canteens
```javascript
{
  id: "canteen-id",
  name: "Canteen Name",
  description: "Description",
  location: "Location",
  imageURL: "image-url",
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Menu Items
```javascript
{
  id: "item-id",
  name: "Food Item",
  description: "Description",
  price: 10.99,
  category: "Main Course",
  imageURL: "image-url",
  isAvailable: true,
  canteenId: "canteen-id",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Orders
```javascript
{
  id: "order-id",
  userId: "user-id",
  canteenId: "canteen-id",
  items: [...],
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled",
  total: 25.99,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🧪 Testing

### Development Testing
```bash
# Start development server
npm start

# Build and test production build
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

## 🔒 Security Features

- **Authentication**: Secure user login and session management
- **Authorization**: Role-based access control for all features
- **Data Validation**: Input sanitization and validation
- **Secure Storage**: Firebase security rules for data protection
- **HTTPS**: Secure communication for all API calls

## 📈 Performance Features

- **Code Splitting**: Lazy loading of components and routes
- **Image Optimization**: Responsive images and lazy loading
- **Caching**: Efficient data caching and state management
- **Bundle Optimization**: Minified and compressed assets
- **PWA Ready**: Progressive Web App capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
1. Check the [Firebase Console](https://console.firebase.google.com/) for errors
2. Review the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
3. Check browser console for runtime errors
4. Review Firebase hosting logs

## 🎯 Roadmap

### Upcoming Features
- [ ] Push notifications for order updates
- [ ] Payment integration (Stripe, PayPal)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode improvements
- [ ] Social media integration

### Performance Improvements
- [ ] Service Worker for offline functionality
- [ ] Advanced caching strategies
- [ ] Image optimization and CDN
- [ ] Database query optimization

---

**Built with ❤️ using React and Firebase**

Your Bitezy app is now ready to revolutionize food ordering! 🚀

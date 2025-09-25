# LinkUp Client 🌟

## Overview

LinkUp Client is the frontend application of the LinkUp social networking platform - a modern, responsive web application built with React.js. It provides an intuitive and engaging user interface for social networking, connecting with friends, sharing content, and participating in live events.

## ✨ Key Features

- **Modern UI/UX**: Clean, responsive design with smooth animations
- **User Authentication**: Secure login and registration system
- **Profile Management**: Customizable user profiles with photo uploads
- **Social Networking**: Connect with friends and build your network
- **Real-time Chat**: Instant messaging with online status indicators
- **Event Management**: Create, join, and manage social events
- **Live Streaming**: Watch and participate in live streams
- **Content Sharing**: Share posts, photos, and updates
- **Search & Discovery**: Find users and events easily

## 🏗️ Project Structure

```
src/
├── api/              # API communication layer
│   └── server.js     # Axios configuration and API endpoints
├── assets/           # Static assets
├── components/       # Reusable React components
│   ├── ErrorBanner.jsx
│   ├── LoginForm.jsx
│   ├── ProfileCard.jsx
│   ├── PublicProfileCard.jsx
│   └── SignupForm.jsx
├── pages/           # Main application pages
│   ├── Connections.jsx
│   ├── Home.jsx
│   ├── Profile.jsx
│   ├── PublicProfile.jsx
│   ├── SearchBuddy.jsx
│   └── Signup.jsx
├── stores/          # State management
│   ├── authStore.js    # Authentication state
│   ├── mockUsers.json  # Mock data for development
│   └── uiStore.js      # UI state management
├── App.css          # Global styles
├── App.jsx          # Main application component
├── index.css        # Root styles
└── main.jsx         # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- LinkUp Server running locally or deployed

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd linkup-client
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_NAME=LinkUp
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📱 Application Pages

### Authentication

- **Login Page**: User authentication with email/password
- **Signup Page**: New user registration with form validation

### Main Application

- **Home Page**: Dashboard with activity feed and quick actions
- **Profile Page**: User's personal profile with edit capabilities
- **Public Profile**: View other users' public profiles
- **Connections**: Manage friend requests and connections
- **Search Buddy**: Discover and connect with new users

## 🎨 UI Components

### Core Components

- **ErrorBanner**: Display error messages with auto-dismiss
- **LoginForm**: Authentication form with validation
- **SignupForm**: Registration form with real-time validation
- **ProfileCard**: User profile display component
- **PublicProfileCard**: Public-facing profile component

### Features

- Responsive design for mobile and desktop
- Loading states and error handling
- Form validation with user feedback
- Image upload with preview
- Real-time updates

## 🛠️ Technologies Used

- **Frontend Framework**: React.js 18+ with Vite
- **Routing**: React Router Dom
- **State Management**: Custom stores with React hooks
- **HTTP Client**: Axios for API communication
- **Styling**: CSS3 with modern features
- **Build Tool**: Vite for fast development and building
- **Development**: ESLint for code quality

## 🔄 State Management

### Auth Store (`authStore.js`)

Manages user authentication state:

- User login/logout
- Authentication token storage
- User profile data
- Login status persistence

### UI Store (`uiStore.js`)

Handles UI-related state:

- Loading states
- Error messages
- Modal visibility
- Theme preferences

## 🌐 API Integration

The client communicates with the LinkUp Server through a centralized API layer:

```javascript
// Example API calls
- POST /auth/login - User authentication
- GET /users/profile - Fetch user profile
- POST /connections/send - Send friend request
- GET /events - Fetch events list
- POST /upload - Upload user media
```

## 📐 Responsive Design

The application is fully responsive with:

- Mobile-first design approach
- Flexible grid layouts
- Optimized images and media
- Touch-friendly interface elements
- Cross-browser compatibility

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

```

## 🎯 Performance Optimizations

- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Optimization**: Lazy loading and responsive images
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Service worker for offline functionality
- **State Optimization**: Efficient state updates and renders

## 🔐 Security Features

- JWT token handling with automatic refresh
- Input sanitization and validation
- Protected routes requiring authentication
- Secure file upload handling
- HTTPS enforcement in production

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

**LinkUp Client** - Where connections come alive ✨

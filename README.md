# Agriculture Data Collection App

A React Native app built with Expo and NativeWind for collecting agricultural data with offline-first capabilities, automatic sync functionality, and secure authentication.

## Features

### Core Features
- **Secure Authentication**: Login system with JWT token-based authentication
- **Data Collection Form**: Collect agricultural data including farmer name, location, crop type, land size, irrigation method, and collection date
- **Offline-First Storage**: All data is stored locally using AsyncStorage, ensuring the app works without internet connectivity
- **Data Viewing**: View all collected data with sync status indicators (synced/pending)
- **Automatic Sync**: When internet becomes available, the app automatically syncs pending data to the server

### Technical Features
- **JWT Authentication**: Secure token-based authentication with automatic token management
- **Tab Navigation**: Bottom tab navigation with Home, Statistics, Profile, and Settings tabs
- **React Navigation**: Smooth navigation between login, data collection, and tab screens
- **Background Sync**: Monitors internet connectivity and syncs data automatically
- **Retry Mechanism**: Failed sync attempts are retried with exponential backoff
- **Status Indicators**: Visual indicators show sync status for each record
- **Pull-to-Refresh**: Refresh data list with pull-to-refresh gesture
- **User Session Management**: Persistent login sessions with secure token storage
- **Statistics Dashboard**: Comprehensive analytics and data insights
- **Settings Management**: Configurable app settings and preferences

## Data Model

The app collects the following agricultural data:
```typescript
{
  farmerName: string;
  location: string;
  cropType: string;
  landSize: number; // in acres
  irrigationMethod: string;
  dateCollected: string; // ISO date
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## API Integration

### Authentication
**Login Endpoint**: `POST https://tourism.ettelerp.com/api/method/scope.mfun.doctype.dfun.dfun.login_dfun`

**Login Payload**:
```json
{
  "identifier": "solo",
  "passwordm": "1234"
}
```

**Login Response**:
```json
{
  "message": {
    "status": "success",
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "name": "mf68f5gq5s",
      "user_name": "solo",
      "emailm": "solomon@gmail.com",
      "doctype": "dfun"
    }
  }
}
```

### Data Sync
**Sync Endpoint**: `POST https://example.com/api/sync`
**Health Check**: `GET https://example.com/api/health`

All API requests include the JWT token in the Authorization header: `Bearer <token>`

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on device/simulator:
```bash
npm run android  # for Android
npm run ios      # for iOS
```

## Project Structure

```
├── App.tsx                          # Main app component
├── navigation/
│   ├── AppNavigator.tsx            # Main navigation setup
│   └── TabNavigator.tsx            # Bottom tab navigation
├── screens/
│   ├── DataCollectionScreen.tsx    # Data collection form
│   ├── LoginScreen.tsx             # Authentication screen
│   └── tabs/
│       ├── HomeTabScreen.tsx       # Home tab with data list
│       ├── StatisticsTabScreen.tsx # Statistics and analytics
│       ├── ProfileTabScreen.tsx    # User profile and account
│       └── SettingsTabScreen.tsx   # App settings and preferences
├── services/
│   ├── storage.ts                  # Local storage service
│   ├── sync.ts                     # Sync service with retry
│   ├── auth.ts                     # Authentication service
│   └── backgroundSync.ts           # Background sync & connectivity
├── contexts/
│   └── AuthContext.tsx             # Authentication context
├── types/
│   ├── agriculture.ts              # Agriculture data types
│   └── auth.ts                     # Authentication types
└── components/                     # Reusable components
    ├── ConnectivityStatus.tsx      # Network status indicator
    └── TabIcon.tsx                 # Tab navigation icons
```

## Usage

1. **Login**: Enter your credentials (demo: solo/1234) to access the app
2. **Home Tab**: View all collected data with sync status indicators
3. **Collect Data**: Tap "Add Data" to open the collection form
4. **Fill Form**: Enter farmer details, crop information, and land size
5. **Save**: Data is saved locally and marked as pending sync
6. **Statistics Tab**: View comprehensive analytics and data insights
7. **Profile Tab**: Manage your account and view user statistics
8. **Settings Tab**: Configure app settings and sync preferences
9. **Automatic Sync**: When online, data syncs automatically in the background
10. **Manual Sync**: Tap "Sync Now" to manually trigger sync
11. **Logout**: Tap "Logout" to securely sign out of the app

## Offline Capabilities

- All data is stored locally using AsyncStorage
- App works completely offline
- Data syncs automatically when internet becomes available
- Failed syncs are retried with exponential backoff
- Visual indicators show sync status for each record

## Dependencies

- **React Native & Expo**: Core framework
- **NativeWind**: Tailwind CSS for React Native
- **React Navigation**: Navigation between screens
- **AsyncStorage**: Local data persistence and token storage
- **NetInfo**: Internet connectivity monitoring
- **TypeScript**: Type safety
- **JWT Authentication**: Secure token-based authentication

## Development

The app is built with:
- TypeScript for type safety
- NativeWind for styling with Tailwind CSS
- Expo for development and deployment
- Offline-first architecture
- Automatic background synchronization
- JWT-based authentication system
- Secure token storage and management

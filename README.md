# YAMU - Passenger App 🚖

A modern, production-ready React Native (Expo SDK 57) passenger application for the **YAMU** ride management platform.

---

## 📁 Project Architecture & Folder Structure

```
YAMU-passenger app/
├── App.tsx                     # Main entry wrapping Providers & RootNavigator
├── app.json                    # Expo configuration & plugins
├── tsconfig.json               # TypeScript config with '@/*' path aliases
├── package.json                # Project dependencies and npm scripts
│
└── src/
    ├── api/                    # API clients, endpoints, and HTTP interceptors
    │   ├── client.ts           # Centralized Fetch/API Client with Auth Bearer support
    │   ├── endpoints.ts        # Modular REST API endpoints mapping
    │   └── index.ts
    │
    ├── assets/                 # App assets, custom vectors, local icons & fonts
    │
    ├── components/             # Reusable UI component library (Design System)
    │   ├── common/             # Atomic & core reusable components
    │   │   ├── Button.tsx      # Multi-variant button (primary, outline, danger)
    │   │   ├── Input.tsx       # Text input with labels, icons & validation errors
    │   │   ├── Card.tsx        # Card container with surface elevation & borders
    │   │   ├── LoadingIndicator.tsx
    │   │   └── index.ts
    │   ├── layout/             # Screen layouts & headers
    │   │   ├── SafeScreen.tsx  # SafeAreaView wrapper for edge handling
    │   │   ├── AppHeader.tsx   # Standard screen navigation header
    │   │   └── index.ts
    │   └── ride/               # Domain-specific ride hailing components
    │       ├── VehicleTypeCard.tsx  # Selectable vehicle options (Tuk, Bike, Car, Van)
    │       ├── DriverInfoCard.tsx   # Driver metadata, ratings, call & message actions
    │       ├── FareBreakdown.tsx    # Transparent fare calculation breakdown
    │       └── index.ts
    │
    ├── config/                 # Environment & app configuration
    │   ├── env.ts              # API, WebSocket & Map keys
    │   └── appConfig.ts        # App constants, defaults, emergency hotlines (119, 1990)
    │
    ├── constants/              # Design tokens and domain enums
    │   ├── colors.ts           # YAMU brand palette, surfaces, status colors
    │   ├── typography.ts       # Font styles, sizes, and line-heights
    │   ├── rideConstants.ts    # VehicleType, RideStatus, PaymentMethod, vehicle specs
    │   └── index.ts
    │
    ├── context/                # Global React Context providers
    │   ├── AuthContext.tsx     # User authentication state & session persistence
    │   ├── LocationContext.tsx # Pickup, destination, and geolocation tracking
    │   ├── RideContext.tsx     # Active ride management, lifecycle & history
    │   └── index.ts
    │
    ├── hooks/                  # Custom ergonomic hooks
    │   ├── useAuth.ts          # AuthContext consumer hook
    │   ├── useLocation.ts      # LocationContext consumer hook
    │   ├── useRide.ts          # RideContext consumer hook
    │   └── index.ts
    │
    ├── navigation/             # Typed React Navigation (Stacks & Bottom Tabs)
    │   ├── types.ts            # RootStackParamList, AuthStackParamList, MainTabParamList
    │   ├── AuthNavigator.tsx   # Auth Stack (Login, OTP Verification)
    │   ├── MainTabNavigator.tsx# Bottom Tabs (Ride, Activity, Wallet, Account)
    │   ├── RootNavigator.tsx   # Root navigation container & modal flows
    │   └── index.ts
    │
    ├── screens/                # Feature-oriented screens
    │   ├── auth/               # LoginScreen, OtpVerificationScreen
    │   ├── home/               # HomeScreen, DestinationSearchScreen
    │   ├── ride/               # RideBookingScreen, ActiveRideScreen, RideRatingScreen
    │   ├── activity/           # RideHistoryScreen, RideDetailsScreen
    │   ├── wallet/             # WalletScreen (YAMU Pay, Cards, Cash)
    │   ├── profile/            # ProfileScreen, EmergencyContactsScreen
    │   └── index.ts
    │
    ├── services/               # Infrastructure services & platform abstractions
    │   ├── locationService.ts  # Device GPS & destination search
    │   ├── socketService.ts    # Real-time WebSocket driver tracking
    │   ├── storageService.ts   # Local key-value store abstraction
    │   └── index.ts
    │
    ├── types/                  # TypeScript interface contracts
    │   ├── location.ts         # Coordinates, LocationPoint, SavedPlace
    │   ├── user.ts             # UserProfile, EmergencyContact
    │   ├── ride.ts             # DriverInfo, FareEstimate, RideRecord
    │   └── index.ts
    │
    └── utils/                  # Pure utility functions & helpers
        ├── formatters.ts       # LKR currency formatting, duration, distance
        ├── validators.ts       # Sri Lankan phone validation & email formats
        ├── distance.ts         # Haversine distance & ETA calculation
        └── index.ts
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npx expo start
```

### 3. Verify TypeScript & Project Health
```bash
npx tsc --noEmit
npx expo-doctor
```

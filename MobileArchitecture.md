
# AnonMap Chat: Android Mobile Architecture

## Core Tech Stack
- **UI:** Jetpack Compose (Modern Brutalist Design System).
- **Dependency Injection:** Hilt (for Clean Architecture).
- **Networking:** Ktor or Retrofit (WebSockets for real-time).
- **Local Database:** DataStore (for ephemeral pseudo/settings).
- **Geolocation:** Google Play Services Location / FusedLocationProvider.
- **Mapping:** OsmDroid (Privacy-focused) or Google Maps SDK with custom styling.

## Architecture Layers
1. **Presentation (Compose):**
   - `MainScreen`: Scaffold with Map and BottomSheet for nearby users.
   - `ChatScreen`: Brutalist theme messages list.
   - `PseudoViewModel`: Manages ephemeral identity logic.

2. **Domain (Use Cases):**
   - `ScanNearbyUsersUseCase`: Handles location fetching and API call within 1km radius.
   - `GetIdentityUseCase`: Retrieves or generates new pseudo.

3. **Data (Repository):**
   - `LocationRepository`: Interface for GPS updates.
   - `ChatRepository`: Interface for WebSocket events.
   - `UserRepository`: Interface for DataStore identity.

## Security (Android Specific)
- **Runtime Permissions:** Explicit `ACCESS_FINE_LOCATION` checks.
- **Foreground Service:** Use a notification-bound service for real-time "Reachable" status if app is in background.
- **Certificate Pinning:** Ensure WebSocket traffic isn't intercepted.
- **Blurred Location:** App-side logic to add 50-100m of noise to outgoing coordinates to prevent trilateration.

## Backend Recommendation
- **Real-time:** Socket.io (Node.js) or Centrifugo.
- **Spatial Queries:** Redis Geo or PostgreSQL + PostGIS.
- **Storage:** TTL (Time-To-Live) indexes in MongoDB or Redis to ensure 24h data wipe.

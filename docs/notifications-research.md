# Notifications Research: PWA vs Capacitor

Research findings for implementing push and local notifications in the Healthia app.

---

## PWA Web Push Notifications

**Can PWAs send notifications without Capacitor?** Yes, but with limitations.

### How it works

Uses the Web Push API + Service Worker:
1. App registers a service worker
2. Requests user permission via `Notification.requestPermission()`
3. Subscribes via `PushManager.subscribe()` with VAPID public key
4. Server sends push messages to the subscription endpoint
5. Service worker's `push` event handler displays the notification

### Requirements

- HTTPS (secure context)
- Active service worker
- User permission
- VAPID key pair for server authentication

### iOS Support (critical limitation)

- Supported only on **iOS 16.4+**
- Only works when the PWA is **added to the Home Screen** (not in Safari browser)
- **EU users excluded**: Apple removed web push support for EU users in iOS 17.4+ (Digital Markets Act compliance)
- Not supported in Safari for regular websites — only for installed PWAs

### Android Support

Full support via Chrome, Edge, Firefox when PWA is installed or in browser.

---

## Capacitor Native Notifications

Capacitor provides two plugins:

### 1. `@capacitor/local-notifications`

Schedule notifications locally (no server needed). Good for:
- Reminders
- Timers
- Daily alerts

```bash
npm install @capacitor/local-notifications
npx cap sync
```

### 2. `@capacitor/push-notifications`

Server-sent push notifications via APNs (iOS) and FCM (Android).

```bash
npm install @capacitor/push-notifications
npx cap sync
```

**iOS requirements:**
- Push Notifications capability in Xcode
- APNs configuration (certificates or keys)

**Android requirements:**
- Firebase project
- `google-services.json` in `android/app/`

### Advantages over PWA

- Reliable on all iOS versions
- Works without Home Screen installation
- Full native notification features (actions, badges, sounds, grouping)
- No EU/iOS restrictions

---

## Current Project State

| Component | Status |
|-----------|--------|
| Service worker (`frontend/public/sw.js`) | Exists — handles caching and background sync, but no push notification handling |
| Capacitor config (`frontend/capacitor.config.ts`) | Basic setup, no notification plugins |
| Notification plugins | Not installed |

---

## Recommended Approach

Given the iOS PWA limitations (especially EU exclusion), implement a **hybrid strategy**:

1. **Capacitor Push/Local Notifications** for native iOS/Android apps (reliable, full-featured)
2. **PWA Web Push** as a fallback for web-only users on supported browsers

### Implementation priorities

1. **Phase 1**: Capacitor local notifications for daily reminders (no backend changes needed)
2. **Phase 2**: Capacitor push notifications (requires backend + FCM/APNs setup)
3. **Phase 3**: PWA Web Push for browser users (optional, adds complexity)

---

## Technical Notes

### Service Worker Push Handler (PWA)

Add to `sw.js`:

```javascript
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Healthia';
  const options = {
    body: data.body || 'You have new recommendations',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: data.url || '/recommendations' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/recommendations';
  event.waitUntil(clients.openWindow(url));
});
```

### Capacitor Push Setup (Native)

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

async function initPushNotifications() {
  const permission = await PushNotifications.requestPermissions();
  if (permission.receive === 'granted') {
    await PushNotifications.register();
  }

  PushNotifications.addListener('registration', (token) => {
    // Send token.value to backend
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    // Handle foreground notification
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    // Handle notification tap — navigate to recommendations
  });
}
```

---

## References

- [Web Push API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Capacitor Local Notifications](https://capacitorjs.com/docs/apis/local-notifications)
- [iOS Web Push Support (Apple)](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers)

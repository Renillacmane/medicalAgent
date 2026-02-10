import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor config for Healthia (AI Medical Agent).
 * Web app is built with Next.js static export → `out/`.
 * Run: npm run build && npx cap sync
 */
const config: CapacitorConfig = {
  appId: 'com.healthia.medicalagent',
  appName: 'Healthia',
  webDir: 'out',
  server: {
    // Uncomment for live reload when serving Next.js (npm run dev) and running on device/simulator:
    // url: 'http://YOUR_LOCAL_IP:3000',
    // cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;

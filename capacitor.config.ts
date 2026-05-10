import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jadhr.app',
  appName: 'Jadhr',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

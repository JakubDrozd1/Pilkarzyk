import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proman.JaBall',
  appName: 'JaBall',
  webDir: 'dist/pilkarzyk',
  server: {
    url: '',
    cleartext: true,
    androidScheme: 'https',
    allowNavigation: [''],
  },
  plugins: {
    Keyboard: {
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;

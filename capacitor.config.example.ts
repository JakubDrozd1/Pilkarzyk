import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proman.JaBall',
  appName: 'JaBall',
  webDir: 'dist/pilkarzyk',
  server: {
    url: 'https://jaball.manowski.pl',
    cleartext: true,
    androidScheme: 'https',
    allowNavigation: ['https://jaball.manowski.pl:2100'],
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

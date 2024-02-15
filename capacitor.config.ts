import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proman.JaBall',
  appName: 'JABALL',
  webDir: 'dist/pilkarzyk',
  server: {
    url: 'https://jaball.manowski.pl', //http://192.168.1.114:4200  http://192.168.88.20:4200
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

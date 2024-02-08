import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proman.pilkarzyk',
  appName: 'pilkarzyk',
  webDir: 'dist/pilkarzyk',
  server: {
    url: 'http://192.168.88.20:4200', //http://192.168.1.114:4200  http://192.168.88.20:4200
    cleartext: true,
    androidScheme: 'http',
    allowNavigation: [
      'http://localhost:27884',
      'http://192.168.88.20:45455',
      'https://192.168.88.20:45462',
    ],
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

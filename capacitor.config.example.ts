import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proman.pilkarzyk',
  appName: 'pilkarzyk',
  webDir: 'dist/pilkarzyk',
  server: {
    url: '',
    cleartext: true,
    androidScheme: 'http',
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

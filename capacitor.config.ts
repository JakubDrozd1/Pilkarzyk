import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proman.pilkarzyk',
  appName: 'JABALL',
  webDir: 'dist/pilkarzyk',
  server: {
    url: 'https://jabol.manowski.pl', //http://192.168.1.114:4200  http://192.168.88.20:4200
    cleartext: true,
    androidScheme: 'http',
    allowNavigation: [
      'http://localhost:27884',
      'http://192.168.88.20:45455',
      'https://192.168.88.20:45462',
      'http://192.168.88.224:27885',
      'https://192.168.88.224:27885',
    ],
  },
  plugins: {
    Keyboard: {
      resizeOnFullScreen: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
    BackgroundRunner: {
      label: 'com.proman.pilkarzyk.notification',
      src: 'runners/runner.js',
      event: 'push-notification',
      repeat: true,
      interval: 1,
      autoStart: true,
    },
  },
};

export default config;

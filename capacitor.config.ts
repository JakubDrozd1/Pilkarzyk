import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.proman.pilkarzyk',
  appName: 'pilkarzyk',
  webDir: 'dist/pilkarzyk',
  server: {
    url: 'http://192.168.88.20:4200',
    cleartext: true,
    androidScheme: 'https'
  },
  bundledWebRuntime: false,
  plugins: {
    Keyboard:{
      resizeOnFullScreen:true
    }
  }
};

export default config;

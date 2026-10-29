import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lifeos.commandcentre',
  appName: 'Quantra',
  webDir: 'dist',
  server: {
    url: 'https://lifeos-command-centre.vercel.app/',
    cleartext: true,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;

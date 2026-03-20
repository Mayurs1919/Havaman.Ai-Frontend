import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b28ae43e61e9488b9b8b111129eaf0f5',
  appName: 'Havaman.Ai',
  webDir: 'dist',
  server: {
    url: 'https://b28ae43e-61e9-488b-9b8b-111129eaf0f5.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: {
    iconPath: 'public/app-icon.png',
  },
  ios: {
    iconPath: 'public/app-icon.png',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#E63946',
      sound: 'alert.wav',
    },
  },
};

export default config;

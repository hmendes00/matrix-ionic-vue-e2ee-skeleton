/// <reference types="@capacitor/local-notifications" />

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic-matrix-skeleton',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "new-message.ogg",
    },
  },
};

export default config;

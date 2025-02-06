import type { ConfigContext, ExpoConfig } from 'expo/config';

const buildProperties = {
  android: {
    compileSdkVersion: 35,
    targetSdkVersion: 35,
    minSdkVersion: 31, // NOTE: reducing this increases build times
    kotlinVersion: '1.9.24',
  },
  ios: {
    deploymentTarget: '15.1',
    useFrameworks: 'static',
  },
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'epson-print',
  slug: 'epson-print',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.perhats.epson-print',
    infoPlist: {
      NSBluetoothAlwaysUsageDescription: 'Use this to communicate with the printer.',
      UISupportedExternalAccessoryProtocols: ['com.epson.escpos'],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.perhats.epsonprint',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.BLUETOOTH',
      'android.permission.BLUETOOTH_ADMIN',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: ['expo-router', ['expo-build-properties', buildProperties]],
  experiments: {
    typedRoutes: true,
  },
});

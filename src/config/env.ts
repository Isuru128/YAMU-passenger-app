export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.yamu.lk/v1',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'wss://realtime.yamu.lk',
  MAPS_API_KEY: process.env.EXPO_PUBLIC_MAPS_KEY || 'AIzaSyDEuYTKCH8q2FnYL8odKC6Wt1TXipQrdi8',
  DEFAULT_COUNTRY_CODE: '+94',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

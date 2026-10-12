export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || '',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || '',
  MAPS_API_KEY: process.env.EXPO_PUBLIC_MAPS_KEY || '',
  DEFAULT_COUNTRY_CODE: '+94',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

export const ENDPOINTS = {
  AUTH: {
    REQUEST_OTP: '/auth/otp/request',
    VERIFY_OTP: '/auth/otp/verify',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile/update',
    SAVED_PLACES: '/user/saved-places',
    EMERGENCY_CONTACTS: '/user/emergency-contacts',
  },
  RIDE: {
    ESTIMATE: '/rides/estimate',
    REQUEST: '/rides/request',
    CANCEL: (id: string) => `/rides/${id}/cancel`,
    STATUS: (id: string) => `/rides/${id}/status`,
    RATE: (id: string) => `/rides/${id}/rate`,
    HISTORY: '/rides/history',
    DETAILS: (id: string) => `/rides/${id}`,
  },
  WALLET: {
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/wallet/transactions',
    ADD_CARD: '/wallet/cards',
  },
};

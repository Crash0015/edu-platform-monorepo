const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const RATE_LIMITS = {
  LOGIN: {
    key: 'auth_login',
    limit: toNumber(process.env.RATE_LIMIT_LOGIN_MAX, 5),
    windowSeconds: toNumber(process.env.RATE_LIMIT_LOGIN_WINDOW_SEC, 60),
  },
  REFRESH: {
    key: 'auth_refresh',
    limit: toNumber(process.env.RATE_LIMIT_REFRESH_MAX, 10),
    windowSeconds: toNumber(process.env.RATE_LIMIT_REFRESH_WINDOW_SEC, 60),
  },
  FORGOT_PASSWORD: {
    key: 'auth_forgot',
    limit: toNumber(process.env.RATE_LIMIT_FORGOT_MAX, 5),
    windowSeconds: toNumber(process.env.RATE_LIMIT_FORGOT_WINDOW_SEC, 300),
  },
  RESET_PASSWORD: {
    key: 'auth_reset',
    limit: toNumber(process.env.RATE_LIMIT_RESET_MAX, 5),
    windowSeconds: toNumber(process.env.RATE_LIMIT_RESET_WINDOW_SEC, 300),
  },
};

export const EVENT_TYPES = {
  USER_LOGGED_IN: 'iam.user.logged_in',
  PASSWORD_RESET_REQUESTED: 'iam.user.password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'iam.user.password_reset_completed',
} as const;

export const EVENT_VERSION = 1;
export const EVENT_PRODUCER = 'auth-service';

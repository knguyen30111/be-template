export const KAFKA_TOPICS = {
  USER: {
    REGISTER: 'user.register',
    LOGIN: 'user.login',
    VALIDATE: 'user.validate',
    FIND_BY_ID: 'user.findById',
    UPDATE: 'user.update',
  },
  NOTIFICATION: {
    SEND_EMAIL: 'notification.send.email',
    SEND_WELCOME: 'notification.send.welcome',
    SEND_PASSWORD_RESET: 'notification.send.password-reset',
  },
} as const;

export const SERVICE_NAMES = {
  GATEWAY: 'gateway',
  USER_SERVICE: 'user-service',
  NOTIFICATION_SERVICE: 'notification-service',
} as const;

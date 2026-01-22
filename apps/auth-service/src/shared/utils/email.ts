const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;

export const isInstitutionalEmail = (email: string) => EMAIL_REGEX.test(email);

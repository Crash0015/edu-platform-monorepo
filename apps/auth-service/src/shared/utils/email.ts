const INSTITUTIONAL_DOMAIN_REGEX = /^[^@]+@uce\.edu\.ec$/i;

export const isInstitutionalEmail = (email: string) => INSTITUTIONAL_DOMAIN_REGEX.test(email);

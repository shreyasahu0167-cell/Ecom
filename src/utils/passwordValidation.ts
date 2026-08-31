export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
  errors: string[];
  rules: {
    hasMinLength: boolean;
    hasMax14: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasTwoNumbers: boolean;
    hasSpecialChar: boolean;
  };
}

/**
 * Validates password according to Atelier security requirements:
 * - Maximum 14 characters
 * - Minimum 6 characters
 * - At least 1 Uppercase letter
 * - At least 1 Lowercase letter
 * - At least 2 Numbers
 * - At least 1 Special character
 */
export function validatePasswordPolicy(password: string): PasswordValidationResult {
  const trimmed = password || '';
  const hasMinLength = trimmed.length >= 6;
  const hasMax14 = trimmed.length <= 14 && trimmed.length > 0;
  const hasUppercase = /[A-Z]/.test(trimmed);
  const hasLowercase = /[a-z]/.test(trimmed);
  const numCount = (trimmed.match(/[0-9]/g) || []).length;
  const hasTwoNumbers = numCount >= 2;
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(trimmed);

  const errors: string[] = [];

  if (trimmed.length > 14) {
    errors.push('Password must not exceed 14 characters (maximum 14 characters).');
  }
  if (!hasMinLength) {
    errors.push('Password must be at least 6 characters in length.');
  }
  if (!hasUppercase) {
    errors.push('Password must include at least 1 uppercase letter (A-Z).');
  }
  if (!hasLowercase) {
    errors.push('Password must include at least 1 lowercase letter (a-z).');
  }
  if (!hasTwoNumbers) {
    errors.push(`Password must include at least 2 numbers (currently contains ${numCount}).`);
  }
  if (!hasSpecialChar) {
    errors.push('Password must include at least 1 special character (!@#$%^&*...).');
  }

  return {
    isValid: errors.length === 0,
    error: errors[0],
    errors,
    rules: {
      hasMinLength,
      hasMax14,
      hasUppercase,
      hasLowercase,
      hasTwoNumbers,
      hasSpecialChar,
    },
  };
}

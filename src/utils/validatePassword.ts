export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (
  password: string,
): PasswordValidationResult => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Пароль должен содержать не менее 6 символов");
  }

  const specialChars = (password.match(/[^a-zA-Z0-9]/g) || []).length;
  if (specialChars < 2) {
    errors.push("Пароль должен содержать не менее 2 спецсимволов");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Пароль должен содержать как минимум одну заглавную букву");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

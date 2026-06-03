/** RFC 5322–inspired pattern: local@domain with at least one dot in the domain. */
export const REGISTER_EMAIL_REGEX =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface RegisterValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function normalizeRegisterEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateRegisterEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required.";
  if (trimmed.length > 254) return "Email is too long.";
  if (/\s/.test(trimmed)) return "Email cannot contain spaces.";
  if (!REGISTER_EMAIL_REGEX.test(trimmed)) {
    return "Enter a valid email address (e.g. name@university.edu).";
  }
  const [, domain] = trimmed.split("@");
  if (!domain || domain.length < 3 || !domain.includes(".")) {
    return "Enter a valid email address with a proper domain.";
  }
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) {
    return "Enter a valid email address with a proper domain.";
  }
  return null;
}

export function validatePasswordStrength(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`;
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/\d/.test(password)) {
    return "Password must include at least one number.";
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    return "Password must include at least one special character.";
  }
  return null;
}

export function validateRegisterInput(
  input: RegisterInput
): RegisterValidationErrors {
  const errors: RegisterValidationErrors = {};

  const emailError = validateRegisterEmail(input.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePasswordStrength(input.password);
  if (passwordError) errors.password = passwordError;

  if (input.confirmPassword !== undefined) {
    if (!input.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (input.password !== input.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
  }

  return errors;
}

export function hasRegisterErrors(errors: RegisterValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export type PasswordRequirementId =
  | "length"
  | "lower"
  | "upper"
  | "number"
  | "special";

export const PASSWORD_REQUIREMENTS: {
  id: PasswordRequirementId;
  label: string;
  test: (password: string) => boolean;
}[] = [
  {
    id: "length",
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (p) => p.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "lower",
    label: "One lowercase letter",
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: "upper",
    label: "One uppercase letter",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "number",
    label: "One number",
    test: (p) => /\d/.test(p),
  },
  {
    id: "special",
    label: "One special character",
    test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p),
  },
];

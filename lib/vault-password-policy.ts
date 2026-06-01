export const VAULT_PASSWORD_MIN_LENGTH = 8;

const RULES = [
  {
    label: `At least ${VAULT_PASSWORD_MIN_LENGTH} characters`,
    test: (password: string) => password.length >= VAULT_PASSWORD_MIN_LENGTH,
  },
  {
    label: "One lowercase letter",
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    label: "One uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: "One number",
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    label: "One special character",
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
] as const;

export function getVaultPasswordRequirementStatus(password: string) {
  return RULES.map((rule) => ({
    label: rule.label,
    met: rule.test(password),
  }));
}

export function validateVaultMasterPassword(password: string): string | null {
  for (const rule of RULES) {
    if (!rule.test(password)) {
      return `Password must include: ${rule.label.toLowerCase()}.`;
    }
  }
  return null;
}

export function isVaultMasterPasswordValid(password: string): boolean {
  return validateVaultMasterPassword(password) === null;
}

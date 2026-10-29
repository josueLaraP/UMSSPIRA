import type { CompanyRole } from '../entities/company-invitation.entity';

// US-1.4: la UMSS registra la empresa con 1 a N cuentas iniciales.
export const MAX_INITIAL_ACCOUNTS = 10;

export interface InitialAccount {
  email: string;
  role: CompanyRole;
}

export type InitialAccountsProblem = 'empty' | 'too_many' | 'no_admin' | 'duplicated_email';

// Los correos deben llegar normalizados (trim + minúsculas).
export function checkInitialAccounts(accounts: readonly InitialAccount[]): InitialAccountsProblem | null {
  if (accounts.length === 0) {
    return 'empty';
  }
  if (accounts.length > MAX_INITIAL_ACCOUNTS) {
    return 'too_many';
  }
  if (!accounts.some((account) => account.role === 'administrador')) {
    return 'no_admin';
  }
  const emails = new Set(accounts.map((account) => account.email));
  if (emails.size !== accounts.length) {
    return 'duplicated_email';
  }
  return null;
}
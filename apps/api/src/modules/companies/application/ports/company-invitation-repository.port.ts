import type { CompanyInvitation, CompanyRole } from '../../domain/entities/company-invitation.entity';

export const COMPANY_INVITATION_REPOSITORY = Symbol('COMPANY_INVITATION_REPOSITORY');

export type InvitationActivationResult = 'activated' | 'not_found' | 'expired' | 'used' | 'email_in_use';

export interface ActivateInvitationInput {
  tokenHash: string;
  passwordHash: string;
  now: Date;
}

export interface NewCompanyInvitation {
  companyName: string;
  email: string;
  role: CompanyRole;
  tokenHash: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  mail: { to: string; subject: string; text: string; html?: string };
}

export interface CompanyInvitationRepository {
  findByTokenHash(tokenHash: string): Promise<CompanyInvitation | null>;
  // Debe volver a comprobar la invitación dentro de la transacción (doble envío del formulario).
  activate(input: ActivateInvitationInput): Promise<InvitationActivationResult>;
  emailHasAccount(email: string): Promise<boolean>;
  // Crea empresa, invitación y correo pendiente en una sola transacción.
  createCompanyWithInvitation(input: NewCompanyInvitation): Promise<{ companyId: string }>;
}
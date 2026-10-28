import type { CompanyInvitationSummary } from '../../application/contracts/company-invitation-summary';

export function presentCompanyInvitation(summary: CompanyInvitationSummary) {
  return {
    companyName: summary.companyName,
    email: summary.email,
    expiresAt: summary.expiresAt.toISOString(),
  };
}

export function presentCreatedCompanyInvitation(created: {
  companyId: string;
  email: string;
  expiresAt: Date;
}) {
  return {
    companyId: created.companyId,
    email: created.email,
    expiresAt: created.expiresAt.toISOString(),
  };
}
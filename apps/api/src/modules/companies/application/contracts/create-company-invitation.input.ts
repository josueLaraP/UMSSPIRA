export interface CreateCompanyInvitationInput {
  companyName: string;
  email: string;
}

export interface CreatedCompanyInvitation {
  companyId: string;
  email: string;
  expiresAt: Date;
}

export interface InvitationMail {
  subject: string;
  text: string;
  html: string;
}

export type InvitationMailComposer = (input: {
  companyName: string;
  activationUrl: string;
  logoUrl?: string;
}) => InvitationMail;
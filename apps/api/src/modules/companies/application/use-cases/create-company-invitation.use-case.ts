import type { ActorContext } from '../../../../shared/security/contexts/actor-context';
import { InvitationEmailInUseError } from '../../domain/errors/company-invitation.errors';
import type {
  CreateCompanyInvitationInput,
  CreatedCompanyInvitation,
  InvitationMailComposer,
} from '../contracts/create-company-invitation.input';
import type { CompanyInvitationRepository } from '../ports/company-invitation-repository.port';
import { generateInvitationToken, INVITATION_VALIDITY_DAYS } from '../security/invitation-token';

const DAY_MS = 24 * 60 * 60 * 1000;

export class CreateCompanyInvitationUseCase {
  constructor(
    private readonly repository: CompanyInvitationRepository,
    private readonly composeMail: InvitationMailComposer,
    private readonly webUrl: string,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(actor: ActorContext, input: CreateCompanyInvitationInput): Promise<CreatedCompanyInvitation> {
    const email = input.email.trim().toLowerCase();
    if (await this.repository.emailHasAccount(email)) {
      throw new InvitationEmailInUseError();
    }

    const { token, tokenHash } = generateInvitationToken();
    const createdAt = this.now();
    const expiresAt = new Date(createdAt.getTime() + INVITATION_VALIDITY_DAYS * DAY_MS);
    const webUrl = this.webUrl.replace(/\/+$/, '');
    const activationUrl = `${webUrl}/company-invitation/${token}`;
    const mail = this.composeMail({
      companyName: input.companyName,
      activationUrl,
      logoUrl: `${webUrl}/umsspira-logo.png`,
    });

    const { companyId } = await this.repository.createCompanyWithInvitation({
      companyName: input.companyName,
      email,
      role: 'administrador',
      tokenHash,
      createdBy: actor.id,
      createdAt,
      expiresAt,
      mail: { to: email, subject: mail.subject, text: mail.text, html: mail.html },
    });

    return { companyId, email, expiresAt };
  }
}
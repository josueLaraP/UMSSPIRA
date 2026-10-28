import type { ActorContext } from '../../../../shared/security/contexts/actor-context';
import type { CompanyInvitationRepository } from '../ports/company-invitation-repository.port';
import { hashInvitationToken } from '../security/invitation-token';
import { CreateCompanyInvitationUseCase } from './create-company-invitation.use-case';

const now = new Date('2026-10-27T12:00:00Z');
const actor = { id: 'admin-id', role: 'administrador' } as ActorContext;

function build(hasAccount = false) {
  const emailHasAccount = jest.fn().mockResolvedValue(hasAccount);
  const createCompanyWithInvitation = jest.fn().mockResolvedValue({ companyId: 'empresa-1' });
  const composeMail = jest.fn().mockReturnValue({ subject: 'Asunto', text: 'Texto', html: '<p>Html</p>' });
  const repository = { emailHasAccount, createCompanyWithInvitation } as unknown as CompanyInvitationRepository;
  const useCase = new CreateCompanyInvitationUseCase(repository, composeMail, 'http://web.test/', () => now);
  return { useCase, createCompanyWithInvitation, composeMail };
}

describe('CreateCompanyInvitationUseCase', () => {
  it('crea la empresa y una invitación de administrador vigente por 7 días', async () => {
    const { useCase, createCompanyWithInvitation } = build();
    const result = await useCase.execute(actor, { companyName: 'TechSolutions S.A.', email: 'nueva@empresa.com' });

    expect(result).toEqual({
      companyId: 'empresa-1',
      email: 'nueva@empresa.com',
      expiresAt: new Date('2026-11-03T12:00:00Z'),
    });
    expect(createCompanyWithInvitation).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'administrador', createdBy: 'admin-id', createdAt: now }),
    );
  });

  it('envía un enlace cuyo token corresponde al hash guardado', async () => {
    const { useCase, createCompanyWithInvitation, composeMail } = build();
    await useCase.execute(actor, { companyName: 'TechSolutions S.A.', email: 'nueva@empresa.com' });

    const { activationUrl } = composeMail.mock.calls[0][0];
    expect(activationUrl).toMatch(/^http:\/\/web\.test\/company-invitation\/[A-Za-z0-9_-]{43}$/);
    const token = activationUrl.split('/').pop();
    expect(createCompanyWithInvitation.mock.calls[0][0].tokenHash).toBe(hashInvitationToken(token));
    expect(createCompanyWithInvitation.mock.calls[0][0].mail).toEqual({
      to: 'nueva@empresa.com',
      subject: 'Asunto',
      text: 'Texto',
      html: '<p>Html</p>',
    });
  });

  it('normaliza el correo', async () => {
    const { useCase } = build();
    const result = await useCase.execute(actor, { companyName: 'X', email: '  Nueva@Empresa.COM ' });
    expect(result.email).toBe('nueva@empresa.com');
  });

  it('rechaza un correo que ya tiene cuenta', async () => {
    const { useCase, createCompanyWithInvitation } = build(true);
    await expect(
      useCase.execute(actor, { companyName: 'X', email: 'empresa@umss.edu.bo' }),
    ).rejects.toMatchObject({ code: 'INVITATION_EMAIL_IN_USE' });
    expect(createCompanyWithInvitation).not.toHaveBeenCalled();
  });
});
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import {
  REGISTRATION_SECURITY,
  type RegistrationSecurity,
} from '../../../registrations/application/ports/registration-security.port';
import type {
  ActivateInvitationInput,
  CompanyInvitationRepository,
  InvitationActivationResult,
  NewCompanyRegistration,
} from '../../application/ports/company-invitation-repository.port';
import type { CompanyInvitation } from '../../domain/entities/company-invitation.entity';
import { checkInvitationAvailability } from '../../domain/policies/company-invitation.policy';
import { companyInvitationSelect, toCompanyInvitation } from '../translators/company-invitation.translator';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class PrismaCompanyInvitationRepository implements CompanyInvitationRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REGISTRATION_SECURITY) private readonly security: RegistrationSecurity,
  ) {}

  async findByTokenHash(tokenHash: string): Promise<CompanyInvitation | null> {
    const record = await this.prisma.empresaInvitacion.findUnique({
      where: { token_hash: tokenHash },
      select: companyInvitationSelect,
    });
    return record ? toCompanyInvitation(record) : null;
  }

  async activate({ tokenHash, passwordHash, now }: ActivateInvitationInput): Promise<InvitationActivationResult> {
    try {
      return await this.prisma.$transaction(async (tx): Promise<InvitationActivationResult> => {
        const record = await tx.empresaInvitacion.findUnique({
          where: { token_hash: tokenHash },
          select: companyInvitationSelect,
        });
        const invitation = record ? toCompanyInvitation(record) : null;
        if (!invitation) {
          return 'not_found';
        }

        const availability = checkInvitationAvailability(invitation, now);
        if (availability === 'used') {
          return 'used';
        }
        if (availability === 'expired') {
          return 'expired';
        }
        if (availability === 'cancelled') {
          return 'not_found';
        }

        const email = invitation.email.trim().toLowerCase();
        const existingUser = await tx.usuario.findUnique({
          where: { correo: email },
          select: { usuario_id: true },
        });
        if (existingUser) {
          return 'email_in_use';
        }

        // Solo una petición puede aceptar la invitación (evita la doble activación).
        const claimed = await tx.empresaInvitacion.updateMany({
          where: { id: invitation.id, estado: 'pendiente', aceptado_en: null },
          data: { estado: 'aceptada', aceptado_en: now },
        });
        if (claimed.count === 0) {
          return 'used';
        }

        const user = await tx.usuario.create({
          data: {
            correo: email,
            nombre: invitation.companyName || null,
            rol: 'empresa',
            estado: 'ACTIVO',
            cuenta_acceso: { create: { password_hash: passwordHash } },
          },
          select: { usuario_id: true },
        });

        await tx.empresaUsuario.create({
          data: {
            id_empresa: invitation.companyId,
            id_usuario: user.usuario_id,
            rol: invitation.role,
            estado: 'activo',
            fecha_asignacion: now,
          },
        });

        // Compatibilidad: solo un administrador puede quedar como dueño (empresa.id_usuario).
        if (invitation.role === 'administrador') {
          await tx.empresa.updateMany({
            where: { id: invitation.companyId, id_usuario: null },
            data: { id_usuario: user.usuario_id },
          });
        }

        return 'activated';
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return 'email_in_use';
      }
      throw error;
    }
  }

    async findEmailsWithAccount(emails: string[]): Promise<string[]> {
    if (emails.length === 0) {
      return [];
    }
    const users = await this.prisma.usuario.findMany({
      where: { correo: { in: emails } },
      select: { correo: true },
    });
    return users.flatMap((user) => (user.correo ? [user.correo] : []));
  }

  async taxIdExists(taxId: string): Promise<boolean> {
    const company = await this.prisma.empresa.findFirst({
      where: { nit: taxId },
      select: { id: true },
    });
    return Boolean(company);
  }

  async createCompanyWithInvitations(input: NewCompanyRegistration): Promise<{ companyId: string }> {
    return this.prisma.$transaction(async (tx) => {
      const company = await tx.empresa.create({
        data: {
          razon_social: input.companyName,
          nit: input.taxId,
          correo: input.contactEmail,
          fecha_registro: input.createdAt,
        },
        select: { id: true },
      });
      for (const account of input.accounts) {
        await tx.empresaInvitacion.create({
          data: {
            id_empresa: company.id,
            correo: account.email,
            rol: account.role,
            token_hash: account.tokenHash,
            creado_por: input.createdBy,
            creado_en: input.createdAt,
            expira_en: input.expiresAt,
          },
        });
        // El correo se guarda cifrado; el worker del proyecto lo envía (Mailpit local, Brevo en el deploy).
        await tx.correoPendiente.create({
          data: {
            contenido: this.security.seal(account.mail),
            expira_en: new Date(input.createdAt.getTime() + DAY_MS),
          },
        });
      }
      return { companyId: company.id };
    });
  }
}
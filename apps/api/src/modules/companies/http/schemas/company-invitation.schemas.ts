import { z } from 'zod';

// El formato exacto del token lo valida el caso de uso (responde INVITATION_TOKEN_INVALID).
export const invitationTokenSchema = z.string().max(128);

// HU-02 CA-09 a CA-20: mismas reglas que el frontend.
export const activateCompanyInvitationSchema = z
  .strictObject({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(128)
      .regex(/[A-Z]/, 'La contraseña debe tener una letra mayúscula')
      .regex(/[a-z]/, 'La contraseña debe tener una letra minúscula')
      .regex(/\d/, 'La contraseña debe tener un número'),
    confirmPassword: z.string(),
  })
  .refine((body) => body.password === body.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
  

export type ActivateCompanyInvitationBody = z.output<typeof activateCompanyInvitationSchema>;

export const createCompanyInvitationSchema = z.strictObject({
  companyName: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
});

export type CreateCompanyInvitationBody = z.output<typeof createCompanyInvitationSchema>;
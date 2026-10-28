import { BusinessRuleError } from '../../../../shared/errors/business-rule-error';

export class InvitationTokenInvalidError extends BusinessRuleError {
  constructor() {
    super('invalid', 'INVITATION_TOKEN_INVALID', 'El enlace de invitación no es válido');
  }
}

export class InvitationNotFoundError extends BusinessRuleError {
  constructor() {
    super('missing', 'INVITATION_NOT_FOUND', 'La invitación no existe o no puede utilizarse');
  }
}

export class InvitationExpiredError extends BusinessRuleError {
  constructor() {
    super('expired', 'INVITATION_EXPIRED', 'La invitación venció');
  }
}

export class InvitationAlreadyUsedError extends BusinessRuleError {
  constructor() {
    super('conflict', 'INVITATION_ALREADY_USED', 'La invitación ya fue utilizada');
  }
}

export class InvitationEmailInUseError extends BusinessRuleError {
  constructor() {
    super('conflict', 'INVITATION_EMAIL_IN_USE', 'El correo de la invitación ya tiene una cuenta registrada');
  }
}
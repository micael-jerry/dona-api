import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for the local authentication strategy (email/password).
 * Triggers the Passport 'local' strategy to validate credentials before proceeding.
 */
export class LoginLocalGuard extends AuthGuard('local') {}

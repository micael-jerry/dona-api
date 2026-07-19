import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for the Google OAuth authentication strategy.
 * Initiates the Google login flow via Passport.
 */
export class LoginGoogleGuard extends AuthGuard('google') {}

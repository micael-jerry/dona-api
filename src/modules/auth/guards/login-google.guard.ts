import { AuthGuard } from '@nestjs/passport';

export class LoginGoogleGuard extends AuthGuard('google') {}

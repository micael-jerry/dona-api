import { AuthGuard } from '@nestjs/passport';

export class LoginLocalGuard extends AuthGuard('local') {}

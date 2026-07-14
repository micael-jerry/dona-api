import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../../prisma/generated/client';

export const Roles = Reflector.createDecorator<UserRole[]>();

import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../../prisma/generated/client';

/**
 * Decorator to assign specific roles to a route or controller.
 * Used in conjunction with RolesGuard to enforce role-based access control.
 */
export const Roles = Reflector.createDecorator<UserRole[]>();

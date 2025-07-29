import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums/user.enums';

export const ROLES_KEY = 'roles';

// Принимает одну или несколько ролей
export const HasRoles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

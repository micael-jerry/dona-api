import { OmitType } from '@nestjs/swagger';
import { UserResponse } from '../../user/dto/user-response.dto';

export class UserPayload extends OmitType(UserResponse, ['avatar', 'createdAt', 'updatedAt']) {}

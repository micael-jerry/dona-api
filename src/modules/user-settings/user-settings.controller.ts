import { Body, Controller, Get, HttpStatus, Patch } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiCommonHttpErrorDecorator } from '../../common/decorators/api-common-http-error.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserPayload } from '../auth/payload/user.payload';
import { AuthType } from '../auth/types/auth.type';
import { UpdateUserSettingsRequest } from './dto/request/update-user-settings.request.dto';
import { UserSettingsResponse } from './dto/response/user-settings.response.dto';
import { UserSettingsMapper } from './user-settings.mapper';
import { UserSettingsService } from './user-settings.service';

@ApiTags('Account Settings')
@Controller('account/settings')
@Auth(AuthType.AUTHENTICATED)
export class UserSettingsController {
	constructor(private readonly userSettingsService: UserSettingsService) {}

	@ApiOperation({
		summary: 'Get user settings',
		description: 'Retrieves the UI preferences (theme, language) of the currently authenticated user.',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: UserSettingsResponse,
		description: 'User settings retrieved successfully',
	})
	@ApiCommonHttpErrorDecorator()
	@Get()
	async getUserSettings(@CurrentUser() { id }: UserPayload): Promise<UserSettingsResponse> {
		const settings = await this.userSettingsService.getUserSettings(id);
		return UserSettingsMapper.toDto(settings);
	}

	@ApiOperation({
		summary: 'Update user settings',
		description: 'Allows an authenticated user to update their UI preferences such as theme or language.',
	})
	@ApiBody({ type: UpdateUserSettingsRequest })
	@ApiResponse({
		status: HttpStatus.OK,
		type: UserSettingsResponse,
		description: 'User settings updated successfully',
	})
	@ApiCommonHttpErrorDecorator()
	@Patch()
	async updateUserSettings(
		@CurrentUser() { id }: UserPayload,
		@Body() updateDto: UpdateUserSettingsRequest,
	): Promise<UserSettingsResponse> {
		const settings = await this.userSettingsService.updateUserSettings(id, updateDto);
		return UserSettingsMapper.toDto(settings);
	}
}

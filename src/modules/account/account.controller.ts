import 'multer';
import {
	Body,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	HttpCode,
	HttpStatus,
	MaxFileSizeValidator,
	ParseFilePipe,
	Patch,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiCommonHttpErrorDecorator } from '../../common/decorators/api-common-http-error.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserPayload } from '../auth/payload/user.payload';
import { AuthType } from '../auth/types/auth.type';
import { UserResponse } from '../user/dto/user-response.dto';
import { UserMapper } from '../user/user.mapper';
import { AccountService } from './account.service';
import { ChangePasswordRequest, DeleteAccountRequest, UpdateProfileRequest } from './dto/request';
import { DeleteAccountResponse, RequestEmailVerificationResponse } from './dto/response';

@ApiTags('Account')
@Controller('account')
@Auth(AuthType.AUTHENTICATED)
export class AccountController {
	constructor(private readonly accountService: AccountService) {}

	@ApiOperation({
		summary: 'Get current user profile',
		description: 'Retrieves the complete profile information of the currently authenticated user.',
	})
	@ApiResponse({ status: HttpStatus.OK, type: UserResponse, description: 'Profile retrieved successfully' })
	@ApiCommonHttpErrorDecorator()
	@Get('profile')
	async getProfile(@CurrentUser() { id }: UserPayload): Promise<UserResponse> {
		const user = await this.accountService.getProfile(id);
		return UserMapper.toDto(user);
	}

	@ApiOperation({
		summary: 'Update profile information',
		description:
			'Allows an authenticated user to update their simple profile details such as name, pseudo, email, and avatar.',
	})
	@ApiBody({ type: UpdateProfileRequest })
	@ApiResponse({ status: HttpStatus.OK, type: UserResponse, description: 'Profile updated successfully' })
	@ApiCommonHttpErrorDecorator()
	@Patch('profile')
	async updateProfile(
		@CurrentUser() { id }: UserPayload,
		@Body() updateProfileDto: UpdateProfileRequest,
	): Promise<UserResponse> {
		const user = await this.accountService.updateProfile(id, updateProfileDto);
		return UserMapper.toDto(user);
	}

	@ApiOperation({
		summary: 'Update user avatar',
		description: 'Uploads a new avatar image to Supabase S3 storage and updates the user profile.',
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
					description: 'Avatar image file (jpeg, png, webp, gif, max 5MB)',
				},
			},
			required: ['file'],
		},
	})
	@ApiResponse({ status: HttpStatus.OK, type: UserResponse, description: 'Avatar updated successfully' })
	@ApiCommonHttpErrorDecorator()
	@UseInterceptors(FileInterceptor('file'))
	@Patch('avatar')
	async updateAvatar(
		@CurrentUser() { id }: UserPayload,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
					new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp|gif)$/ }),
				],
			}),
		)
		file: Express.Multer.File,
	): Promise<UserResponse> {
		const user = await this.accountService.updateAvatar(id, file);
		return UserMapper.toDto(user);
	}

	@ApiOperation({
		summary: 'Request email verification link',
		description:
			'Triggers a new email verification message containing a verification token to be sent to the user email.',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: RequestEmailVerificationResponse,
		description: 'Email verification link sent successfully',
	})
	@ApiCommonHttpErrorDecorator()
	@HttpCode(HttpStatus.OK)
	@Post('request-email-verification')
	async requestEmailVerification(@CurrentUser() { id }: UserPayload): Promise<RequestEmailVerificationResponse> {
		return this.accountService.requestEmailVerification(id);
	}

	@ApiOperation({
		summary: 'Change user password',
		description: 'Allows an authenticated user to change their password by validating their current password.',
	})
	@ApiBody({ type: ChangePasswordRequest })
	@ApiResponse({ status: HttpStatus.OK, type: UserResponse, description: 'Password changed successfully' })
	@ApiCommonHttpErrorDecorator()
	@Patch('change-password')
	async changePassword(
		@CurrentUser() { id }: UserPayload,
		@Body() changePasswordDto: ChangePasswordRequest,
	): Promise<UserResponse> {
		const user = await this.accountService.changePassword(id, changePasswordDto);
		return UserMapper.toDto(user);
	}

	@ApiOperation({
		summary: 'Delete user account',
		description: 'Permanently deletes the currently authenticated user account.',
	})
	@ApiBody({ type: DeleteAccountRequest, required: false })
	@ApiResponse({ status: HttpStatus.OK, type: DeleteAccountResponse, description: 'Account successfully deleted' })
	@ApiCommonHttpErrorDecorator()
	@Delete()
	async deleteAccount(
		@CurrentUser() { id }: UserPayload,
		@Body() deleteAccountDto?: DeleteAccountRequest,
	): Promise<DeleteAccountResponse> {
		return this.accountService.deleteAccount(id, deleteAccountDto);
	}
}

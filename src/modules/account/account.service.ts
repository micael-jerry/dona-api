import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { User } from '../../../prisma/generated/client';
import { UserUpdateInput } from '../../../prisma/generated/models';
import { HashingService } from '../../common/hashing/hashing.service';
import { AuthUtil } from '../auth/auth.util';
import { SpecialTokenPurpose } from '../auth/payload/special.payload';
import { MailerService } from '../mailer/mailer.service';
import { AccountRepository } from './account.repository';
import { ChangePasswordRequest, DeleteAccountRequest, UpdateProfileRequest } from './dto/request';
import { DeleteAccountResponse, RequestEmailVerificationResponse } from './dto/response';

@Injectable()
export class AccountService {
	constructor(
		private readonly accountRepository: AccountRepository,
		private readonly hashingService: HashingService,
		private readonly authUtil: AuthUtil,
		private readonly mailerService: MailerService,
	) {}

	/**
	 * Retrieves the profile of a user by ID.
	 *
	 * @param {string} userId - User ID.
	 * @returns {Promise<User>} The user entity.
	 */
	async getProfile(userId: string): Promise<User> {
		return this.accountRepository.findById(userId);
	}

	/**
	 * Updates simple profile details (name, pseudo, email, avatar) for the authenticated user.
	 * Checks pseudo and email uniqueness if modified.
	 * If email is changed, marks email as unverified and sends a new verification email.
	 *
	 * @param {string} userId - User ID.
	 * @param {UpdateProfileRequest} updateData - Profile update data.
	 * @returns {Promise<User>} The updated user entity.
	 * @throws {ConflictException} If the chosen pseudo or email is already taken.
	 */
	async updateProfile(userId: string, updateData: UpdateProfileRequest): Promise<User> {
		const currentUser = await this.accountRepository.findById(userId);

		if (updateData.pseudo) {
			const existingUserWithPseudo = await this.accountRepository.findByPseudoExcludingUser(updateData.pseudo, userId);
			if (existingUserWithPseudo) {
				throw new ConflictException('Pseudo is already in use by another user');
			}
		}

		let isEmailChanged = false;
		if (updateData.email && updateData.email !== currentUser.email) {
			const existingUserWithEmail = await this.accountRepository.findByEmailExcludingUser(updateData.email, userId);
			if (existingUserWithEmail) {
				throw new ConflictException('Email is already in use by another user');
			}
			isEmailChanged = true;
		}

		const dataToUpdate: UserUpdateInput = {
			...updateData,
			...(isEmailChanged && { isEmailVerified: false }),
		};

		const updatedUser = await this.accountRepository.updateProfile(userId, dataToUpdate);

		if (isEmailChanged) {
			const token = await this.authUtil.genSpecialToken(updatedUser, SpecialTokenPurpose.VERIFY_EMAIL);
			await this.mailerService.sendVerificationEmail(updatedUser, token);
		}

		return updatedUser;
	}

	/**
	 * Sends a verification email to the user if their email is not already verified.
	 *
	 * @param {string} userId - User ID.
	 * @returns {Promise<RequestEmailVerificationResponse>} Confirmation message and user email.
	 * @throws {BadRequestException} If the email is already verified.
	 */
	async requestEmailVerification(userId: string): Promise<RequestEmailVerificationResponse> {
		const user: User = await this.accountRepository.findById(userId);

		if (user.isEmailVerified) {
			throw new BadRequestException('Email is already verified');
		}

		const token = await this.authUtil.genSpecialToken(user, SpecialTokenPurpose.VERIFY_EMAIL);
		await this.mailerService.sendVerificationEmail(user, token);

		return {
			message: 'Verification email sent successfully',
			email: user.email,
		};
	}

	/**
	 * Changes password for an authenticated user after validating their current password.
	 *
	 * @param {string} userId - User ID.
	 * @param {ChangePasswordRequest} param1 - Current and new passwords.
	 * @returns {Promise<User>} The updated user entity.
	 * @throws {BadRequestException} If the account has no password set (OAuth) or current password is invalid.
	 */
	async changePassword(userId: string, { currentPassword, newPassword }: ChangePasswordRequest): Promise<User> {
		const user: User = await this.accountRepository.findById(userId);

		if (!user.password) {
			throw new BadRequestException('Accounts registered via OAuth cannot change password using this endpoint');
		}

		const isCurrentPasswordValid = await this.hashingService.compare(currentPassword, user.password);
		if (!isCurrentPasswordValid) {
			throw new BadRequestException('Invalid current password');
		}

		const hashedPassword = await this.hashingService.hash(newPassword);

		return this.accountRepository.updatePassword(userId, hashedPassword);
	}

	/**
	 * Permanently deletes the account of an authenticated user.
	 * Validates password for non-OAuth accounts if password is required/provided.
	 *
	 * @param {string} userId - User ID.
	 * @param {DeleteAccountRequest} [dto] - Optional delete account payload containing password.
	 * @returns {Promise<DeleteAccountResponse>} Confirmation message.
	 * @throws {BadRequestException} If password verification fails for password-based accounts.
	 */
	async deleteAccount(userId: string, dto?: DeleteAccountRequest): Promise<DeleteAccountResponse> {
		const user: User = await this.accountRepository.findById(userId);

		if (user.password) {
			if (!dto?.password) {
				throw new BadRequestException('Password confirmation is required to delete this account');
			}
			const isPasswordValid = await this.hashingService.compare(dto.password, user.password);
			if (!isPasswordValid) {
				throw new BadRequestException('Invalid password for account deletion confirmation');
			}
		}

		await this.accountRepository.deleteUser(userId);

		return {
			message: 'Account successfully deleted',
		};
	}
}

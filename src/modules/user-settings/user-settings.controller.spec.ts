import { Test, TestingModule } from '@nestjs/testing';
import { Language, Theme } from '../../../prisma/generated/enums';
import { UserPayload } from '../auth/payload/user.payload';
import { AppAuthGuard } from '../auth/guards/app-auth.guard';
import { UserSettingsController } from './user-settings.controller';
import { UserSettingsService } from './user-settings.service';

describe('UserSettingsController', () => {
	let controller: UserSettingsController;
	let service: jest.Mocked<UserSettingsService>;

	const mockUserPayload: UserPayload = {
		id: 'user-1',
		email: 'test@example.com',
		name: 'Test User',
		pseudo: 'testuser',
		role: 'USER' as any,
		isEmailVerified: true,
		isOAuthGoogleProvider: false,
	};

	const mockUserSettings = {
		id: 'setting-1',
		userId: 'user-1',
		theme: Theme.SYSTEM,
		language: Language.FR,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(async () => {
		const mockService = {
			getUserSettings: jest.fn().mockResolvedValue(mockUserSettings),
			updateUserSettings: jest.fn().mockResolvedValue({ ...mockUserSettings, theme: Theme.DARK }),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserSettingsController],
			providers: [
				{
					provide: UserSettingsService,
					useValue: mockService,
				},
			],
		})
			.overrideGuard(AppAuthGuard)
			.useValue({ canActivate: () => true })
			.compile();

		controller = module.get<UserSettingsController>(UserSettingsController);
		service = module.get(UserSettingsService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('getUserSettings', () => {
		it('should return mapped user settings for authenticated user', async () => {
			const result = await controller.getUserSettings(mockUserPayload);
			expect(service.getUserSettings).toHaveBeenCalledWith('user-1');
			expect(result).toEqual({
				id: mockUserSettings.id,
				userId: mockUserSettings.userId,
				theme: mockUserSettings.theme,
				language: mockUserSettings.language,
				createdAt: mockUserSettings.createdAt,
				updatedAt: mockUserSettings.updatedAt,
			});
		});
	});

	describe('updateUserSettings', () => {
		it('should update and return mapped user settings', async () => {
			const updateDto = { theme: Theme.DARK };
			const result = await controller.updateUserSettings(mockUserPayload, updateDto);
			expect(service.updateUserSettings).toHaveBeenCalledWith('user-1', updateDto);
			expect(result.theme).toBe(Theme.DARK);
		});
	});
});

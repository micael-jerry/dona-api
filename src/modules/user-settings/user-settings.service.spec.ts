import { Test, TestingModule } from '@nestjs/testing';
import { Language, Theme } from '../../../prisma/generated/enums';
import { UserSettingsRepository } from './user-settings.repository';
import { UserSettingsService } from './user-settings.service';

describe('UserSettingsService', () => {
	let service: UserSettingsService;
	let repository: jest.Mocked<UserSettingsRepository>;

	const mockUserSettings = {
		id: 'setting-1',
		userId: 'user-1',
		theme: Theme.SYSTEM,
		language: Language.FR,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	beforeEach(async () => {
		const mockRepository = {
			findOrCreateByUserId: jest.fn().mockResolvedValue(mockUserSettings),
			updateByUserId: jest.fn().mockResolvedValue({ ...mockUserSettings, theme: Theme.DARK }),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserSettingsService,
				{
					provide: UserSettingsRepository,
					useValue: mockRepository,
				},
			],
		}).compile();

		service = module.get<UserSettingsService>(UserSettingsService);
		repository = module.get(UserSettingsRepository);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('getUserSettings', () => {
		it('should return user settings for a given user ID', async () => {
			const result = await service.getUserSettings('user-1');
			expect(repository.findOrCreateByUserId).toHaveBeenCalledWith('user-1');
			expect(result).toEqual(mockUserSettings);
		});
	});

	describe('updateUserSettings', () => {
		it('should update and return user settings', async () => {
			const updateDto = { theme: Theme.DARK };
			const result = await service.updateUserSettings('user-1', updateDto);
			expect(repository.updateByUserId).toHaveBeenCalledWith('user-1', updateDto);
			expect(result.theme).toBe(Theme.DARK);
		});
	});
});

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from './generated/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, await bcrypt.genSalt());
}

async function main() {
	console.log('🌱 Starting database seeding...');

	// ─── Event Categories ──────────────────────────────────────────────────────
	const defaultCategories = [
		{ id: 'cat_accident_01', value: 'Accident' },
		{ id: 'cat_traffic_02', value: 'Embouteillage' },
		{ id: 'cat_police_03', value: 'Contrôle de police' },
		{ id: 'cat_hazard_04', value: 'Danger / Obstacle' },
		{ id: 'cat_closure_05', value: 'Route fermée' },
		{ id: 'cat_other_06', value: 'Autre' },
	];

	for (const cat of defaultCategories) {
		const category = await prisma.eventCategory.upsert({
			where: { value: cat.value },
			update: {},
			create: {
				id: cat.id,
				value: cat.value,
			},
		});
		console.log(`✅ EventCategory ready: ${category.value} (${category.id})`);
	}

	// ─── Admin User ────────────────────────────────────────────────────────────
	const adminUser = await prisma.user.upsert({
		where: { email: 'admin@dona.app' },
		update: {
			isEmailVerified: true,
			password: await hashPassword('Admin@1234!'),
		},
		create: {
			id: 'clr72abcd000008l1abcd1234',
			email: 'admin@dona.app',
			pseudo: 'admin',
			name: 'Administrator',
			password: await hashPassword('Admin@1234!'),
			role: UserRole.ADMIN,
			avatar: 'https://api.dicebear.com/10.x/avataaars-neutral/png?seed=admin',
			isEmailVerified: true,
		},
	});
	console.log(`✅ Admin user created: ${adminUser.email} (role: ${adminUser.role})`);

	// ─── Regular Users ─────────────────────────────────────────────────────────
	const regularUsers = [
		{
			id: 'clr72abcd000008l1abcd1235',
			email: 'alice@dona.app',
			pseudo: 'alice42',
			name: 'Alice Martin',
			password: await hashPassword('Alice@1234!'),
			role: UserRole.USER,
			avatar: 'https://api.dicebear.com/10.x/avataaars-neutral/png?seed=alice',
			isEmailVerified: true,
		},
		{
			id: 'clr72abcd000008l1abcd1236',
			email: 'bob@dona.app',
			pseudo: 'bob42',
			name: 'Bob Dupont',
			password: await hashPassword('Bob@1234!'),
			role: UserRole.USER,
			avatar: 'https://api.dicebear.com/10.x/avataaars-neutral/png?seed=bob',
			isEmailVerified: true,
		},
		{
			id: 'clr72abcd000008l1abcd1237',
			email: 'unverified@dona.app',
			pseudo: 'unverified_user',
			name: 'Unverified User',
			password: await hashPassword('Unverified@1234!'),
			role: UserRole.USER,
			avatar: 'https://api.dicebear.com/10.x/avataaars-neutral/png?seed=unverified',
			isEmailVerified: false,
		},
		{
			id: 'clr72abcd000008l1abcd1238',
			email: 'oauth@dona.app',
			pseudo: 'oauth_user',
			name: 'OAuth User',
			password: null,
			role: UserRole.USER,
			avatar: 'https://api.dicebear.com/10.x/avataaars-neutral/png?seed=oauth',
			isEmailVerified: true,
			isOAuthGoogleProvider: true,
		},
	];

	for (const userData of regularUsers) {
		const user = await prisma.user.upsert({
			where: { email: userData.email },
			update: {
				isEmailVerified: userData.isEmailVerified,
				password: userData.password,
				isOAuthGoogleProvider: userData.isOAuthGoogleProvider ?? false,
			},
			create: userData,
		});
		console.log(`✅ User created: ${user.email} (role: ${user.role})`);
	}

	console.log('🎉 Seeding completed successfully!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error('❌ Seeding failed:', e);
		await prisma.$disconnect();
		process.exit(1);
	});

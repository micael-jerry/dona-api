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

	// ─── Admin User ────────────────────────────────────────────────────────────
	const adminUser = await prisma.user.upsert({
		where: { email: 'admin@dona.app' },
		update: {},
		create: {
			email: 'admin@dona.app',
			pseudo: 'admin',
			name: 'Administrator',
			password: await hashPassword('Admin@1234!'),
			role: UserRole.ADMIN,
			avatar: 'https://api.dicebear.com/10.x/avataaars-neutral/png?seed=admin',
		},
	});
	console.log(`✅ Admin user created: ${adminUser.email} (role: ${adminUser.role})`);

	// ─── Regular Users ─────────────────────────────────────────────────────────
	const regularUsers = [
		{
			email: 'alice@dona.app',
			pseudo: 'alice42',
			name: 'Alice Martin',
			password: await hashPassword('Alice@1234!'),
			role: UserRole.USER,
			avatar: 'https://api.dicebear.com/10.x/avataaars-neutral/png?seed=alice',
		},
		{
			email: 'bob@dona.app',
			pseudo: 'bob42',
			name: 'Bob Dupont',
			password: await hashPassword('Bob@1234!'),
			role: UserRole.USER,
			avatar: 'https://api.dicebear.com/10.x/avataaars-neutral/png?seed=bob',
		},
	];

	for (const userData of regularUsers) {
		const user = await prisma.user.upsert({
			where: { email: userData.email },
			update: {},
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

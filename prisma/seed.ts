import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
	await prisma.user.createMany({
		data: [
			// TODO: add init user Add your seed data here
		],
	});
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});

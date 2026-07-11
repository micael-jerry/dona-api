import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
	/**
	 * Hashes a plain-text value using bcrypt.
	 *
	 * @param plainText - The raw string to hash (e.g. a password).
	 * @returns A bcrypt hash string ready to be stored.
	 */
	async hash(plainText: string): Promise<string> {
		return bcrypt.hash(plainText, await bcrypt.genSalt());
	}

	/**
	 * Compares a plain-text value against a bcrypt hash.
	 *
	 * @param plainText - The raw string to verify.
	 * @param hash      - The stored bcrypt hash to compare against.
	 * @returns `true` if they match, `false` otherwise.
	 */
	async compare(plainText: string, hash: string): Promise<boolean> {
		return bcrypt.compare(plainText, hash);
	}
}

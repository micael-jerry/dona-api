import { UserPayload } from './payload/user.payload';

declare module 'express' {
	export interface Request {
		user?: UserPayload;
	}
}

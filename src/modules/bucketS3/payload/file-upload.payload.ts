export interface FileUploadPayload {
	buffer: Buffer;
	originalname?: string;
	mimetype: string;
}

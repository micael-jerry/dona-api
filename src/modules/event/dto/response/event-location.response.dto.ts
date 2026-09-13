import { ApiProperty } from '@nestjs/swagger';

export class EventLocationResponseDto {
	@ApiProperty({ description: 'GPS Latitude', example: -18.8792 })
	lat!: number;

	@ApiProperty({ description: 'GPS Longitude', example: 47.5079 })
	lng!: number;
}

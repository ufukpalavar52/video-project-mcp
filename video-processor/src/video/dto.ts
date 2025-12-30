import { IsNumber, IsUrl, IsNotEmpty, IsOptional } from 'class-validator';
import { IsGreaterThan } from '../common/decorators/is-greater-than.decorator';
import { Type } from 'class-transformer';

export class VideoRequestDTO {
  @IsOptional()
  @IsUrl()
  url?: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  startTime: number;

  @Type(() => Number)
  @IsGreaterThan('startTime')
  @IsNumber()
  @IsNotEmpty()
  endTime: number;

  @IsNotEmpty()
  processType: string;
}

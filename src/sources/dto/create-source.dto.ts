import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsNotEmpty,
} from 'class-validator';

export enum SourceType {
  XING = 'XING',
  INDEED = 'INDEED',
}

export class CreateSourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(SourceType)
  type: SourceType;

  @IsUrl({ require_tld: true })
  url: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}

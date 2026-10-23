import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  source: string;

  @IsString()
  @IsNotEmpty()
  externalId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsUrl({ require_tld: true })
  url: string;

  @IsOptional()
  @IsString()
  description?: string;
}

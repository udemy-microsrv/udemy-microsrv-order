import { PaginationDto } from '../../common/pagination/pagination.dto';
import { OrderStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class PaginationAndFilterDto extends PaginationDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}

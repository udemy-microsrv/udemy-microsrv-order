import { IsString } from 'class-validator';

export class PaidOrderDto {
  @IsString()
  orderId: string;

  @IsString()
  externalId: string;

  @IsString()
  receiptUrl: string;
}

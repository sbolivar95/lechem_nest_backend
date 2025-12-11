import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['APPROVED', 'REJECTED', 'CANCELLED'])
  status: 'APPROVED' | 'REJECTED' | 'CANCELLED';
}

import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}

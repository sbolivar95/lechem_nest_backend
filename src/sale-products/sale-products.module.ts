import { Module } from '@nestjs/common';
import { SaleProductsService } from './sale-products.service';
import { SaleProductsController } from './sale-products.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [SaleProductsController],
  providers: [SaleProductsService],
})
export class SaleProductsModule {}

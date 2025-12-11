import { Test, TestingModule } from '@nestjs/testing';
import { SaleProductsController } from './sale-products.controller';
import { SaleProductsService } from './sale-products.service';

describe('SaleProductsController', () => {
  let controller: SaleProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaleProductsController],
      providers: [SaleProductsService],
    }).compile();

    controller = module.get<SaleProductsController>(SaleProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

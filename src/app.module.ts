import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { ItemsModule } from './items/items.module';
import { CategoriesModule } from './categories/categories.module';
import { RecipesModule } from './recipes/recipes.module';
import { ProductsModule } from './products/products.module';
import { EmployeesModule } from './employees/employees.module';

@Module({
  imports: [DbModule, AuthModule, ItemsModule, CategoriesModule, RecipesModule, ProductsModule, EmployeesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Body, Controller, Get, Post } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { Suppliers } from './entities/suppliers.entity';

@Controller('suppliers')
export class SuppliersController {
  constructor(
    private readonly suppliersService: SuppliersService,
  ) {}

  @Post()
  create(@Body() createSupplierDto: CreateSupplierDto): Promise<Suppliers> {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  findAll(): Promise<Suppliers[]> {
    return this.suppliersService.findAll();
  }
}
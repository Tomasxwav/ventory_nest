import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';

@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSalesOrderDto: CreateSalesOrderDto) {
    return this.salesOrdersService.create(createSalesOrderDto);
  }

  @Get()
  findAll() {
    return this.salesOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesOrdersService.findOne(id);
  }

  @Patch(':id/confirm')
  @HttpCode(HttpStatus.OK)
  confirmOrder(@Param('id', ParseIntPipe) id: number) {
    return this.salesOrdersService.confirmOrder(id);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelOrder(@Param('id', ParseIntPipe) id: number) {
    return this.salesOrdersService.cancelOrder(id);
  }
}

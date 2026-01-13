import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  async findAll(
    @Query('filter[product_name]') filterProductName?: string,
    @Query('filter[status]') filterStatus?: string,
    @Query('filter[product_id]') filterProductId?: string,
    @Query('filter[serial_number]') filterSerialNumber?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const productId = filterProductId ? parseInt(filterProductId, 10) : undefined;

    return this.itemsService.findAll({
      filterProductName,
      filterStatus,
      filterProductId: productId,
      filterSerialNumber,
      page: pageNum,
      limit: limitNum,
    });
  }
}

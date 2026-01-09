import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchasesDto } from './dto/create-purchases.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPurchasesDto: CreatePurchasesDto) {
    return this.purchasesService.create(createPurchasesDto);
  }

  @Get()
  findAll() {
    return this.purchasesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchasesService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.purchasesService.remove(id);
  }
}

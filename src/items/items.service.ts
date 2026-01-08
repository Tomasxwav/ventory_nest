import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const item = this.itemRepository.create(createItemDto);
    return await this.itemRepository.save(item);
  }

  async findAll(): Promise<Item[]> {
    return await this.itemRepository.find({
      relations: ['product', 'purchase', 'purchase_order_item'],
    });
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['product', 'purchase', 'purchase_order_item'],
    });

    if (!item) {
      throw new NotFoundException(`Item con ID ${id} no encontrado`);
    }

    return item;
  }

  async findByProduct(productId: number): Promise<Item[]> {
    return await this.itemRepository.find({
      where: { product_id: productId },
      relations: ['product', 'purchase', 'purchase_order_item'],
    });
  }

  async findByPurchase(purchaseId: number): Promise<Item[]> {
    return await this.itemRepository.find({
      where: { purchase_id: purchaseId },
      relations: ['product', 'purchase', 'purchase_order_item'],
    });
  }

  async update(id: number, updateItemDto: Partial<CreateItemDto>): Promise<Item> {
    const item = await this.findOne(id);
    Object.assign(item, updateItemDto);
    return await this.itemRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.itemRepository.remove(item);
  }
}

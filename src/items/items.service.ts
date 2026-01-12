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

  async findAll(filters?: {
    filterProductName?: string;
    filterStatus?: string;
    filterProductId?: number;
    filterSerialNumber?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Item[]; total: number; page: number; limit: number }> {
    const {
      filterProductName,
      filterStatus,
      filterProductId,
      filterSerialNumber,
      page = 1,
      limit = 10,
    } = filters || {};

    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('item.purchase', 'purchase')
      .leftJoinAndSelect('item.purchase_order_item', 'purchase_order_item');

    // Aplicar filtros dinámicamente
    if (filterProductName) {
      queryBuilder.andWhere('LOWER(product.name) LIKE LOWER(:name)', {
        name: `%${filterProductName}%`,
      });
    }

    if (filterStatus) {
      queryBuilder.andWhere('item.status = :status', { status: filterStatus });
    }

    if (filterProductId) {
      queryBuilder.andWhere('item.product_id = :productId', {
        productId: filterProductId,
      });
    }

    if (filterSerialNumber) {
      queryBuilder.andWhere(
        'LOWER(item.serial_number) LIKE LOWER(:serialNumber)',
        {
          serialNumber: `%${filterSerialNumber}%`,
        },
      );
    }

    // Obtener total antes de aplicar paginación
    const total = await queryBuilder.getCount();

    // Aplicar paginación
    const items = await queryBuilder
      .orderBy('item.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      items,
      total,
      page,
      limit,
    };
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

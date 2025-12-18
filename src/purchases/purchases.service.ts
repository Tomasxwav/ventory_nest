import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreatePurchasesDto } from './dto/create-purchases.dto';
import { Purchase } from './entities/purchase.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Item } from '../items/entities/item.entity';
import { Product } from '../products/entities/product.entity';
import { Suppliers } from '../suppliers/entities/suppliers.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Suppliers)
    private readonly suppliersRepository: Repository<Suppliers>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPurchasesDto: CreatePurchasesDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const supplier = await this.suppliersRepository.findOne({
        where: { id: createPurchasesDto.supplierId },
      });

      if (!supplier) {
        throw new NotFoundException(
          `Proveedor con ID ${createPurchasesDto.supplierId} no encontrado`,
        );
      }

      const productIds = createPurchasesDto.products.map((p) => p.productId);
      const products = await this.productRepository.findByIds(productIds);

      if (products.length !== productIds.length) {
        const foundIds = products.map((p) => p.id);
        const missingIds = productIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(
          `Productos no encontrados: ${missingIds.join(', ')}`,
        );
      }

      for (const productDto of createPurchasesDto.products) {
        if (productDto.items.length !== productDto.quantity) {
          throw new BadRequestException(
            `El producto ${productDto.productId} requiere ${productDto.quantity} items, pero se proporcionaron ${productDto.items.length}`,
          );
        }
      }

      const purchase = queryRunner.manager.create(Purchase, {
        voucher: createPurchasesDto.voucher,
        invoice: createPurchasesDto.invoice,
        supplier_id: createPurchasesDto.supplierId,
        notes: createPurchasesDto.notes,
      });

      const savedPurchase = await queryRunner.manager.save(Purchase, purchase);

      const inventories = [];

      for (const productDto of createPurchasesDto.products) {
        const inventory = queryRunner.manager.create(Inventory, {
          product_id: productDto.productId,
          purchase_id: savedPurchase.id,
        });

        const savedInventory = await queryRunner.manager.save(
          Inventory,
          inventory,
        );

        const items = productDto.items.map((itemDto) =>
          queryRunner.manager.create(Item, {
            inventory_id: savedInventory.id,
            serial_number: itemDto.serialNumber || null,
            purchase_cost: itemDto.purchaseCost,
            sale_cost: itemDto.saleCost,
            purchase_currency: itemDto.purchaseCurrency || 'mxn',
            sale_currency: itemDto.saleCurrency || 'mxn',
          }),
        );

        await queryRunner.manager.save(Item, items);
        inventories.push(savedInventory);
      }

      // Commit de la transacción
      await queryRunner.commitTransaction();

      // Retornar la compra completa con sus relaciones
      return await this.purchaseRepository.findOne({
        where: { id: savedPurchase.id },
        relations: ['supplier', 'inventories', 'inventories.items', 'inventories.product'],
      });
    } catch (error) {
      // Rollback en caso de error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.purchaseRepository.find({
      relations: ['supplier', 'inventories', 'inventories.product'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: ['supplier', 'inventories', 'inventories.items', 'inventories.product'],
    });

    if (!purchase) {
      throw new NotFoundException(`Compra con ID ${id} no encontrada`);
    }

    return purchase;
  }

  async remove(id: number) {
    const purchase = await this.findOne(id);
    await this.purchaseRepository.remove(purchase);
    return { message: `Compra con ID ${id} eliminada exitosamente` };
  }
}

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
import { PurchaseOrder, PurchaseOrderStatus } from '../purchase-orders/entities/purchase-order.entity';
import { PurchaseOrderItem } from '../purchase-orders/entities/purchase-order-item.entity';

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
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPurchasesDto: CreatePurchasesDto) {
    // Validaciones ANTES de iniciar la transacción
    const productIds = createPurchasesDto.products.map((p) => p.productId);
    const products = await this.productRepository.findByIds(productIds);

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Productos no encontrados: ${missingIds.join(', ')}`,
      );
    }

    // Validar según el modo (serialized o no)
    for (const productDto of createPurchasesDto.products) {
      if (productDto.serialized) {
        // Modo serializado: validar que la cantidad de items coincida
        if (
          !productDto.items ||
          productDto.items.length !== productDto.quantity
        ) {
          throw new BadRequestException(
            `El producto ${productDto.productId} está marcado como serializado y requiere ${productDto.quantity} items, pero se proporcionaron ${productDto.items?.length || 0}`,
          );
        }
      }
    }

    // Iniciar transacción después de las validaciones
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const purchase = queryRunner.manager.create(Purchase, {
        voucher: createPurchasesDto.voucher,
        invoice: createPurchasesDto.invoice,
        purchase_order_id: createPurchasesDto.purchaseOrderId || null,
        notes: createPurchasesDto.notes,
      });

      const savedPurchase = await queryRunner.manager.save(Purchase, purchase);

      // Crear los registros de inventario y sus items
      const inventories = [];

      for (const productDto of createPurchasesDto.products) {
        // Crear el registro de inventario
        const inventory = queryRunner.manager.create(Inventory, {
          product_id: productDto.productId,
          purchase_id: savedPurchase.id,
        });

        const savedInventory = await queryRunner.manager.save(
          Inventory,
          inventory,
        );

        let items = [];

        if (productDto.serialized) {
          // Modo serializado: usar los serial numbers proporcionados
          items = productDto.items.map((itemDto) =>
            queryRunner.manager.create(Item, {
              inventory_id: savedInventory.id,
              serial_number: itemDto.serialNumber,
              purchase_cost: null,
              sale_cost: null,
              purchase_currency: null,
              sale_currency: null,
            }),
          );
        } else {
          // Modo no serializado: crear items automáticamente sin serial number
          items = Array.from({ length: productDto.quantity }, () =>
            queryRunner.manager.create(Item, {
              inventory_id: savedInventory.id,
              serial_number: null,
              purchase_cost: null,
              sale_cost: null,
              purchase_currency: null,
              sale_currency: null,
            }),
          );
        }

        await queryRunner.manager.save(Item, items);
        inventories.push(savedInventory);
      }

      // Actualizar el estado de la orden de compra si existe
      if (createPurchasesDto.purchaseOrderId) {
        await this.updatePurchaseOrderStatus(
          queryRunner,
          createPurchasesDto.purchaseOrderId,
          createPurchasesDto.products,
        );
      }

      // Commit de la transacción
      await queryRunner.commitTransaction();

      // Retornar la compra completa con sus relaciones
      return await this.purchaseRepository.findOne({
        where: { id: savedPurchase.id },
        relations: [
          'purchase_order',
          'purchase_order.supplier',
          'inventories',
          'inventories.items',
          'inventories.product',
        ],
      });
    } catch (error) {
      // Rollback en caso de error
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.purchaseRepository.find({
      relations: [
        'purchase_order',
        'purchase_order.supplier',
        'purchase_order.created_by',
        'inventories',
        'inventories.product',
        'inventories.items',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: [
        'purchase_order',
        'purchase_order.supplier',
        'purchase_order.created_by',
        'inventories',
        'inventories.items',
        'inventories.product',
      ],
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

  /**
   * Actualiza el estado de una orden de compra basándose en las cantidades recibidas
   * - Si la cantidad recibida es 0: estado = CANCELADA
   * - Si la cantidad recibida es menor que la ordenada: estado = PARCIAL
   * - Si la cantidad recibida es igual a la ordenada: estado = COMPLETA
   */
  private async updatePurchaseOrderStatus(
    queryRunner: any,
    purchaseOrderId: number,
    purchasedProducts: Array<{ productId: number; quantity: number }>,
  ) {
    // Obtener la orden de compra con sus items
    const purchaseOrder = await queryRunner.manager.findOne(PurchaseOrder, {
      where: { id: purchaseOrderId },
      relations: ['items'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(
        `Orden de compra con ID ${purchaseOrderId} no encontrada`,
      );
    }

    // Actualizar las cantidades recibidas de cada item
    for (const purchasedProduct of purchasedProducts) {
      const orderItem = purchaseOrder.items.find(
        (item) => item.product_id === purchasedProduct.productId,
      );

      if (orderItem) {
        // Incrementar la cantidad recibida
        orderItem.received_quantity = Number(orderItem.received_quantity) + purchasedProduct.quantity;
        await queryRunner.manager.save(PurchaseOrderItem, orderItem);
      }
    }

    // Determinar el nuevo estado de la orden de compra
    let newStatus: PurchaseOrderStatus;

    // Verificar si todas las cantidades son 0 (cancelado)
    const allZero = purchaseOrder.items.every(
      (item) => Number(item.received_quantity) === 0,
    );

    // Verificar si todas las cantidades están completas
    const allComplete = purchaseOrder.items.every(
      (item) => Number(item.received_quantity) >= Number(item.quantity),
    );

    // Verificar si hay cantidades parciales
    const hasPartial = purchaseOrder.items.some(
      (item) =>
        Number(item.received_quantity) > 0 &&
        Number(item.received_quantity) < Number(item.quantity),
    );

    if (allZero) {
      newStatus = PurchaseOrderStatus.CANCELADA;
    } else if (allComplete) {
      newStatus = PurchaseOrderStatus.COMPLETA;
    } else if (hasPartial || purchaseOrder.items.some(item => Number(item.received_quantity) > 0)) {
      newStatus = PurchaseOrderStatus.PARCIAL;
    } else {
      newStatus = PurchaseOrderStatus.PENDIENTE;
    }

    // Actualizar el estado de la orden de compra
    purchaseOrder.status = newStatus;
    await queryRunner.manager.save(PurchaseOrder, purchaseOrder);
  }
}

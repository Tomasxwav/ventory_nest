import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { DeliveryItem } from './entities/delivery-item.entity';
import { Item } from '../items/entities/item.entity';
import { Product } from '../products/entities/product.entity';
import { SalesOrder } from '../sales-orders/entities/sales-order.entity';
import { SalesOrderItem } from '../sales-orders/entities/sales-order-item.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
    @InjectRepository(DeliveryItem)
    private deliveryItemRepository: Repository<DeliveryItem>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(SalesOrder)
    private salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(SalesOrderItem)
    private salesOrderItemRepository: Repository<SalesOrderItem>,
    private dataSource: DataSource,
  ) {}

  /**
   * Crear entrega con o sin orden de venta
   * - Con orden: valida items reservados de la orden
   * - Sin orden: valida disponibilidad y marca items como vendidos directamente
   */
  async create(createDeliveryDto: CreateDeliveryDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Si hay orden de venta, validarla
      let salesOrder = null;
      if (createDeliveryDto.sales_order_id) {
        salesOrder = await queryRunner.manager.findOne(SalesOrder, {
          where: { id: createDeliveryDto.sales_order_id },
          relations: ['items', 'items.item'],
        });

        if (!salesOrder) {
          throw new NotFoundException(
            `Orden de venta con ID ${createDeliveryDto.sales_order_id} no encontrada`,
          );
        }

        // Validar que la orden esté confirmada
        if (salesOrder.status !== 'confirmed') {
          throw new BadRequestException(
            `La orden de venta debe estar confirmada para crear una entrega. Estado actual: ${salesOrder.status}`,
          );
        }
      }

      const deliveryItems = [];

      // Procesar items
      for (const itemDto of createDeliveryDto.items) {
        // Verificar que el producto existe
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.product_id },
        });

        if (!product) {
          throw new NotFoundException(
            `Producto con ID ${itemDto.product_id} no encontrado`,
          );
        }

        // ESCENARIO 1: Entrega basada en orden de venta
        if (createDeliveryDto.sales_order_id && itemDto.sales_order_item_id) {
          const salesOrderItem = await queryRunner.manager.findOne(
            SalesOrderItem,
            {
              where: {
                id: itemDto.sales_order_item_id,
                sales_order_id: createDeliveryDto.sales_order_id,
              },
              relations: ['item'],
            },
          );

          if (!salesOrderItem) {
            throw new NotFoundException(
              `Item de orden con ID ${itemDto.sales_order_item_id} no encontrado en la orden`,
            );
          }

          // Si el item de la orden tiene un item específico (serializado)
          if (salesOrderItem.item_id) {
            const item = await queryRunner.manager.findOne(Item, {
              where: { id: salesOrderItem.item_id },
            });

            if (!item) {
              throw new NotFoundException(
                `Item con ID ${salesOrderItem.item_id} no encontrado`,
              );
            }

            // Validar que esté reservado (debería estarlo si la orden está confirmada)
            if (item.status !== 'reserved' && item.status !== 'sold') {
              throw new ConflictException(
                `Item ${item.serial_number || item.id} no está reservado o vendido (estado: ${item.status})`,
              );
            }

            // Marcar como vendido
            item.status = 'sold';
            await queryRunner.manager.save(item);

            deliveryItems.push({
              sales_order_item_id: itemDto.sales_order_item_id,
              product_id: itemDto.product_id,
              item_id: item.id,
              quantity_delivered: 1,
              unit_price: itemDto.unit_price,
              notes: itemDto.notes,
            });
          } else {
            // Items no serializados de la orden
            const itemsToDeliver = await queryRunner.manager.find(Item, {
              where: {
                product_id: itemDto.product_id,
                status: 'reserved',
              },
              take: itemDto.quantity_delivered,
            });

            if (itemsToDeliver.length < itemDto.quantity_delivered) {
              throw new BadRequestException(
                `No hay suficientes items reservados. Solicitado: ${itemDto.quantity_delivered}, Disponible: ${itemsToDeliver.length}`,
              );
            }

            // Marcar como vendidos
            for (const item of itemsToDeliver) {
              item.status = 'sold';
              await queryRunner.manager.save(item);
            }

            deliveryItems.push({
              sales_order_item_id: itemDto.sales_order_item_id,
              product_id: itemDto.product_id,
              item_id: null,
              quantity_delivered: itemDto.quantity_delivered,
              unit_price: itemDto.unit_price,
              notes: itemDto.notes,
            });
          }
        }
        // ESCENARIO 2: Entrega DIRECTA (sin orden de venta)
        else {
          // Si se especifica un item específico (serializado)
          if (itemDto.item_id) {
            const item = await queryRunner.manager.findOne(Item, {
              where: { id: itemDto.item_id, product_id: itemDto.product_id },
            });

            if (!item) {
              throw new NotFoundException(
                `Item con ID ${itemDto.item_id} no encontrado`,
              );
            }

            // Validar que esté disponible o reservado
            if (item.status !== 'available' && item.status !== 'reserved') {
              throw new ConflictException(
                `Item ${item.serial_number || item.id} no está disponible (estado: ${item.status})`,
              );
            }

            // Marcar como vendido DIRECTAMENTE
            item.status = 'sold';
            await queryRunner.manager.save(item);

            deliveryItems.push({
              sales_order_item_id: null,
              product_id: itemDto.product_id,
              item_id: item.id,
              quantity_delivered: 1,
              unit_price: itemDto.unit_price,
              notes: itemDto.notes,
            });
          } else {
            // Items no serializados - vender directamente del inventario
            const availableItems = await queryRunner.manager.find(Item, {
              where: {
                product_id: itemDto.product_id,
                status: 'available',
              },
              take: itemDto.quantity_delivered,
            });

            if (availableItems.length < itemDto.quantity_delivered) {
              throw new BadRequestException(
                `Stock insuficiente para producto ${product.name}. Disponible: ${availableItems.length}, Solicitado: ${itemDto.quantity_delivered}`,
              );
            }

            // Marcar como vendidos DIRECTAMENTE
            for (const item of availableItems) {
              item.status = 'sold';
              await queryRunner.manager.save(item);
            }

            deliveryItems.push({
              sales_order_item_id: null,
              product_id: itemDto.product_id,
              item_id: null,
              quantity_delivered: itemDto.quantity_delivered,
              unit_price: itemDto.unit_price,
              notes: itemDto.notes,
            });
          }
        }
      }

      // Crear la entrega
      const delivery = queryRunner.manager.create(Delivery, {
        delivery_number: createDeliveryDto.delivery_number,
        sales_order_id: createDeliveryDto.sales_order_id || null,
        delivery_date: new Date(createDeliveryDto.delivery_date),
        status: createDeliveryDto.status || 'pending',
        delivery_address: createDeliveryDto.delivery_address,
        tracking_number: createDeliveryDto.tracking_number,
        carrier: createDeliveryDto.carrier,
        estimated_delivery_date: createDeliveryDto.estimated_delivery_date
          ? new Date(createDeliveryDto.estimated_delivery_date)
          : null,
        actual_delivery_date: createDeliveryDto.actual_delivery_date
          ? new Date(createDeliveryDto.actual_delivery_date)
          : null,
        notes: createDeliveryDto.notes,
        user_id: createDeliveryDto.user_id,
      });

      const savedDelivery = await queryRunner.manager.save(delivery);

      // Crear los items de la entrega
      for (const deliveryItem of deliveryItems) {
        const item = queryRunner.manager.create(DeliveryItem, {
          delivery_id: savedDelivery.id,
          ...deliveryItem,
        });
        await queryRunner.manager.save(item);
      }

      // Si hay orden de venta, actualizar su estado
      if (salesOrder) {
        salesOrder.status = 'in_progress';
        await queryRunner.manager.save(salesOrder);
      }

      await queryRunner.commitTransaction();

      return this.findOne(savedDelivery.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.deliveryRepository.find({
      relations: [
        'sales_order',
        'user',
        'items',
        'items.product',
        'items.item',
        'items.sales_order_item',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: [
        'sales_order',
        'user',
        'items',
        'items.product',
        'items.item',
        'items.sales_order_item',
      ],
    });

    if (!delivery) {
      throw new NotFoundException(`Entrega con ID ${id} no encontrada`);
    }

    return delivery;
  }
}

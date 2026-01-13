import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SalesOrder } from './entities/sales-order.entity';
import { SalesOrderItem } from './entities/sales-order-item.entity';
import { Item } from '../items/entities/item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';

@Injectable()
export class SalesOrdersService {
  constructor(
    @InjectRepository(SalesOrder)
    private salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(SalesOrderItem)
    private salesOrderItemRepository: Repository<SalesOrderItem>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  /**
   * Proceso de creación de orden de venta:
   * 1. Validar disponibilidad de productos/items
   * 2. Reservar items serializados (cambiar status a 'reserved')
   * 3. Crear la orden de venta
   * 4. Crear los items de la orden
   * 5. Todo en una transacción
   */
  async create(createSalesOrderDto: CreateSalesOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar y preparar items
      const orderItems = [];
      let subtotal = 0;

      for (const itemDto of createSalesOrderDto.items) {
        // Verificar que el producto existe
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.product_id },
        });

        if (!product) {
          throw new NotFoundException(
            `Producto con ID ${itemDto.product_id} no encontrado`,
          );
        }

        // Si es un item serializado (item_id especificado)
        if (itemDto.item_id) {
          const item = await queryRunner.manager.findOne(Item, {
            where: { id: itemDto.item_id, product_id: itemDto.product_id },
          });

          if (!item) {
            throw new NotFoundException(
              `Item con ID ${itemDto.item_id} no encontrado`,
            );
          }

          // Validar que el item está disponible
          if (item.status !== 'available') {
            throw new ConflictException(
              `Item ${item.serial_number || item.id} no está disponible (estado: ${item.status})`,
            );
          }

          // Reservar el item
          item.status = 'reserved';
          await queryRunner.manager.save(item);

          // Crear order item
          const itemSubtotal = itemDto.unit_price - (itemDto.discount || 0);
          subtotal += itemSubtotal;

          orderItems.push({
            product_id: itemDto.product_id,
            item_id: itemDto.item_id,
            quantity: 1, // Items serializados siempre son cantidad 1
            unit_price: itemDto.unit_price,
            subtotal: itemSubtotal,
            discount: itemDto.discount || 0,
            notes: itemDto.notes,
          });
        } else {
          // Producto NO serializado - validar disponibilidad por cantidad
          const availableItems = await queryRunner.manager.count(Item, {
            where: {
              product_id: itemDto.product_id,
              status: 'available',
            },
          });

          if (availableItems < itemDto.quantity) {
            throw new BadRequestException(
              `Stock insuficiente para producto ${product.name}. Disponible: ${availableItems}, Solicitado: ${itemDto.quantity}`,
            );
          }

          // Reservar la cantidad de items necesarios
          const itemsToReserve = await queryRunner.manager.find(Item, {
            where: {
              product_id: itemDto.product_id,
              status: 'available',
            },
            take: itemDto.quantity,
          });

          for (const item of itemsToReserve) {
            item.status = 'reserved';
            await queryRunner.manager.save(item);
          }

          // Crear order item
          const itemSubtotal =
            itemDto.quantity * itemDto.unit_price - (itemDto.discount || 0);
          subtotal += itemSubtotal;

          orderItems.push({
            product_id: itemDto.product_id,
            item_id: null,
            quantity: itemDto.quantity,
            unit_price: itemDto.unit_price,
            subtotal: itemSubtotal,
            discount: itemDto.discount || 0,
            notes: itemDto.notes,
          });
        }
      }

      // Calcular totales
      const tax = subtotal * 0.16; // 16% IVA (ajustar según necesidad)
      const total = subtotal + tax;

      // Crear la orden de venta
      const salesOrder = queryRunner.manager.create(SalesOrder, {
        order_number: createSalesOrderDto.order_number,
        client_id: createSalesOrderDto.client_id,
        customer_name: createSalesOrderDto.customer_name,
        customer_email: createSalesOrderDto.customer_email,
        customer_phone: createSalesOrderDto.customer_phone,
        customer_address: createSalesOrderDto.customer_address,
        order_date: new Date(createSalesOrderDto.order_date),
        status: createSalesOrderDto.status || 'pending',
        subtotal,
        tax,
        total,
        notes: createSalesOrderDto.notes,
        user_id: createSalesOrderDto.user_id,
      });

      const savedOrder = await queryRunner.manager.save(salesOrder);

      // Crear los items de la orden
      for (const orderItem of orderItems) {
        const salesOrderItem = queryRunner.manager.create(SalesOrderItem, {
          sales_order_id: savedOrder.id,
          ...orderItem,
        });
        await queryRunner.manager.save(salesOrderItem);
      }

      await queryRunner.commitTransaction();

      // Retornar la orden creada con sus items
      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.salesOrderRepository.find({
      relations: ['client', 'user', 'items', 'items.product', 'items.item'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const salesOrder = await this.salesOrderRepository.findOne({
      where: { id },
      relations: ['client', 'user', 'items', 'items.product', 'items.item'],
    });

    if (!salesOrder) {
      throw new NotFoundException(
        `Orden de venta con ID ${id} no encontrada`,
      );
    }

    return salesOrder;
  }

  /**
   * Método para confirmar la orden (opcional)
   * Cambia el estado de los items de 'reserved' a 'sold'
   */
  async confirmOrder(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const salesOrder = await queryRunner.manager.findOne(SalesOrder, {
        where: { id },
        relations: ['items'],
      });

      if (!salesOrder) {
        throw new NotFoundException(
          `Orden de venta con ID ${id} no encontrada`,
        );
      }

      if (salesOrder.status === 'confirmed') {
        throw new BadRequestException('La orden ya está confirmada');
      }

      // Cambiar status de items reservados a vendidos
      for (const orderItem of salesOrder.items) {
        if (orderItem.item_id) {
          // Item serializado único
          const item = await queryRunner.manager.findOne(Item, {
            where: { id: orderItem.item_id },
          });
          if (item && item.status === 'reserved') {
            item.status = 'sold';
            await queryRunner.manager.save(item);
          }
        } else {
          // Items no serializados - marcar la cantidad como vendidos
          const items = await queryRunner.manager.find(Item, {
            where: {
              product_id: orderItem.product_id,
              status: 'reserved',
            },
            take: orderItem.quantity,
          });

          for (const item of items) {
            item.status = 'sold';
            await queryRunner.manager.save(item);
          }
        }
      }

      // Actualizar status de la orden
      salesOrder.status = 'confirmed';
      await queryRunner.manager.save(salesOrder);

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Método para cancelar la orden
   * Libera los items reservados
   */
  async cancelOrder(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const salesOrder = await queryRunner.manager.findOne(SalesOrder, {
        where: { id },
        relations: ['items'],
      });

      if (!salesOrder) {
        throw new NotFoundException(
          `Orden de venta con ID ${id} no encontrada`,
        );
      }

      if (salesOrder.status === 'cancelled') {
        throw new BadRequestException('La orden ya está cancelada');
      }

      if (salesOrder.status === 'confirmed') {
        throw new BadRequestException(
          'No se puede cancelar una orden confirmada',
        );
      }

      // Liberar items reservados
      for (const orderItem of salesOrder.items) {
        if (orderItem.item_id) {
          const item = await queryRunner.manager.findOne(Item, {
            where: { id: orderItem.item_id },
          });
          if (item && item.status === 'reserved') {
            item.status = 'available';
            await queryRunner.manager.save(item);
          }
        } else {
          const items = await queryRunner.manager.find(Item, {
            where: {
              product_id: orderItem.product_id,
              status: 'reserved',
            },
            take: orderItem.quantity,
          });

          for (const item of items) {
            item.status = 'available';
            await queryRunner.manager.save(item);
          }
        }
      }

      // Actualizar status de la orden
      salesOrder.status = 'cancelled';
      await queryRunner.manager.save(salesOrder);

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

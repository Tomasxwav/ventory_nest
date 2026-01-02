import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
  ) {}

  async create(createDto: CreatePurchaseOrderDto) {
    // Calculate totals if not provided
    let subtotal = createDto.subtotal || 0;
    let total = createDto.total || 0;

    if (!createDto.subtotal || !createDto.total) {
      subtotal = createDto.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0,
      );
      total = subtotal + (createDto.taxes || 0);
    }

    const purchaseOrder = this.purchaseOrderRepository.create({
      order_number: createDto.order_number,
      purchase_request_id: createDto.purchase_request_id,
      supplier_id: createDto.supplier_id,
      currency: createDto.currency || 'MXN',
      expected_date: createDto.expected_date
        ? new Date(createDto.expected_date)
        : null,
      status: createDto.status,
      subtotal,
      taxes: createDto.taxes || 0,
      total,
      created_by_id: createDto.created_by_id,
    });

    const savedOrder = await this.purchaseOrderRepository.save(purchaseOrder);

    const items = createDto.items.map((item) =>
      this.purchaseOrderItemRepository.create({
        product_id: item.productId,
        order_id: savedOrder.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        unit_of_measure: item.unit_of_measure,
      }),
    );

    await this.purchaseOrderItemRepository.save(items);

    return this.findOne(savedOrder.id);
  }

  async findAll() {
    return await this.purchaseOrderRepository.find({
      relations: [
        'items',
        'items.product',
        'supplier',
        'created_by',
        'purchase_request',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: [
        'items',
        'items.product',
        'supplier',
        'created_by',
        'purchase_request',
      ],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(
        `Orden de compra con ID ${id} no encontrada`,
      );
    }

    return purchaseOrder;
  }
}

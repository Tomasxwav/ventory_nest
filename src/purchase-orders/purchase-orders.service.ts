import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Suppliers } from '../suppliers/entities/suppliers.entity';
import { User } from '../users/entities/user.entity';
import { PurchaseRequest, PurchaseRequestStatus } from '../purchase-requests/entities/purchase-request.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Suppliers)
    private readonly suppliersRepository: Repository<Suppliers>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PurchaseRequest)
    private readonly purchaseRequestRepository: Repository<PurchaseRequest>,
  ) {}

  async create(createDto: CreatePurchaseOrderDto) {
    const existingOrder = await this.purchaseOrderRepository.findOne({
      where: { order_number: createDto.order_number },
    });

    if (existingOrder) {
      throw new BadRequestException(
        `Ya existe una orden de compra con el número ${createDto.order_number}`,
      );
    }

    const supplier = await this.suppliersRepository.findOne({
      where: { id: createDto.supplier_id },
    });

    if (!supplier) {
      throw new NotFoundException(
        `Proveedor con ID ${createDto.supplier_id} no encontrado`,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: createDto.created_by_id },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con ID ${createDto.created_by_id} no encontrado`,
      );
    }

    let purchaseRequest = null;
    if (createDto.purchase_request_id) {
      purchaseRequest = await this.purchaseRequestRepository.findOne({
        where: { id: createDto.purchase_request_id },
      });

      if (!purchaseRequest) {
        throw new NotFoundException(
          `Solicitud de compra con ID ${createDto.purchase_request_id} no encontrada`,
        );
      }
    }

    const productIds = createDto.items.map((item) => item.productId);
    const products = await this.productRepository.findByIds(productIds);

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Los siguientes productos no existen: ${missingIds.join(', ')}`,
      );
    }

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

    if (purchaseRequest) {
      purchaseRequest.status = PurchaseRequestStatus.CONVERTIDA;
      await this.purchaseRequestRepository.save(purchaseRequest);
    }

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

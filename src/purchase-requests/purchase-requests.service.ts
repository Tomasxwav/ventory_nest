import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { PurchaseRequest } from './entities/purchase-request.entity';
import { PurchaseRequestItem } from './entities/purchase-request-item.entity';

@Injectable()
export class PurchaseRequestsService {
  constructor(
    @InjectRepository(PurchaseRequest)
    private readonly purchaseRequestRepository: Repository<PurchaseRequest>,
    @InjectRepository(PurchaseRequestItem)
    private readonly purchaseRequestItemRepository: Repository<PurchaseRequestItem>,
  ) {}

  async create(createDto: CreatePurchaseRequestDto) {
    const purchaseRequest = this.purchaseRequestRepository.create({
      request_number: createDto.request_number,
      user_id: createDto.user_id,
      request_date: new Date(createDto.request_date),
      status: createDto.status,
      priority: createDto.priority,
    });

    const savedRequest =
      await this.purchaseRequestRepository.save(purchaseRequest);

    const items = createDto.items.map((item) =>
      this.purchaseRequestItemRepository.create({
        product_id: item.productId,
        purchase_request_id: savedRequest.id,
        quantity: item.quantity,
        unit_of_measure: item.unit_of_measure,
        details: item.details,
      }),
    );

    await this.purchaseRequestItemRepository.save(items);

    return this.findOne(savedRequest.id);
  }

  async findAll() {
    return await this.purchaseRequestRepository.find({
      relations: ['items', 'items.product', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const purchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user'],
    });

    if (!purchaseRequest) {
      throw new NotFoundException(
        `Solicitud de compra con ID ${id} no encontrada`,
      );
    }

    return purchaseRequest;
  }
}

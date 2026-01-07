import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { PurchaseRequest } from './entities/purchase-request.entity';
import { PurchaseRequestItem } from './entities/purchase-request-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PurchaseRequestsService {
  constructor(
    @InjectRepository(PurchaseRequest)
    private readonly purchaseRequestRepository: Repository<PurchaseRequest>,
    @InjectRepository(PurchaseRequestItem)
    private readonly purchaseRequestItemRepository: Repository<PurchaseRequestItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createDto: CreatePurchaseRequestDto) {
    // Validar que el número de solicitud no exista
    const existingRequest = await this.purchaseRequestRepository.findOne({
      where: { request_number: createDto.request_number },
    });

    if (existingRequest) {
      throw new BadRequestException(
        `Ya existe una solicitud de compra con el número ${createDto.request_number}`,
      );
    }

    // Validar que el usuario exista
    const user = await this.userRepository.findOne({
      where: { id: createDto.user_id },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con ID ${createDto.user_id} no encontrado`,
      );
    }

    // Validar que todos los productos existan
    const productIds = createDto.items.map((item) => item.productId);
    const products = await this.productRepository.findByIds(productIds);

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Los siguientes productos no existen: ${missingIds.join(', ')}`,
      );
    }

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
      relations: ['items', 'items.product', 'items.product.brand', 'user'],
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

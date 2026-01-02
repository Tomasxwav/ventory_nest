import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suppliers } from './entities/suppliers.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Suppliers)
    private readonly suppliersRepository: Repository<Suppliers>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Suppliers> {
    const existingSupplier = await this.suppliersRepository.findOne({
      where: { name: createSupplierDto.name },
    });

    if (existingSupplier) {
      throw new ConflictException('Ya existe un proveedor con ese nombre');
    }

    const supplier = this.suppliersRepository.create(createSupplierDto);
    return this.suppliersRepository.save(supplier);
  }

  async findAll(): Promise<any[]> {
    return this.suppliersRepository.find();
  }
}
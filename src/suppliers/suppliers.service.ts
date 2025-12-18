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
    const existingCategory = await this.suppliersRepository.findOne({
      where: { name: createSupplierDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    return this.suppliersRepository.create();
  }

  async findAll(): Promise<any[]> {
    return this.suppliersRepository.find();
  }
}
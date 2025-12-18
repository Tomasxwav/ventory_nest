import { IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  username: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsString({ message: 'El email debe ser un texto' })
  @MinLength(2, { message: 'El email debe tener al menos 2 caracteres' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(2, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(2, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password_confirmation: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser 0 (USER) o 1 (ADMIN)' })
  role?: UserRole;
}

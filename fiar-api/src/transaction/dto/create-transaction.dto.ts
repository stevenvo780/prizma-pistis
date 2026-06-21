import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsIn,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateClientDto } from '../../client/dto/create-client.dto';

export class CreateTransactionDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'ID numérico del cliente asociado (PK de Client)',
    example: '42',
    required: false,
  })
  clientId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateClientDto)
  @ApiProperty({
    description: 'Datos del cliente a buscar o crear',
    type: CreateClientDto,
    required: false,
  })
  clientData?: CreateClientDto;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @ApiProperty({ description: 'Monto de la transacción', example: 100000.0 })
  amount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Estado inicial de la transacción',
    example: 'pending',
  })
  status: string;

  @IsIn(['income', 'expense'])
  @IsNotEmpty()
  @ApiProperty({
    description: 'Tipo de operación de la transacción',
    example: 'expense',
    enum: ['income', 'expense'],
  })
  operation: 'income' | 'expense';

  @IsOptional()
  @ApiProperty({
    description: 'Detalles adicionales de la transacción',
    example: '{ "nota": "Compra a crédito" }',
  })
  detail?: Record<string, any>;
}

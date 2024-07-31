import { PartialType } from '@nestjs/mapped-types';
import { CreateLotDto } from './create-lot.dto';

export class EditLotDto extends PartialType(CreateLotDto) {}

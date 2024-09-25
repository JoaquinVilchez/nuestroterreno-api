import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { EditUserDto } from './dto/edit-user.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @ApiTags('Users')
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado con éxito',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiTags('Users')
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Usuarios recuperados con éxito',
    type: [User],
  })
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @ApiTags('Users')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({
    status: 200,
    description: 'Usuario recuperado con éxito',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.userService.getOne(id);
  }

  @ApiTags('Users')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado con éxito',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Put(':id')
  async editOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditUserDto,
  ) {
    const data = await this.userService.editOne(id, dto);
    return {
      message: 'Usuario editado con éxito',
      data,
    };
  }

  @ApiTags('Users')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado con éxito' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Delete(':id')
  async deleteOne(@Param('id') id: number) {
    return this.userService.deleteOne(id);
  }
}

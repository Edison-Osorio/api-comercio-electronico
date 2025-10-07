import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import type { PedidoDto } from './pedidosDto';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  crearPedido(@Body() data: PedidoDto) {
    return this.pedidosService.crearPedido(data);
  }
}

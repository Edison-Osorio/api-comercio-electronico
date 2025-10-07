import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { PedidoDto } from './pedidosDto';

@Injectable()
export class PedidosService {
  constructor(
    @Inject('USER-MANAGEMENT') private readonly client: ClientProxy,
  ) {}

  async crearPedido(data: PedidoDto) {
    const uuidPedido = uuidv4();

    console.log(`Se registro su pedidodo con codigo ${uuidPedido} `);

    const pedido = {
      uuidPedido,
      producto: data.producto,
      cantidad: data.cantidad,
      valor: data.valor,
      uuidCliente: data.uuidCliente,
    };

    await this.client.emit({ cmd: 'pedidoCreado' }, pedido).toPromise();
    console.log(`Evento pedidoCreado fue publicado en el broker TCP`);
  }
}

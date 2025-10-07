import { Controller } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MessagePattern, Payload } from '@nestjs/microservices';

interface PedidoDto {
  producto: string;
  cantidad: number;
  valor: number;
  uuidCliente: string;
}
export class PaymentsManagement {
  @MessagePattern({ cmd: 'pedidoCreado' })
  async generarPago(@Payload() data: PedidoDto) {
    console.log(
      '\n Se recive el evento pedidoCreado y contiene la siguiente información ',
      data,
      '\n',
    );

    setTimeout(() => {
      console.log(
        `Se ha realizado la transación y se ha generado el pago del pedido con id : ${uuidv4()}\n\n`,
      );

      console.log(
        'Se envio la confirmación de pago a su correo ****23@gmail.com',
      );
    }, 5000);
  }
}

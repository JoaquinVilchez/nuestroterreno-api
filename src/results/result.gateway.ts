// src/results/result.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ResultService } from './result.service';
import { ClientToServerEvents, ServerToClientEvents } from './event.interfaces';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001', // URL de tu frontend
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ResultGateway {
  constructor(private readonly resultsService: ResultService) {}

  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  // Manejar la unión a una sala
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.join(room);
    console.log(`Cliente ${client.id} se unió a la sala ${room}`);
  }

  // Manejar la solicitud de últimos resultados
  @SubscribeMessage('requestLastResults')
  async handleRequestLastResults(@MessageBody() quantity: number) {
    console.log(`Recibido 'requestLastResults' con cantidad: ${quantity}`);

    if (typeof quantity !== 'number' || quantity <= 0) {
      console.error('Cantidad inválida solicitada:', quantity);
      // Opcional: Emitir un evento de error
      return;
    }

    try {
      const results = await this.resultsService.getMany(
        undefined,
        undefined,
        undefined,
        quantity,
        'DESC',
        [],
      );
      console.log('Enviando resultados a la sala mainData');
      this.server.to('mainData').emit('lastResults', results);
    } catch (error) {
      console.error('Error al obtener los resultados:', error);
      // Opcional: Emitir un evento de error
    }
  }
}

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
import { LotService } from 'src/lots/lots.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001', // URL de tu frontend
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ResultGateway {
  constructor(
    private readonly resultsService: ResultService,
    private readonly lotService: LotService,
  ) {}

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

  @SubscribeMessage('mainScreenAction')
  async handleMainScreenAction(@MessageBody() action: string) {
    console.log(`Recibido 'mainScreenAction' con acción: ${action}`);
    await this.handleAction(action, 'mainScreen');
  }

  @SubscribeMessage('prompterAction')
  async handlePrompterAction(@MessageBody() action: string) {
    console.log(`Recibido 'prompterAction' con acción: ${action}`);
    await this.handleAction(action, 'prompter');
  }

  @SubscribeMessage('broadcastAction')
  async handleBroadcastAction(@MessageBody() action: string) {
    console.log(`Recibido 'broadcastAction' con acción: ${action}`);
    await this.handleAction(action, 'broadcast');
  }

  private async handleAction(action: string, room: string) {
    switch (action) {
      case 'lastResults':
        await this.sendLastResults(room);
        break;
      case 'nextLot':
        await this.sendNextLot(room);
        break;
      case 'defaultPage':
        this.server.to(room).emit('defaultPage');
        break;
      default:
        console.error(`Acción desconocida: ${action}`);
    }
  }

  // Métodos separados para enviar datos a salas específicas
  private async sendLastResults(room: string) {
    try {
      const results = await this.resultsService.getMany(
        undefined,
        undefined,
        undefined,
        5,
        'DESC',
        [],
      );
      this.server.to(room).emit('lastResults', results);
    } catch (error) {
      console.error('Error al enviar últimos resultados:', error);
    }
  }

  private async sendNextLot(room: string) {
    try {
      const lot = await this.lotService.getOneById(4); // CAMBIAR
      this.server.to(room).emit('nextLot', lot);
    } catch (error) {
      console.error('Error al enviar el próximo lote:', error);
    }
  }
}

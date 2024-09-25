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
import { forwardRef, Inject } from '@nestjs/common';
import { Result } from './entities/result.entity';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001', // URL de tu frontend
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ResultGateway {
  constructor(
    @Inject(forwardRef(() => ResultService)) // Usa forwardRef aquí también si es necesario
    private readonly resultsService: ResultService,
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

  // Nueva función pública que puede ser llamada desde ResultService
  public emitFullInfo(room: string) {
    this.sendFullInfo(room); // Llama a la función privada
  }

  public emitWinnerInfo(room: string, result: Result) {
    this.sendWinnerInfo(room, result); // Llama a la función privada
  }

  private async handleAction(action: string, room: string) {
    switch (action) {
      case 'lastResults':
        await this.sendLastResults(room);
        break;
      case 'nextDraw':
        await this.sendNextDraw(room);
        break;
      case 'defaultPage':
        this.server.to(room).emit('defaultPage');
        break;
      case 'fullInfo':
        await this.sendFullInfo(room);
        break;
      case 'winnerInfo':
        await this.sendWinnerInfo(room);
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
        ['participant', 'lot'],
      );
      this.server.to(room).emit('lastResults', results);
    } catch (error) {
      console.error('Error al enviar últimos resultados:', error);
    }
  }

  private async sendNextDraw(room: string) {
    try {
      const nextDraw = await this.resultsService.getNextDraw();
      this.server.to(room).emit('nextDraw', nextDraw);
    } catch (error) {
      console.error('Error al enviar el próximo lote:', error);
    }
  }

  private async sendFullInfo(room: string) {
    try {
      const nextDraw = await this.resultsService.getNextDraw();
      const lastResults = await this.resultsService.getMany(
        undefined,
        undefined,
        undefined,
        5,
        'DESC',
        ['participant', 'lot'],
      );
      const response = {
        nextDraw,
        lastResults,
      };
      this.server.to(room).emit('fullInfo', response);
    } catch (error) {
      console.error('Error al enviar la info completa:', error);
    }
  }

  private async sendWinnerInfo(room: string, result?: Result) {
    try {
      this.server.to(room).emit('winnerInfo', result);
    } catch (error) {
      console.error('Error al enviar el próximo lote:', error);
    }
  }
}

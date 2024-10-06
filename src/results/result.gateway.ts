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
    // origin: 'https://www.nuestroterreno.com.ar', // URL de tu frontend
    origin: process.env.CORS_ORIGIN,
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
    await this.handleAction(action, 'mainScreen');
  }

  @SubscribeMessage('prompterAction')
  async handlePrompterAction(@MessageBody() action: string) {
    await this.handleAction(action, 'prompter');
  }

  @SubscribeMessage('broadcastAction')
  async handleBroadcastAction(@MessageBody() action: string) {
    await this.handleAction(action, 'broadcast');
  }

  // Nueva función pública que puede ser llamada desde ResultService
  public emitFullInfo(room: string) {
    this.sendFullInfo(room); // Llama a la función privada
  }

  public emitNextDraw(room: string) {
    this.sendNextDraw(room); // Llama a la función privada
  }

  public emitLastResults(room: string, params) {
    this.sendLastResults(room, params); // Llama a la función privada
  }

  public emitWinnerInfo(room: string, result: Result) {
    this.sendWinnerInfo(room, result); // Llama a la función privada
  }

  public emitDefaultPage(room: string) {
    this.server.to(room).emit('defaultPage');
  }

  private async handleAction(args: string, room: string) {
    const action = args[0];
    const params = args[1];

    switch (action) {
      case 'lastResults':
        await this.sendLastResults(room, params);
        break;
      case 'lastWinner':
        await this.sendLastWinner(room);
        break;
      case 'nextDraw':
        await this.sendNextDraw(room);
        break;
      case 'nextCategory':
        await this.sendNextCategory(room);
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
      case 'qrPage':
        await this.sendQrPage(room);
        break;
      case 'hideContent':
        await this.sendHideContent(room);
        break;
      default:
        console.error(`Acción desconocida: ${action}`);
    }
  }

  // Métodos separados para enviar datos a salas específicas
  private async sendLastResults(room: string, params) {
    const getParameter = (value) => (value === '' ? undefined : value);

    try {
      const results = await this.resultsService.getMany(
        getParameter(params.group),
        getParameter(params.resultType.toLowerCase()),
        getParameter(params.drawType.toLowerCase()),
        params.quantity,
        'DESC',
        ['participant', 'lot'],
      );

      const response = {
        results,
        params,
      };
      this.server.to(room).emit('lastResults', response);
    } catch (error) {
      console.error('Error al enviar últimos resultados:', error);
    }
  }

  private async sendLastWinner(room: string) {
    try {
      const lastWinner = await this.resultsService.getLastResult();
      this.server.to(room).emit('lastWinner', lastWinner);
    } catch (error) {
      console.error('Error al enviar el último ganador:', error);
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

  private async sendNextCategory(room: string) {
    try {
      const nextCategory = await this.resultsService.getNextDraw();
      this.server.to(room).emit('nextCategory', nextCategory);
    } catch (error) {
      console.error('Error al enviar la próxima categoría:', error);
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
    console.log('sendWinnerInfo', room, result);
    try {
      this.server.to(room).emit('winnerInfo', result);
    } catch (error) {
      console.error('Error al enviar el próximo lote:', error);
    }
  }

  private async sendQrPage(room: string) {
    try {
      this.server.to(room).emit('qrPage');
    } catch (error) {
      console.error('Error al enviar el qrPage:', error);
    }
  }

  private async sendHideContent(room: string) {
    try {
      this.server.to(room).emit('hideContent');
    } catch (error) {
      console.error('Error al enviar el hideContent:', error);
    }
  }
}

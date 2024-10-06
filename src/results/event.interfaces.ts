import { Result } from './entities/result.entity';

export interface ServerToClientEvents {
  lastResults: (response) => void; // Envía resultados de las consultas a las pantallas
  lastWinner: (result: Result) => void; // Envía resultados de las consultas a las pantallas
  nextDraw: (result) => void;
  nextCategory: (result) => void;
  fullInfo: (response) => void;
  winnerInfo: (response) => void;
  qrPage: () => void;
  hideContent: () => void;
  defaultPage: () => void; // Muestra una página predeterminada (por ejemplo, logo)
}

export interface ClientToServerEvents {
  joinRoom: (room: string) => void;
  mainScreenAction: (action: string) => void; // Acciones iniciadas desde la pantalla principal
  prompterAction: (action: string) => void; // Acciones iniciadas desde el prompter
  broadcastAction: (action: string) => void; // Acciones iniciadas desde la transmisión
}

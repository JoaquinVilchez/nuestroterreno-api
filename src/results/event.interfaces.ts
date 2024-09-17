// src/results/interfaces/events.interface.ts

import { Lot } from 'src/lots/entities/lot.entity';
import { Result } from './entities/result.entity';

export interface ServerToClientEvents {
  lastResults: (results: Result[]) => void; // Envía resultados de las consultas a las pantallas
  nextLot: (lot: Lot) => void; // Envía el siguiente lote a las pantallas
  defaultPage: () => void; // Muestra una página predeterminada (por ejemplo, logo)
}

export interface ClientToServerEvents {
  joinRoom: (room: string) => void;
  mainScreenAction: (action: string) => void; // Acciones iniciadas desde la pantalla principal
  prompterAction: (action: string) => void; // Acciones iniciadas desde el prompter
  broadcastAction: (action: string) => void; // Acciones iniciadas desde la transmisión
}

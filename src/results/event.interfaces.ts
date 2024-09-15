// src/results/interfaces/events.interface.ts

import { Lot } from 'src/lots/entities/lot.entity';
import { Result } from './entities/result.entity';

export interface ServerToClientEvents {
  lastResults: (results: Result[]) => void;
  nextLot: (lot: Lot) => void;
  defaultPage: () => void;
}

export interface ClientToServerEvents {
  joinRoom: (room: string) => void;
  requestLastResults: (quantity: number) => void;
  requestNextLot: () => void;
  requestDefaultPage: () => void;
}
